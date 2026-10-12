import { createElement, type CSSProperties, type ReactNode } from "react";

const TONES = {
  light: { c: "var(--ink)", i: "var(--accent-italic)" },
  dark: { c: "#ffffff", i: "var(--accent)" },
  accent: { c: "var(--on-accent)", i: "var(--on-accent)" },
  photo: { c: "#ffffff", i: "var(--accent-soft)" },
};
const LEVELS = {
  1: { size: 84, weight: 300, tracking: "-0.02em", leading: 1.08 },
  2: { size: 56, weight: 300, tracking: "-0.005em", leading: 1.15 },
  3: { size: 40, weight: 400, tracking: "0", leading: 1.25 },
};

export interface HeadlineProps {
  /** Copy. Wrap exactly one word in *asterisks* for the italic accent. */
  text?: string;
  /** 1 = H1 (84px @1080, Light, -0.02em) · 2 = H2 (56px, Light, -0.005em) · 3 = H3 (40px, Regular) */
  level?: 1 | 2 | 3;
  /** Surface the headline sits on. Sets ink + italic color. */
  tone?: keyof typeof TONES;
  /** Canvas scale (canvas / 1080). Default 1 */
  s?: number;
  /** Explicit font size in px (never below 72 for an ad H1 on 1080) */
  size?: number;
  style?: CSSProperties;
}

/** Jost Light headline. Wrap ONE word in *asterisks* to set it in Light italic teal. Extra italics are ignored. */
export function Headline({ text = "", level = 1, tone = "light", s = 1, size, style }: HeadlineProps) {
  const L = LEVELS[level] || LEVELS[1];
  const t = TONES[tone] || TONES.light;
  const parts: ReactNode[] = [];
  let used = false;
  String(text).split(/(\*[^*]+\*)/).forEach((p, i) => {
    if (!p) return;
    if (/^\*[^*]+\*$/.test(p)) {
      const w = p.slice(1, -1);
      if (used) { parts.push(w); return; }
      used = true;
      parts.push(<em key={i} style={{ fontStyle: "italic", fontWeight: 300, color: t.i }}>{w}</em>);
    } else parts.push(p);
  });
  return createElement(
    "h" + Math.min(3, Math.max(1, level)),
    {
      style: {
        margin: 0, fontFamily: "var(--font-display)", fontWeight: L.weight, letterSpacing: L.tracking, lineHeight: L.leading,
        fontSize: size ?? L.size * s, color: t.c, textWrap: "balance", ...style,
      },
    },
    parts,
  );
}
