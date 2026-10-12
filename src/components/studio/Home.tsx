"use client";

import { useState } from "react";
import { Kicker } from "@/components/ad/Kicker";
import { Headline } from "@/components/ad/Headline";
import { Button } from "@/components/ad/Button";
import { Generating } from "./Generating";
import { useGenerate } from "./useGenerate";

const SUGGESTIONS = ["Dame un reel sobre endodoncia", "Feed 4:5 de limpieza dental para Nueva Córdoba", "Campaña de ortodoncia para Google Display", "Story de odontopediatría para General Paz"];

export function Home({ warning }: { warning?: string }) {
  const [v, setV] = useState("");
  const { state, run, reset } = useGenerate();
  const submit = () => v.trim() && run(v.trim());

  if (state.status !== "idle") return <Generating state={state} onRetry={() => run(state.request)} onBack={reset} />;

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "96px 32px", display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Kicker size={13}>Meta · Google Ads</Kicker>
        <Headline size={56} text="¿Qué anuncio necesitás *hoy*?" />
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "var(--body)" }}>Escribí el pedido. El estudio arma las piezas en todos los formatos, con el copy y los campos listos para cargar en Ads Manager.</p>
      </div>
      {warning && <p className="card" style={{ margin: 0, padding: "14px 18px", fontSize: 14, lineHeight: 1.6, color: "var(--body)" }}>{warning}</p>}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line-strong)", borderRadius: 28, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <textarea
          aria-label="Pedido"
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && submit()}
          rows={3}
          placeholder="Ej.: Dame un reel sobre endodoncia para la sede de General Paz"
          style={{ border: 0, resize: "none", background: "none", font: "400 18px/1.6 var(--font-text)", color: "var(--ink)" }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "var(--muted2)", marginRight: "auto" }}>Formato, tratamiento, sede y objetivo. Lo que no digas, lo decide el estudio.</span>
          <Button size="web" onClick={submit} style={{ opacity: v.trim() ? 1 : 0.6 }}>Crear anuncio</Button>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => setV(s)} style={{ border: "1px solid var(--line-strong)", background: "var(--surface)", borderRadius: 999, padding: "10px 16px", font: "500 14px var(--font-text)", color: "var(--ink)", cursor: "pointer" }}>{s}</button>
        ))}
      </div>
    </main>
  );
}
