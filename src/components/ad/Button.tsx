"use client";

import { useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";

const VARIANTS = {
  primary: { bg: "var(--accent)", hover: "var(--accent-hover)", fg: "var(--on-accent)", bd: "transparent" },
  secondary: { bg: "var(--surface)", hover: "var(--surface)", fg: "var(--ink)", bd: "var(--line-strong)" },
  onDark: { bg: "transparent", hover: "var(--dark-deep)", fg: "#ffffff", bd: "var(--dark-line3)" },
  dark: { bg: "var(--dark)", hover: "var(--dark-deep)", fg: "#ffffff", bd: "transparent" },
};

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  /** primary: #8cc3c8 + #1b2c31 text · secondary: white + #d4e8e9 border · onDark: #46595f border, white text · dark: #22343a + white */
  variant?: keyof typeof VARIANTS;
  /** ad = 84px tall on 1080 canvas (× s); web = site spec (min 44px, 15/26 padding) */
  size?: "ad" | "web";
  /** Canvas scale factor (canvas / 1080). Default 1 */
  s?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

/** Pill button. size="ad" is scaled for a 1080 canvas (multiply with s); size="web" is the site spec. */
export function Button({ variant = "primary", size = "ad", s = 1, children, style, disabled, ...rest }: ButtonProps) {
  const [hover, setHover] = useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const dims: CSSProperties = size === "web"
    ? { minHeight: 44, padding: "15px 26px", fontSize: 15 }
    : { height: 84 * s, padding: `0 ${48 * s}px`, fontSize: 30 * s };
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box",
        borderRadius: 999, border: `${Math.max(1, s)}px solid ${v.bd}`, background: hover && !disabled ? v.hover : v.bg, color: v.fg,
        fontFamily: "var(--font-text)", fontWeight: 600, lineHeight: 1, whiteSpace: "nowrap", textDecoration: "none",
        cursor: disabled ? "not-allowed" : "pointer", transition: "background .2s ease", flex: "none", ...dims, ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
