import * as React from "react";
/**
 * Pill button in the four site variants.
 * @startingPoint section="Core" subtitle="Primary, secondary, on-dark, solid dark" viewport="700x300"
 */
export interface ButtonProps {
  /** primary: #8cc3c8 + #1b2c31 text · secondary: white + #d4e8e9 border · onDark: #46595f border, white text · dark: #22343a + white */
  variant?: "primary" | "secondary" | "onDark" | "dark";
  /** ad = 84px tall on 1080 canvas (× s); web = site spec (min 44px, 15/26 padding) */
  size?: "ad" | "web";
  /** Canvas scale factor (canvas / 1080). Default 1 */
  s?: number;
  href?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
