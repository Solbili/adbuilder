import * as React from "react";
/** Photo slot with focal point (drives 1:1, 4:5, 9:16 crops) and optional veil. */
export interface PhotoProps {
  /** Image URL. Empty → #cfe6e6 placeholder showing the focal point */
  src?: string;
  /** CSS object-position, e.g. "50% 35%". Define once per photo; all crops derive from it */
  focal?: string;
  /** true = #22343a 35→55% veil · number = flat opacity · [top, bottom] opacities (0.35–0.55) */
  veil?: boolean | number | [number, number];
  radius?: number;
  /** Placeholder label. Default "{foto}" */
  label?: string;
  s?: number;
  style?: React.CSSProperties;
}
export declare function Photo(props: PhotoProps): JSX.Element;
