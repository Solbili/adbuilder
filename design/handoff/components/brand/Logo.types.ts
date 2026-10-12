import * as React from "react";
/**
 * Smile Lab logo: clean symbol (no inner "SMILE LAB") with Jost wordmark.
 * @startingPoint section="Brand" subtitle="Logo lockup, symbol and stacked" viewport="700x260"
 */
export interface LogoProps {
  /** lockup = symbol + wordmark side by side; symbol = mark only; stacked = wordmark under symbol */
  variant?: "lockup" | "symbol" | "stacked";
  /** Symbol height in px. Min 48 on a 1080 canvas. Default 48 */
  size?: number;
  /** light = ink wordmark (for #f6fafa / #fff); dark = white wordmark (for #22343a) */
  tone?: "light" | "dark";
  style?: React.CSSProperties;
}
export declare function Logo(props: LogoProps): JSX.Element;
