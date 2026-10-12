import * as React from "react";
/**
 * Brand headline: Jost Light, negative tracking, one italic teal word.
 * @startingPoint section="Core" subtitle="Jost Light headline with one italic word" viewport="700x260"
 */
export interface HeadlineProps {
  /** Copy. Wrap exactly one word in *asterisks* for the italic accent: "Viví la magia de una sonrisa *perfecta*." */
  text?: string;
  /** 1 = H1 (84px @1080, Light, -0.02em) · 2 = H2 (56px, Light, -0.005em) · 3 = H3 (40px, Regular) */
  level?: 1 | 2 | 3;
  /** Surface the headline sits on. Sets ink + italic color. */
  tone?: "light" | "dark" | "accent" | "photo";
  /** Canvas scale (canvas / 1080). Default 1 */
  s?: number;
  /** Explicit font size in px (never below 72 for an ad H1 on 1080) */
  size?: number;
  style?: React.CSSProperties;
}
export declare function Headline(props: HeadlineProps): JSX.Element;
