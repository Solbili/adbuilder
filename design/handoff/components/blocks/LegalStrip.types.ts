import * as React from "react";
/** Legal strip slot. Confirm the exact text with the Colegio Odontológico de Córdoba before publishing. */
export interface LegalStripProps {
  director?: string;
  matricula?: string;
  /** Promo validity and conditions — mandatory if the piece mentions a price or promotion */
  extra?: string;
  tone?: "light" | "dark";
  s?: number;
  align?: "left" | "right" | "center";
  style?: React.CSSProperties;
}
export declare function LegalStrip(props: LegalStripProps): JSX.Element;
