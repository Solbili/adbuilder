import type { AdFormat, Layout } from "./formats";
import type { SedeSlot, Treatment } from "./brand";

/** Mirrors ad-spec.schema.json (the create_ad tool's input_schema). */
export interface AdSpec {
  kind: "feed" | "story" | "reel" | "google" | "pmax";
  platform: "meta" | "google";
  objective?: "volumen" | "consideracion" | "segmento";
  treatment: Treatment;
  layout: Layout;
  formats: AdFormat[];
  photo: { id: string; focal?: string };
  slots: { kicker: string; cta: "Sacar turno" | "Consultar por WhatsApp" | "Ver tratamientos"; sede: SedeSlot };
  frames: { titular: string; cuerpo?: string; durationSec?: number }[];
  legal: { condiciones: string };
  meta: { primaryText: string; headline: string; description: string; callToAction: "WHATSAPP_MESSAGE" | "LEARN_MORE" | "CONTACT_US" | "BOOK_NOW" };
  reel?: { caption?: string; audio?: string } | null;
  google: { headlines: string[]; longHeadline: string; descriptions: string[] };
  rationale: string;
}

export interface PhotoRow {
  id: string;
  file_path: string;
  treatments: string[];
  tags: string[];
  focal: string;
  alt: string;
  approved: boolean;
  created_at?: string;
}

export interface SettingsRow {
  director: string;
  matricula: string;
  default_sede: SedeSlot;
  model: string;
}

export interface AdRow {
  id: string;
  parent_id: string | null;
  request: string;
  spec: AdSpec | null;
  failed_checks: string[];
  status: "ready" | "flagged" | "error";
  created_at: string;
}

export const CTA_LABEL: Record<AdSpec["meta"]["callToAction"], string> = {
  WHATSAPP_MESSAGE: "Enviar mensaje de WhatsApp",
  LEARN_MORE: "Más información",
  CONTACT_US: "Contactarnos",
  BOOK_NOW: "Reservar",
};

export const MODELS = [
  { id: "claude-opus-5-5", label: "Claude Opus 5.5 (recomendado)" },
  { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5 (más rápido y económico)" },
] as const;

export const isStaticFrame = (spec: AdSpec) => spec.kind !== "reel";
export const reelDuration = (spec: AdSpec) => spec.frames.reduce((a, f) => a + (f.durationSec ?? 3), 0);
