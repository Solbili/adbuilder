import type { CSSProperties } from "react";
import { SEDES, type SedeKey } from "@/lib/brand";

const TONES = {
  light: { t: "var(--ink)", b: "var(--body)", w: "var(--accent-ink)" },
  dark: { t: "#ffffff", b: "var(--dark-body)", w: "var(--accent)" },
  accent: { t: "var(--on-accent)", b: "var(--on-accent)", w: "var(--on-accent)" },
  photo: { t: "#ffffff", b: "#ffffff", w: "#ffffff" },
};

export interface SedeBlockProps {
  sede?: SedeKey | "ambas";
  /** block = stacked name/address/WhatsApp · inline = one line */
  layout?: "block" | "inline";
  tone?: keyof typeof TONES;
  s?: number;
  style?: CSSProperties;
}

/** Location block: sede name, address and WhatsApp. sede="ambas" lists both. */
export function SedeBlock({ sede = "ambas", layout = "block", tone = "light", s = 1, style }: SedeBlockProps) {
  const c = TONES[tone] || TONES.light;
  const keys: SedeKey[] = sede === "ambas" ? ["general-paz", "nueva-cordoba"] : [sede];
  const list = keys.map((k) => SEDES[k]).filter(Boolean);
  if (layout === "inline") {
    const txt = list.length > 1 ? "Dos sedes: General Paz y Nueva Córdoba" : `${list[0]?.nombre} · ${list[0]?.direccion}`;
    return <span style={{ fontFamily: "var(--font-text)", fontSize: 24 * s, lineHeight: 1.3, color: c.b, ...style }}>{txt}</span>;
  }
  return (
    <div style={{ display: "flex", gap: 40 * s, flexWrap: "wrap", ...style }}>
      {list.map((d) => (
        <div key={d.nombre} style={{ display: "flex", flexDirection: "column", gap: 8 * s }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 30 * s, lineHeight: 1.25, color: c.t }}>{d.nombre}</span>
          <span style={{ fontFamily: "var(--font-text)", fontSize: 24 * s, lineHeight: 1.4, color: c.b }}>{d.direccion}</span>
          <span style={{ fontFamily: "var(--font-text)", fontWeight: 600, fontSize: 24 * s, lineHeight: 1.4, color: c.w }}>WhatsApp {d.whatsapp}</span>
        </div>
      ))}
    </div>
  );
}
