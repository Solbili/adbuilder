import * as React from "react";
/**
 * Parametrized Meta / Google ad. Every format × 4 layouts from the same named slots.
 * @startingPoint section="Ads" subtitle="Ad template: format × layout with named slots" viewport="1100x520"
 */
export interface AdTemplateProps {
  /** Artboard size. Logo formats ignore layout and slots. */
  format?: "meta-feed-1x1" | "meta-feed-4x5" | "meta-stories" | "meta-reels" | "google-display-191x1" | "google-display-1x1" | "google-display-4x5" | "google-demandgen-9x16" | "google-logo-1x1" | "google-logo-4x1";
  /** veil = full photo + #22343a veil · split = 50/50 photo + #8cc3c8 block · flat = #f6fafa, big headline, small photo · dark = #22343a band */
  layout?: "veil" | "split" | "flat" | "dark";
  /** {titular} — wrap ONE word in *asterisks* for the italic teal word */
  titular?: string;
  /** {tratamiento} — kicker above the headline */
  kicker?: string;
  /** Optional supporting line (≤ 90 chars). Hidden on 1.91:1 */
  cuerpo?: string;
  /** {foto} — image URL; real clinic photos only */
  foto?: string;
  /** Focal point (CSS object-position). All crops derive from it */
  focal?: string;
  /** {sede} */
  sede?: "general-paz" | "nueva-cordoba" | "ambas" | null;
  /** {cta} — «Sacar turno» · «Consultar por WhatsApp» · «Ver tratamientos» */
  cta?: string;
  /** {legales} */
  director?: string;
  matricula?: string;
  /** Promo validity + conditions. Required if a price or promo appears */
  condiciones?: string;
  /** Show 9:16 safe-zone guides (never on export) */
  showGuides?: boolean;
  style?: React.CSSProperties;
}
export declare function AdTemplate(props: AdTemplateProps): JSX.Element;
