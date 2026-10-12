import { BRAND } from "./brand";
import { AD_FORMATS, LAYOUTS } from "./formats";
import type { AdSpec, PhotoRow, SettingsRow } from "./spec";

export interface Check {
  id: string;
  label: string;
  ok: boolean;
  note?: string;
  /** Blocks the download while failing. */
  blocking: boolean;
  /** The model can fix it (used to decide whether to send it back to Claude). */
  aiFixable: boolean;
}

const L = BRAND.limits;
export const LIMITS = {
  primaryText: L.metaPrimaryText,
  headline: L.metaHeadline,
  description: L.metaDescription,
  gHeadline: L.googleHeadline,
  longHeadline: L.googleLongHeadline,
  gDescription: L.googleDescription,
  caption: L.reelCaption,
  titular: 60,
  cuerpo: 90,
};

const FOLD: Record<string, string> = { a: "aá", e: "eé", i: "ií", o: "oó", u: "uúü", n: "nñ" };
const ACCENTED: Record<string, string> = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ü: "u", ñ: "n" };
const esc = (c: string) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Case-insensitive, and accent-insensitive in one direction only: an accented letter in the
 * pattern also matches the bare letter («últimos días» catches «ultimos dias»), but a bare
 * letter never matches an accented one, so «consulta por whatsapp» doesn't flag the voseo
 * «Consultá por WhatsApp».
 */
function patternRegex(p: string) {
  const src = [...p.toLowerCase()].map((c) => (ACCENTED[c] ? `[${FOLD[ACCENTED[c]]}]` : esc(c))).join("");
  return new RegExp(src, "i");
}
const BANNED = BRAND.bannedPatterns.map((p) => ({ p, re: patternRegex(p) }));

/** Neutral imperative at the start of a sentence, or followed by tu/tus/por/ahora/ya. */
const VOSEO = Object.entries(BRAND.voseoHints).map(([neutral, vos]) => ({
  neutral,
  vos,
  re: new RegExp(`(?:^|[.:;!?¡¿\\n]\\s*|\\s)(${neutral})(?=\\s+(?:tu|tus|por|ahora|ya)\\b)|(?:^|[.:;!?¡¿\\n]\\s*)(${neutral})(?![\\p{L}])`, "iu"),
}));

const PROMO = /\$|%|precio|promo|descuento|gratis/i;

export function allCopy(spec: AdSpec): string[] {
  return [
    spec.slots.kicker,
    ...spec.frames.flatMap((f) => [f.titular, f.cuerpo ?? ""]),
    spec.meta.primaryText, spec.meta.headline, spec.meta.description,
    ...spec.google.headlines, spec.google.longHeadline, ...spec.google.descriptions,
    spec.reel?.caption ?? "",
    spec.legal.condiciones,
  ].filter(Boolean);
}

const stripStars = (s: string) => s.replace(/\*/g, "");

export function validateSpec(spec: AdSpec, ctx: { photos: Pick<PhotoRow, "id" | "approved">[]; settings: Pick<SettingsRow, "director" | "matricula"> | null }): Check[] {
  const over: string[] = [];
  const lim = (name: string, v: string | undefined, max: number) => {
    const n = (v ?? "").length;
    if (n > max) over.push(`${name} ${n}/${max}`);
  };
  lim("Texto principal", spec.meta.primaryText, LIMITS.primaryText);
  lim("Título Meta", spec.meta.headline, LIMITS.headline);
  lim("Descripción Meta", spec.meta.description, LIMITS.description);
  spec.google.headlines.forEach((h, i) => lim(`Título Google ${i + 1}`, h, LIMITS.gHeadline));
  lim("Título largo", spec.google.longHeadline, LIMITS.longHeadline);
  spec.google.descriptions.forEach((d, i) => lim(`Descripción Google ${i + 1}`, d, LIMITS.gDescription));
  lim("Caption", spec.reel?.caption, LIMITS.caption);
  spec.frames.forEach((f, i) => {
    lim(`Titular ${spec.frames.length > 1 ? `escena ${i + 1}` : ""}`.trim(), stripStars(f.titular), LIMITS.titular);
    lim(`Cuerpo ${spec.frames.length > 1 ? `escena ${i + 1}` : ""}`.trim(), f.cuerpo, LIMITS.cuerpo);
  });

  const italics = spec.frames.map((f, i) => ({ i, n: (f.titular.match(/\*[^*]+\*/g) || []).length })).filter((x) => x.n > 1);

  const copy = allCopy(spec);
  const text = copy.join("\n");
  const exclam = /[!¡]/.test(text);
  const banned = BANNED.filter((b) => b.p !== "!" && b.p !== "¡" && b.re.test(text)).map((b) => `«${b.p.trim()}»`);
  const voseo = VOSEO.filter((v) => copy.some((c) => v.re.test(c))).map((v) => `«${v.neutral}» → «${v.vos}»`);
  const promo = PROMO.test(text.replace(spec.legal.condiciones, ""));

  const photo = ctx.photos.find((p) => p.id === spec.photo.id);
  const legalOk = !!ctx.settings?.director.trim() && !!ctx.settings?.matricula.trim();
  const badFormats = spec.formats.filter((f) => !(f in AD_FORMATS));
  const layoutOk = (LAYOUTS as readonly string[]).includes(spec.layout) && badFormats.length === 0;
  const reelFrames = spec.kind !== "reel" || (spec.frames.length >= 3 && spec.frames.length <= 5);

  return [
    { id: "limits", label: "Límites de caracteres", ok: over.length === 0, note: over.length ? `Se pasan: ${over.join(" · ")}` : undefined, blocking: true, aiFixable: true },
    { id: "italic", label: "Una sola palabra en itálica por pieza", ok: italics.length === 0, note: italics.length ? `Escena ${italics.map((x) => x.i + 1).join(", ")} tiene más de una` : undefined, blocking: false, aiFixable: true },
    { id: "exclamation", label: "Sin signos de exclamación", ok: !exclam, blocking: false, aiFixable: true },
    { id: "banned", label: "Sin promesa de resultado, lujo ni falsa urgencia", ok: banned.length === 0, note: banned.length ? `Aparece ${banned.join(", ")}` : undefined, blocking: false, aiFixable: true },
    { id: "voseo", label: "Voseo rioplatense", ok: voseo.length === 0, note: voseo.length ? voseo.join(" · ") : undefined, blocking: false, aiFixable: true },
    { id: "promo", label: "Precio o promo → condiciones en legales", ok: !promo || !!spec.legal.condiciones.trim(), note: promo && !spec.legal.condiciones.trim() ? "Falta vigencia y condiciones" : undefined, blocking: false, aiFixable: true },
    { id: "photo", label: "Foto propia de la clínica, aprobada", ok: !!photo?.approved, note: !photo ? `«${spec.photo.id}» no está en la biblioteca` : !photo.approved ? "La foto no está aprobada" : undefined, blocking: true, aiFixable: true },
    { id: "legal", label: "Legales: director y matrícula", ok: legalOk, note: legalOk ? undefined : "Falta cargar en Ajustes", blocking: true, aiFixable: false },
    { id: "layout", label: "Layout y formatos válidos", ok: layoutOk && reelFrames, note: !layoutOk ? `Formato desconocido: ${badFormats.join(", ")}` : !reelFrames ? "Un reel lleva de 3 a 5 escenas" : undefined, blocking: false, aiFixable: true },
  ];
}

export const failedIds = (checks: Check[]) => checks.filter((c) => !c.ok).map((c) => c.id);
export const downloadBlocked = (checks: Check[]) => checks.some((c) => !c.ok && c.blocking);
