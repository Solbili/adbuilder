"use client";

import { useState } from "react";

export function Field({ label, value, max, mono, onChange, multiline = true }: { label: string; value: string; max?: number; mono?: boolean; onChange?: (v: string) => void; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);
  const over = !!max && value.length > max;
  const font = `400 15px/1.55 ${mono ? "ui-monospace, monospace" : "var(--font-text)"}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "14px 0", borderTop: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--muted2)" }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        {!!max && (
          <span style={{ color: over ? "var(--ink)" : "var(--accent-ink)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
            {over && <span aria-hidden style={{ width: 12, height: 12, borderRadius: 999, border: "1.5px solid var(--ink)", display: "inline-block" }} />}
            {value.length}/{max}{over && <span className="sr-only"> (se pasa del límite)</span>}
          </span>
        )}
        <button
          onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
          style={{ marginLeft: "auto", border: "1px solid var(--line-strong)", background: "var(--surface)", borderRadius: 999, padding: "5px 12px", font: "600 12px var(--font-text)", color: "var(--ink)", cursor: "pointer" }}
        >{copied ? "Copiado" : "Copiar"}</button>
      </div>
      {onChange ? (
        multiline ? (
          <textarea
            aria-label={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={Math.max(1, Math.ceil(value.length / 42))}
            style={{ border: 0, padding: 0, resize: "vertical", background: "none", font, color: "var(--ink)", width: "100%" }}
          />
        ) : (
          <input aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} style={{ border: 0, padding: 0, background: "none", font, color: "var(--ink)", width: "100%" }} />
        )
      ) : (
        <div style={{ font, color: "var(--ink)", overflowWrap: "anywhere" }}>{value}</div>
      )}
    </div>
  );
}
