import * as React from "react";
/**
 * Treatment card (white surface, #e6f1f1 border, 22px site radius → 38px on 1080).
 * @startingPoint section="Blocks" subtitle="Treatment card with photo" viewport="700x420"
 */
export interface TreatmentCardProps {
  /** e.g. "Limpieza dental", "Endodoncia", "Ortodoncia", "Blanqueamiento", "Odontopediatría", "Caries y restauraciones" */
  tratamiento?: string;
  descripcion?: string;
  kicker?: string;
  foto?: string;
  focal?: string;
  s?: number;
  style?: React.CSSProperties;
}
export declare function TreatmentCard(props: TreatmentCardProps): JSX.Element;
