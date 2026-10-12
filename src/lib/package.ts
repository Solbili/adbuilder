import { BRAND, SEDE_LABEL, whatsappFor } from "./brand";
import { AD_FORMATS, type AdFormat } from "./formats";
import { CTA_LABEL, reelDuration, type AdSpec, type SettingsRow } from "./spec";
import { LIMITS } from "./validate";

const strip = (s: string) => s.replace(/\*/g, "");
const n = (v: string, max?: number) => (max ? `  (${v.length}/${max})` : "");

/** Human-readable copy, field by field, in the order of Ads Manager / Google Ads. */
export function copyText(spec: AdSpec, settings: SettingsRow, request: string) {
  const wa = whatsappFor(spec.slots.sede, settings.default_sede);
  const lines: string[] = [];
  const field = (label: string, value: string, max?: number) => lines.push(`${label}${n(value, max)}`, value, "");
  lines.push("SMILE LAB · ANUNCIO", `Pedido: ${request}`, `Tratamiento: ${spec.treatment} · Tipo: ${spec.kind} · Layout: ${spec.layout} · Sede: ${SEDE_LABEL[spec.slots.sede]}`, "");

  lines.push("== META ADS MANAGER ==", "");
  field("Texto principal", spec.meta.primaryText, LIMITS.primaryText);
  field("Título", spec.meta.headline, LIMITS.headline);
  field("Descripción", spec.meta.description, LIMITS.description);
  field("Botón (call to action)", `${CTA_LABEL[spec.meta.callToAction]} · ${spec.meta.callToAction}`);
  field("Destino WhatsApp", `${wa.whatsapp} · ${wa.waLink}`);
  if (spec.kind === "reel") {
    if (spec.reel?.caption) field("Caption del reel", spec.reel.caption, LIMITS.caption);
    if (spec.reel?.audio) field("Audio sugerido (no incluido en el MP4)", spec.reel.audio);
    spec.frames.forEach((f, i) => field(`Escena ${i + 1} · ${f.durationSec ?? 3} s`, [strip(f.titular), f.cuerpo].filter(Boolean).join("\n")));
    lines.push(`Duración total: ${reelDuration(spec)} s`, "");
  }

  lines.push("== GOOGLE ADS ==", "");
  spec.google.headlines.forEach((h, i) => field(`Título ${i + 1}`, h, LIMITS.gHeadline));
  field("Título largo", spec.google.longHeadline, LIMITS.longHeadline);
  spec.google.descriptions.forEach((d, i) => field(`Descripción ${i + 1}`, d, LIMITS.gDescription));
  field("Nombre de la empresa", BRAND.brand);

  lines.push("== EN LA PIEZA ==", "");
  field("Kicker", spec.slots.kicker);
  if (spec.kind !== "reel") {
    field("Titular", strip(spec.frames[0].titular));
    if (spec.frames[0].cuerpo) field("Cuerpo", spec.frames[0].cuerpo);
  }
  field("Botón en la pieza", spec.slots.cta);
  field("Legales", `${BRAND.razonSocial} · Director odontológico: ${settings.director} · M.P. ${settings.matricula}${spec.legal.condiciones ? `\n${spec.legal.condiciones}` : ""}`);
  lines.push("Formatos:", ...spec.formats.map((f: AdFormat) => `- ${AD_FORMATS[f].label} · ${AD_FORMATS[f].w}×${AD_FORMATS[f].h}`));
  return lines.join("\n") + "\n";
}
