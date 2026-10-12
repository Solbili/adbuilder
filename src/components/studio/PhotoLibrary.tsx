"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ad/Button";
import { Headline } from "@/components/ad/Headline";
import { Kicker } from "@/components/ad/Kicker";
import { Photo } from "@/components/ad/Photo";
import { TREATMENTS } from "@/lib/brand";
import { photoUrl } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";
import type { PhotoRow } from "@/lib/spec";

const slugify = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

type Draft = Omit<PhotoRow, "created_at"> & { src?: string; file?: File; isNew: boolean };

function FocalPicker({ src, focal, onChange }: { src?: string; focal: string; onChange: (f: string) => void }) {
  const [x, y] = focal.split(" ");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span className="label">Punto focal · hacé clic sobre lo importante de la foto</span>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Punto focal ${focal}`}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = Math.round(((e.clientX - r.left) / r.width) * 100), py = Math.round(((e.clientY - r.top) / r.height) * 100);
          onChange(`${Math.min(100, Math.max(0, px))}% ${Math.min(100, Math.max(0, py))}%`);
        }}
        onKeyDown={(e) => {
          const step = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key];
          if (!step) return;
          e.preventDefault();
          const nx = Math.min(100, Math.max(0, parseInt(x) + step[0])), ny = Math.min(100, Math.max(0, parseInt(y) + step[1]));
          onChange(`${nx}% ${ny}%`);
        }}
        style={{ position: "relative", cursor: "crosshair", borderRadius: 16, overflow: "hidden", background: "var(--photo)", lineHeight: 0 }}
      >
        {src
          // eslint-disable-next-line @next/next/no-img-element -- local object URL or storage URL, shown uncropped
          ? <img src={src} alt="" style={{ width: "100%", height: "auto", display: "block", maxHeight: 420, objectFit: "contain" }} />
          : <div style={{ height: 240 }} />}
        <span style={{ position: "absolute", left: x, top: y, width: 28, height: 28, marginLeft: -14, marginTop: -14, borderRadius: 999, border: "2px solid #fff", boxShadow: "0 0 0 2px var(--dark)" }} />
      </div>
      <span style={{ fontSize: 12, color: "var(--muted2)" }}>Foco {focal}</span>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
        {([["1:1", "1 / 1", 96], ["4:5", "4 / 5", 96], ["9:16", "9 / 16", 96]] as const).map(([l, ar, hgt]) => (
          <div key={l} style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
            <Photo src={src} focal={focal} radius={8} label={l} style={{ height: hgt * (l === "9:16" ? 1.4 : 1), aspectRatio: ar }} />
            <span style={{ fontSize: 11, color: "var(--muted2)" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PhotoLibrary({ initial }: { initial: PhotoRow[] }) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const openNew = (file: File) => {
    setMsg("");
    setDraft({ id: slugify(file.name) || `foto-${Date.now()}`, file_path: "", treatments: [], tags: [], focal: "50% 50%", alt: "", approved: false, file, src: URL.createObjectURL(file), isNew: true });
  };
  const openExisting = (p: PhotoRow) => { setMsg(""); setDraft({ ...p, src: photoUrl(p.file_path), isNew: false }); };

  async function save() {
    if (!draft) return;
    const supabase = createClient();
    if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(draft.id)) return setMsg("El id usa minúsculas, números y guiones (2 a 63 caracteres).");
    setBusy(true);
    setMsg("");
    let file_path = draft.file_path;
    if (draft.file) {
      const ext = draft.file.type === "image/png" ? "png" : draft.file.type === "image/webp" ? "webp" : "jpg";
      file_path = `${draft.id}-${Date.now().toString(36)}.${ext}`;
      const up = await supabase.storage.from("photos").upload(file_path, draft.file, { contentType: draft.file.type, cacheControl: "31536000" });
      if (up.error) { setBusy(false); return setMsg(`No se pudo subir la foto: ${up.error.message}`); }
    }
    const row = { id: draft.id, file_path, treatments: draft.treatments, tags: draft.tags, focal: draft.focal, alt: draft.alt.trim(), approved: draft.approved };
    const res = draft.isNew ? await supabase.from("photos").insert(row).select().single<PhotoRow>() : await supabase.from("photos").update(row).eq("id", draft.id).select().single<PhotoRow>();
    setBusy(false);
    if (res.error) return setMsg(res.error.code === "23505" ? "Ya existe una foto con ese id." : `No se pudo guardar: ${res.error.message}`);
    setPhotos((ps) => [res.data, ...ps.filter((p) => p.id !== res.data.id)]);
    setDraft(null);
    router.refresh();
  }

  async function remove() {
    if (!draft || draft.isNew || !confirm(`¿Borrar la foto «${draft.id}»? Los anuncios que la usan quedan sin foto.`)) return;
    const supabase = createClient();
    setBusy(true);
    const { error } = await supabase.from("photos").delete().eq("id", draft.id);
    if (!error && draft.file_path) await supabase.storage.from("photos").remove([draft.file_path]);
    setBusy(false);
    if (error) return setMsg(`No se pudo borrar: ${error.message}`);
    setPhotos((ps) => ps.filter((p) => p.id !== draft.id));
    setDraft(null);
  }

  const toggleTreatment = (t: string) => draft && setDraft({ ...draft, treatments: draft.treatments.includes(t) ? draft.treatments.filter((x) => x !== t) : [...draft.treatments, t] });

  return (
    <main className="page">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Kicker size={13}>Fotos</Kicker>
        <Headline size={44} text="Fotos de la *clínica*." />
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "var(--body)", maxWidth: 720 }}>Solo fotos propias: tratamientos, recepción, equipo. Nada de stock ni imágenes generadas. El estudio usa únicamente las fotos aprobadas.</p>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label className="pill" style={{ background: "var(--accent)", borderColor: "transparent", color: "var(--on-accent)", padding: "12px 20px", fontSize: 14 }}>
          Subir foto
          <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) openNew(f); e.target.value = ""; }} />
        </label>
        <span style={{ fontSize: 13, color: "var(--muted2)" }}>JPG, PNG o WebP hasta 15 MB. Mejor si el lado corto mide 1920 px o más.</span>
      </div>

      {draft && (
        <div className="card" style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
          <FocalPicker src={draft.src} focal={draft.focal} onChange={(focal) => setDraft({ ...draft, focal })} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label><span className="label">Id (lo usa la IA para elegirla)</span><input className="input" value={draft.id} disabled={!draft.isNew} onChange={(e) => setDraft({ ...draft, id: e.target.value.toLowerCase() })} /></label>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="label">Tratamientos</legend>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TREATMENTS.map((t) => <button key={t} type="button" className="toggle" data-active={draft.treatments.includes(t)} style={{ border: "1px solid var(--line-strong)" }} onClick={() => toggleTreatment(t)}>{t}</button>)}
              </div>
            </fieldset>
            <label><span className="label">Etiquetas (separadas por coma)</span><input className="input" value={draft.tags.join(", ")} onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} placeholder="recepción, equipo, brackets" /></label>
            <label><span className="label">Descripción breve</span><input className="input" value={draft.alt} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} placeholder="Tratamiento con aislación absoluta" /></label>
            <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 15 }}>
              <input type="checkbox" checked={draft.approved} onChange={(e) => setDraft({ ...draft, approved: e.target.checked })} />
              Aprobada para anuncios
            </label>
            {msg && <p role="alert" style={{ margin: 0, fontSize: 14 }}>{msg}</p>}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: "auto" }}>
              <Button size="web" onClick={save} disabled={busy}>{busy ? "Guardando…" : "Guardar"}</Button>
              <Button size="web" variant="secondary" onClick={() => setDraft(null)} disabled={busy}>Cancelar</Button>
              {!draft.isNew && <Button size="web" variant="secondary" onClick={remove} disabled={busy} style={{ marginLeft: "auto" }}>Borrar</Button>}
            </div>
          </div>
        </div>
      )}

      {photos.length === 0 && !draft && <p className="muted" style={{ margin: 0 }}>Todavía no hay fotos.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {photos.map((p) => (
          <button key={p.id} onClick={() => openExisting(p)} className="card card-hover" style={{ padding: 10, cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 8, font: "inherit", color: "var(--ink)" }}>
            <Photo src={photoUrl(p.file_path)} focal={p.focal} label={p.id} radius={12} style={{ width: "100%", aspectRatio: "4 / 5" }} />
            <span style={{ fontSize: 14, fontWeight: 600, overflowWrap: "anywhere" }}>{p.id}</span>
            <span style={{ fontSize: 12, color: "var(--muted2)" }}>{p.treatments.join(" · ") || "Sin tratamiento"}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: p.approved ? "var(--accent-ink)" : "var(--muted2)" }}>{p.approved ? "Aprobada" : "Sin aprobar"}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
