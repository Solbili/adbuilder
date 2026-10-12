"use client";

import { useState } from "react";
import { Button } from "@/components/ad/Button";
import { Headline } from "@/components/ad/Headline";
import { Kicker } from "@/components/ad/Kicker";
import { LegalStrip } from "@/components/ad/LegalStrip";
import { SEDE_LABEL, type SedeSlot } from "@/lib/brand";
import { createClient } from "@/lib/supabase/client";
import { MODELS, type SettingsRow } from "@/lib/spec";

export function SettingsForm({ initial }: { initial: SettingsRow }) {
  const [s, setS] = useState(initial);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof SettingsRow) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setS({ ...s, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await createClient().from("settings").update({ director: s.director.trim(), matricula: s.matricula.trim(), default_sede: s.default_sede, model: s.model, updated_at: new Date().toISOString() }).eq("id", 1);
    setBusy(false);
    setMsg(error ? "No se pudo guardar." : "Guardado.");
  }

  return (
    <main className="page" style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Kicker size={13}>Ajustes</Kicker>
        <Headline size={44} text="Datos de la *clínica*." />
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "var(--body)" }}>El director odontológico y la matrícula van en los legales de cada pieza. Sin ellos no se puede descargar. Confirmá el texto con el Colegio Odontológico de Córdoba.</p>
      </div>
      <form onSubmit={save} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <label><span className="label">Director odontológico</span><input className="input" value={s.director} onChange={set("director")} placeholder="Nombre y apellido" /></label>
        <label><span className="label">Matrícula (M.P.)</span><input className="input" value={s.matricula} onChange={set("matricula")} placeholder="Número" /></label>
        <label><span className="label">Sede por defecto (destino de WhatsApp cuando el anuncio es para ambas)</span>
          <select className="input" value={s.default_sede} onChange={set("default_sede")}>
            {(Object.keys(SEDE_LABEL) as SedeSlot[]).map((k) => <option key={k} value={k}>{SEDE_LABEL[k]}</option>)}
          </select>
        </label>
        <label><span className="label">Modelo de IA</span>
          <select className="input" value={s.model} onChange={set("model")}>
            {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="label">Así se ve en la pieza</span>
          <LegalStrip director={s.director || undefined} matricula={s.matricula || undefined} s={0.8} />
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Button size="web" type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</Button>
          <span aria-live="polite" style={{ fontSize: 14, color: "var(--muted2)" }}>{msg}</span>
        </div>
      </form>
    </main>
  );
}
