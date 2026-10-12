export type FormatInfo = { label: string; w: number; h: number; safeTop?: number; safeBottom?: number; logo?: boolean };

const FORMATS = {
  "meta-feed-1x1": { label: "Meta · Feed cuadrado", w: 1080, h: 1080 },
  "meta-feed-4x5": { label: "Meta · Feed vertical", w: 1080, h: 1350 },
  "meta-stories": { label: "Meta · Stories", w: 1080, h: 1920, safeTop: 250, safeBottom: 250 },
  "meta-reels": { label: "Meta · Reels", w: 1080, h: 1920, safeTop: 250, safeBottom: 420 },
  "google-display-191x1": { label: "Google · Display horizontal", w: 1200, h: 628 },
  "google-display-1x1": { label: "Google · Display cuadrado", w: 1200, h: 1200 },
  "google-display-4x5": { label: "Google · Display vertical", w: 960, h: 1200 },
  "google-demandgen-9x16": { label: "Google · Demand Gen vertical", w: 1080, h: 1920 },
  "google-logo-1x1": { label: "Google · Logo cuadrado", w: 1200, h: 1200, logo: true },
  "google-logo-4x1": { label: "Google · Logo horizontal", w: 1200, h: 300, logo: true },
} as const;

export type AdFormat = keyof typeof FORMATS;
export const AD_FORMATS: Record<AdFormat, FormatInfo> = FORMATS;
export const formatInfo = (f: AdFormat): FormatInfo => AD_FORMATS[f];

export const LAYOUTS = ["veil", "split", "flat", "dark"] as const;
export type Layout = (typeof LAYOUTS)[number];

/** «Feed vertical · 1080×1350» */
export function formatLabel(f: AdFormat) {
  const i = formatInfo(f);
  return `${i.label.split("· ")[1]} · ${i.w}×${i.h}`;
}
