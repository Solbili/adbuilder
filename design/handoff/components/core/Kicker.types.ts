import * as React from "react";
/** Uppercase overline above a headline (usually the treatment name). */
export interface KickerProps {
  children?: React.ReactNode;
  /** light → #3c757c · dark → #8cc3c8 · accent → #1b2c31 · photo → white (only over the veil) */
  tone?: "light" | "dark" | "accent" | "photo";
  /** Canvas scale (canvas / 1080). Default 1 → 22px */
  s?: number;
  /** Explicit font size in px (overrides s) */
  size?: number;
  style?: React.CSSProperties;
}
export declare function Kicker(props: KickerProps): JSX.Element;
