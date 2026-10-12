"use client";

import { Kicker } from "@/components/ad/Kicker";
import { Headline } from "@/components/ad/Headline";
import { Button } from "@/components/ad/Button";
import type { GenerateState } from "./useGenerate";

const STEPS = ["Interpretando el pedido", "Escribiendo el copy", "Eligiendo foto y layout", "Validando reglas de marca", "Renderizando formatos"];

export function Generating({ state, onRetry, onBack }: { state: GenerateState; onRetry: () => void; onBack: () => void }) {
  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "120px 32px", display: "flex", flexDirection: "column", gap: 28 }}>
      <Kicker size={13}>{state.parentId ? "Aplicando el cambio" : "Creando"}</Kicker>
      <Headline level={2} size={36} text={`«${state.request.replace(/\*/g, "")}»`} />
      {state.status === "error" ? (
        <div role="alert" className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>{state.error}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button size="web" onClick={onRetry}>Reintentar</Button>
            <Button size="web" variant="secondary" onClick={onBack}>Volver</Button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: "8px 24px" }} aria-live="polite">
          {STEPS.map((s, i) => {
            const st = state.step;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: i ? "1px solid var(--line)" : 0, fontSize: 15, color: i <= st ? "var(--ink)" : "var(--muted2)" }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, flex: "none", background: i < st ? "var(--accent-ink)" : i === st ? "var(--accent)" : "var(--line-strong)", animation: i === st ? "slpulse 1s infinite" : "none" }} />
                {s}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
