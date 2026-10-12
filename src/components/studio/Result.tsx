"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AdTemplate } from "@/components/ad/AdTemplate";
import { Button } from "@/components/ad/Button";
import { Kicker } from "@/components/ad/Kicker";
import { Scaled } from "@/components/ad/Scaled";
import { createClient } from "@/lib/supabase/client";
import { whatsappFor } from "@/lib/brand";
import { AD_FORMATS, LAYOUTS, formatLabel, type AdFormat } from "@/lib/formats";
import { photoFor, photoUrl } from "@/lib/photos";
import { CTA_LABEL, reelDuration, type AdRow, type AdSpec, type PhotoRow, type SettingsRow } from "@/lib/spec";
import { LIMITS, downloadBlocked, validateSpec } from "@/lib/validate";
import { Checklist } from "./Checklist";
import { Field } from "./Field";
import { Generating } from "./Generating";
import { PhotoPicker } from "./PhotoPicker";
import { useGenerate } from "./useGenerate";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(806);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export function Result({ ad, parent, photos, settings }: { ad: AdRow & { spec: AdSpec }; parent: { id: string; request: string } | null; photos: PhotoRow[]; settings: SettingsRow }) {
  const [spec, setSpec] = useState<AdSpec>(ad.spec);
  const [fmt, setFmt] = useState<AdFormat>(ad.spec.formats[0]);
  const [frame, setFrame] = useState(0);
  const [tab, setTab] = useState<"meta" | "google">(ad.spec.platform);
  const [guides, setGuides] = useState(false);
  const [refine, setRefine] = useState("");
  const [picker, setPicker] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [exporting, setExporting] = useState("");
  const [exportNote, setExportNote] = useState("");
  const { state: gen, run, reset } = useGenerate();
  const [previewRef, previewW] = useWidth<HTMLDivElement>();

  const checks = useMemo(() => validateSpec(spec, { photos, settings }), [spec, photos, settings]);
  const blocked = downloadBlocked(checks);
  const libPhoto = photoFor(photos, spec.photo.id);
  const focal = spec.photo.focal ?? libPhoto?.focal ?? "50% 50%";
  const foto = photoUrl(libPhoto?.file_path);
  const f = spec.frames[frame] ?? spec.frames[0];
  const isReel = spec.kind === "reel" && spec.frames.length > 1;
  const wa = whatsappFor(spec.slots.sede, settings.default_sede);
  const fi = AD_FORMATS[fmt];
  const slots = { layout: spec.layout, kicker: spec.slots.kicker, sede: spec.slots.sede, cta: spec.slots.cta, foto, focal, director: settings.director, matricula: settings.matricula, condiciones: spec.legal.condiciones || undefined };

  // Autosave edits (debounced). Only text fields, layout and photo change client-side.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setSaveState("saving");
    const t = setTimeout(async () => {
      const failed = checks.filter((c) => !c.ok).map((c) => c.id);
      const { error } = await createClient().from("ads").update({ spec, failed_checks: failed, status: checks.some((c) => !c.ok && c.aiFixable) ? "flagged" : "ready" }).eq("id", ad.id);
      setSaveState(error ? "error" : "saved");
    }, 700);
    return () => clearTimeout(t);
  }, [spec, checks, ad.id]);

  const edit = (fn: (s: AdSpec) => AdSpec) => setSpec((s) => fn(structuredClone(s)));

  async function download() {
    if (blocked || exporting) return;
    setExportNote("");
    try {
      const { buildPackage, downloadBlob } = await import("@/lib/export");
      const { blob, notes } = await buildPackage({ adId: ad.id, request: ad.request, spec, settings, photoSrc: foto, focal, onProgress: setExporting });
      const slug = spec.treatment.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      downloadBlob(blob, `smile-lab-${slug}-${spec.kind}-${ad.id.slice(0, 8)}.zip`);
      setExportNote(notes.join(" "));
    } catch (err) {
      console.error(err);
      setExportNote("No se pudo armar el paquete. Revisá que la foto cargue y reintentá.");
    } finally {
      setExporting("");
    }
  }

  if (gen.status !== "idle") return <Generating state={gen} onRetry={() => run(gen.request, ad.id)} onBack={reset} />;

  const maxW = Math.min(806, previewW - (isReel ? 304 : 0));
  return (
    <main className="result-grid">
      <section style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Kicker size={12}>{spec.treatment} · {spec.kind}</Kicker>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 30, letterSpacing: "-.01em", lineHeight: 1.2 }}>«{ad.request}»</div>
          {parent && <div style={{ fontSize: 13, color: "var(--muted2)" }}>Cambio sobre <Link href={`/ads/${parent.id}`}>«{parent.request}»</Link></div>}
          <div style={{ fontSize: 14, color: "var(--body)", lineHeight: 1.6 }}>{spec.rationale}</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {spec.formats.map((k) => <button key={k} className="pill" data-active={fmt === k} onClick={() => setFmt(k)}>{formatLabel(k)}</button>)}
          <span style={{ width: 1, height: 24, background: "var(--line-strong)", margin: "0 4px" }} />
          {LAYOUTS.map((l) => <button key={l} className="toggle" data-active={spec.layout === l} onClick={() => edit((s) => ({ ...s, layout: l }))}>{l}</button>)}
          {fi.safeTop ? <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, color: "var(--body)", marginLeft: 8 }}><input type="checkbox" checked={guides} onChange={(e) => setGuides(e.target.checked)} />Zonas seguras</label> : null}
        </div>

        <div ref={previewRef} style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          <Scaled format={fmt} maxH={620} maxW={Math.max(240, maxW)}>
            <AdTemplate format={fmt} {...slots} titular={f.titular} cuerpo={f.cuerpo} showGuides={guides} />
          </Scaled>
          {isReel && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted2)" }}>Escenas del reel · {reelDuration(spec)} s</span>
              {spec.frames.map((x, i) => (
                <button key={i} onClick={() => setFrame(i)} style={{ display: "flex", gap: 12, alignItems: "center", border: "1px solid " + (i === frame ? "var(--accent-ink)" : "var(--line)"), background: "var(--surface)", borderRadius: 16, padding: 8, cursor: "pointer", textAlign: "left", width: 280 }}>
                  <Scaled format={fmt} maxH={96} radius={6}><AdTemplate format={fmt} {...slots} titular={x.titular} cuerpo={x.cuerpo} /></Scaled>
                  <span style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--ink)" }}>
                    <b style={{ fontWeight: 600 }}>Escena {i + 1} · {x.durationSec ?? 3} s</b>
                    <span style={{ color: "var(--body)" }}>{x.titular.replace(/\*/g, "")}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {!fi.logo && (
          <div className="card" style={{ padding: "4px 22px 8px" }}>
            <Field label={isReel ? `Titular · escena ${frame + 1}` : "Titular"} value={f.titular} max={LIMITS.titular + (f.titular.match(/\*/g)?.length ?? 0)} multiline={false} onChange={(v) => edit((s) => { s.frames[frame].titular = v; return s; })} />
            <Field label="Cuerpo" value={f.cuerpo ?? ""} max={LIMITS.cuerpo} multiline={false} onChange={(v) => edit((s) => { s.frames[frame].cuerpo = v; return s; })} />
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--muted2)" }}>Una palabra entre *asteriscos* sale en itálica teal.</p>
          </div>
        )}

        <div style={{ fontSize: 13, color: "var(--muted2)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span>Foto: <b style={{ fontWeight: 600, color: "var(--ink)" }}>{spec.photo.id}</b> · foco {focal}{!libPhoto && " — no está en la biblioteca"}</span>
          <button className="pill" onClick={() => setPicker((p) => !p)}>Cambiar foto</button>
        </div>
        {picker && <PhotoPicker photos={photos} treatment={spec.treatment} current={spec.photo.id} onClose={() => setPicker(false)} onPick={(p) => { edit((s) => ({ ...s, photo: { id: p.id } })); setPicker(false); }} />}

        <form onSubmit={(e) => { e.preventDefault(); if (refine.trim()) run(refine.trim(), ad.id); }} style={{ background: "var(--surface)", border: "1px solid var(--line-strong)", borderRadius: 999, padding: "6px 6px 6px 22px", display: "flex", gap: 14, alignItems: "center" }}>
          <input aria-label="Pedir un cambio" value={refine} onChange={(e) => setRefine(e.target.value)} placeholder="Pedí un cambio: «titular más corto», «usá la sede de Nueva Córdoba»…" style={{ flex: 1, border: 0, background: "none", font: "400 15px var(--font-text)", color: "var(--ink)", minWidth: 0 }} />
          <Button size="web" type="submit" style={{ opacity: refine.trim() ? 1 : 0.6 }}>Aplicar</Button>
        </form>
      </section>

      <aside style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
        <div className="card" style={{ padding: "18px 22px 8px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
            {([["meta", "Meta Ads Manager"], ["google", "Google Ads"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ border: 0, borderRadius: 999, padding: "8px 14px", font: "600 13px var(--font-text)", cursor: "pointer", background: tab === k ? "var(--dark)" : "transparent", color: tab === k ? "#fff" : "var(--ink)", transition: "background .2s ease" }}>{l}</button>
            ))}
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted2)" }} aria-live="polite">{saveState === "saving" ? "Guardando…" : saveState === "error" ? "No se guardó" : "Guardado"}</span>
          </div>
          {tab === "meta" ? (
            <>
              <Field label="Texto principal" value={spec.meta.primaryText} max={LIMITS.primaryText} onChange={(v) => edit((s) => { s.meta.primaryText = v; return s; })} />
              <Field label="Título" value={spec.meta.headline} max={LIMITS.headline} onChange={(v) => edit((s) => { s.meta.headline = v; return s; })} />
              <Field label="Descripción" value={spec.meta.description} max={LIMITS.description} onChange={(v) => edit((s) => { s.meta.description = v; return s; })} />
              <Field label="Botón (call to action)" value={`${CTA_LABEL[spec.meta.callToAction]} · ${spec.meta.callToAction}`} />
              <Field label="Destino WhatsApp" value={`${wa.whatsapp} · ${wa.waLink}`} mono />
              {spec.kind === "reel" && <Field label="Caption del reel" value={spec.reel?.caption ?? ""} max={LIMITS.caption} onChange={(v) => edit((s) => ({ ...s, reel: { ...s.reel, caption: v } }))} />}
              {spec.kind === "reel" && <Field label="Audio sugerido" value={spec.reel?.audio ?? ""} onChange={(v) => edit((s) => ({ ...s, reel: { ...s.reel, audio: v } }))} />}
            </>
          ) : (
            <>
              {spec.google.headlines.map((h, i) => <Field key={`h${i}`} label={`Título ${i + 1}`} value={h} max={LIMITS.gHeadline} onChange={(v) => edit((s) => { s.google.headlines[i] = v; return s; })} />)}
              <Field label="Título largo" value={spec.google.longHeadline} max={LIMITS.longHeadline} onChange={(v) => edit((s) => { s.google.longHeadline = v; return s; })} />
              {spec.google.descriptions.map((h, i) => <Field key={`d${i}`} label={`Descripción ${i + 1}`} value={h} max={LIMITS.gDescription} onChange={(v) => edit((s) => { s.google.descriptions[i] = v; return s; })} />)}
              <Field label="Nombre de la empresa" value="Smile Lab" />
            </>
          )}
          <Field label="Condiciones (legales)" value={spec.legal.condiciones} max={160} onChange={(v) => edit((s) => { s.legal.condiciones = v; return s; })} />
        </div>

        <Checklist checks={checks} />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Button size="web" variant="dark" onClick={download} disabled={blocked || !!exporting} style={{ width: "100%", opacity: blocked ? 0.5 : 1 }}>
            {exporting ? "Preparando…" : "Descargar paquete (.zip)"}
          </Button>
          <span style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.5 }} aria-live="polite">
            {exporting || exportNote || (blocked
              ? "Para descargar, resolvé los puntos del checklist que bloquean: límites de caracteres, foto aprobada y legales."
              : spec.kind === "reel" ? "MP4 1080×1920 + PNG por escena + copy.txt + ad.json" : `${spec.formats.length} PNG a tamaño real + copy.txt + ad.json`)}
          </span>
        </div>
      </aside>
    </main>
  );
}
