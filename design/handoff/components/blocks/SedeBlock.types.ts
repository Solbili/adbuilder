import * as React from "react";
/** Sede block: name + address + WhatsApp, with real data for both clinics. */
export interface SedeBlockProps {
  sede?: "general-paz" | "nueva-cordoba" | "ambas";
  /** block = stacked name/address/WhatsApp · inline = one line */
  layout?: "block" | "inline";
  tone?: "light" | "dark" | "accent" | "photo";
  s?: number;
  style?: React.CSSProperties;
}
export declare function SedeBlock(props: SedeBlockProps): JSX.Element;
