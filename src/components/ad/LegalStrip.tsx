import type { CSSProperties } from "react";

export interface LegalStripProps {
  director?: string;
  matricula?: string;
  /** Promo validity and conditions — mandatory if the piece mentions a price or promotion */
  extra?: string;
  tone?: "light" | "dark";
  s?: number;
  align?: "left" | "right" | "center";
  style?: CSSProperties;
}

/** Legal line: dental director + license, razón social, promo conditions. Required on every ad. */
export function LegalStrip({ director = "{director}", matricula = "{matrícula}", extra, tone = "light", s = 1, align = "left", style }: LegalStripProps) {
  const color = tone === "dark" ? "var(--dark-body)" : "var(--muted2)";
  const fs = Math.max(13, 18 * s);
  return (
    <div style={{ fontFamily: "var(--font-text)", fontSize: fs, lineHeight: 1.4, color, textAlign: align, display: "flex", flexDirection: "column", gap: 2 * s, minWidth: 0, ...style }}>
      <span>Smile Lab Odontología · Director odontológico: {director} · M.P. {matricula}</span>
      {extra && <span>{extra}</span>}
    </div>
  );
}
