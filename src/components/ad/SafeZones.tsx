import type { CSSProperties } from "react";

export interface SafeZonesProps {
  top?: number;
  bottom?: number;
  label?: string;
  s?: number;
}

/** Visible guides for 9:16 safe zones. Overlay only — never exported in the final asset. */
export function SafeZones({ top = 250, bottom = 250, label = "Zona segura", s = 1 }: SafeZonesProps) {
  const zone: CSSProperties = {
    position: "absolute", left: 0, right: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center",
    background: "repeating-linear-gradient(135deg, rgba(34,52,58,.16) 0 14px, rgba(255,255,255,.16) 14px 28px)",
  };
  const tag: CSSProperties = { fontFamily: "var(--font-text)", fontWeight: 600, fontSize: 22 * s, color: "#fff", background: "var(--dark)", padding: `${8 * s}px ${16 * s}px`, borderRadius: 999 };
  return (
    <>
      <div style={{ ...zone, top: 0, height: top, borderBottom: "3px dashed var(--dark)" }}><span style={tag}>{label} · {top}px libres</span></div>
      <div style={{ ...zone, bottom: 0, height: bottom, borderTop: "3px dashed var(--dark)" }}><span style={tag}>{label} · {bottom}px libres</span></div>
    </>
  );
}
