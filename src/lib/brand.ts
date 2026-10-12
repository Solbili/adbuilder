import brandJson from "./brand.json";

export const BRAND = brandJson;
export type SedeKey = "general-paz" | "nueva-cordoba";
export type SedeSlot = SedeKey | "ambas";

export const SEDES: Record<SedeKey, { nombre: string; direccion: string; whatsapp: string; waLink: string }> = brandJson.sedes;

export const TREATMENTS = ["Limpieza dental", "Endodoncia", "Caries y restauraciones", "Ortodoncia", "Blanqueamiento", "Odontopediatría", "General"] as const;
export type Treatment = (typeof TREATMENTS)[number];

export const SEDE_LABEL: Record<SedeSlot, string> = { ambas: "Ambas sedes", "general-paz": "General Paz", "nueva-cordoba": "Nueva Córdoba" };

/** WhatsApp destination for Meta: the ad's sede, or the default sede when the ad covers both. */
export function whatsappFor(sede: SedeSlot, defaultSede: SedeSlot) {
  const key: SedeKey = sede !== "ambas" ? sede : defaultSede !== "ambas" ? defaultSede : "general-paz";
  return SEDES[key];
}
