import type { CSSProperties, ReactNode } from "react";

const COLORS = { light: "var(--accent-ink)", dark: "var(--accent)", accent: "var(--on-accent)", photo: "#ffffff" };

export interface KickerProps {
  children?: ReactNode;
  /** light → #3c757c · dark → #8cc3c8 · accent → #1b2c31 · photo → white (only over the veil) */
  tone?: keyof typeof COLORS;
  /** Canvas scale (canvas / 1080). Default 1 → 22px */
  s?: number;
  /** Explicit font size in px (overrides s) */
  size?: number;
  style?: CSSProperties;
}

/** Overline: Jost 400 uppercase, +0.24em. */
export function Kicker({ children, tone = "light", s = 1, size, style }: KickerProps) {
  return (
    <span style={{
      display: "block", fontFamily: "var(--font-display)", fontWeight: 400, textTransform: "uppercase",
      letterSpacing: "0.24em", lineHeight: 1, fontSize: size ?? 22 * s, color: COLORS[tone] || COLORS.light, ...style,
    }}>{children}</span>
  );
}
