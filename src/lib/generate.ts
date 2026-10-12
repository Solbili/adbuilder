import Anthropic from "@anthropic-ai/sdk";
import type { BetaMessageParam, BetaMessage, BetaToolUnion, BetaToolUseBlock } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { BRAND } from "./brand";
import { SYSTEM_PROMPT } from "./system-prompt";
import { AD_SPEC_STRICT_SCHEMA, schemaErrors } from "./schema";
import { validateSpec, type Check } from "./validate";
import { MODELS, type AdSpec, type PhotoRow, type SettingsRow } from "./spec";

const MAX_RETRIES = 2;
const TOOL_NAME = "create_ad";

export type GenerateEvent = { type: "step"; step: number } | { type: "log"; message: string };

export interface GenerateInput {
  request: string;
  photos: PhotoRow[];
  settings: SettingsRow;
  currentSpec?: AdSpec | null;
}

export interface GenerateResult {
  spec: AdSpec;
  checks: Check[];
  /** AI-fixable rules still failing after the retries */
  flagged: boolean;
}

export class GenerateError extends Error {}

function systemBlocks(input: GenerateInput) {
  const photos = input.photos
    .filter((p) => p.approved)
    .map(({ id, treatments, tags, alt, focal }) => ({ id, treatments, tags, alt, focal }));
  const runtime = [
    `<brand>\n${JSON.stringify(BRAND, null, 2)}\n</brand>`,
    `<photos>\n${JSON.stringify(photos, null, 2)}\n</photos>`,
  ].join("\n\n");
  const blocks: Anthropic.Beta.Messages.BetaTextBlockParam[] = [
    { type: "text", text: SYSTEM_PROMPT },
    { type: "text", text: runtime, cache_control: { type: "ephemeral" } },
  ];
  if (input.currentSpec) blocks.push({ type: "text", text: `<current_spec>\n${JSON.stringify(input.currentSpec, null, 2)}\n</current_spec>` });
  return blocks;
}

function tool(strict: boolean): BetaToolUnion {
  return {
    name: TOOL_NAME,
    description: "Entrega el anuncio completo (AdSpec): copy, layout, foto, formatos y campos de Meta y Google. Llamala exactamente una vez por respuesta.",
    input_schema: AD_SPEC_STRICT_SCHEMA as Anthropic.Beta.Messages.BetaTool.InputSchema,
    ...(strict ? { strict: true } : {}),
  };
}

/** Fallbacks are only offered for the models in the settings selector. */
const supportsFallback = (model: string) => MODELS.some((m) => m.id === model);

export async function generateSpec(input: GenerateInput, emit: (e: GenerateEvent) => void): Promise<GenerateResult> {
  const client = new Anthropic();
  const model = input.settings.model || process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
  const system = systemBlocks(input);
  const messages: BetaMessageParam[] = [
    { role: "user", content: input.currentSpec ? `Cambio pedido sobre el anuncio actual: ${input.request}` : input.request },
  ];
  let strict = true;

  const call = async (): Promise<BetaMessage> => {
    const stream = client.beta.messages.stream({
      model,
      max_tokens: 16000,
      system,
      tools: [tool(strict)],
      // Forced tool_choice is rejected by the current models: auto + the prompt + a retry below.
      tool_choice: { type: "auto", disable_parallel_tool_use: true },
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      messages,
      ...(supportsFallback(model) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
    });
    stream.on("streamEvent", (ev) => {
      if (ev.type === "content_block_start" && ev.content_block.type === "tool_use") emit({ type: "step", step: 2 });
    });
    return stream.finalMessage();
  };

  let last: { spec: AdSpec; checks: Check[] } | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    emit({ type: "step", step: 1 });
    let msg: BetaMessage;
    try {
      msg = await call();
    } catch (err) {
      // If the strict schema itself is rejected, keep going without strict: Ajv + validateSpec still check everything.
      if (strict && err instanceof Anthropic.BadRequestError && /schema|strict/i.test(err.message)) {
        strict = false;
        emit({ type: "log", message: `strict tool schema rejected, retrying without it: ${err.message}` });
        msg = await call();
      } else throw err;
    }

    if (msg.stop_reason === "refusal") throw new GenerateError("El modelo no pudo procesar este pedido. Probá reformularlo.");
    if (msg.stop_reason === "max_tokens") throw new GenerateError("La respuesta quedó cortada. Probá de nuevo.");

    messages.push({ role: "assistant", content: msg.content });
    const use = msg.content.find((b): b is BetaToolUseBlock => b.type === "tool_use" && b.name === TOOL_NAME);
    if (!use) {
      messages.push({ role: "user", content: "Entregá el anuncio llamando a la herramienta create_ad." });
      continue;
    }

    emit({ type: "step", step: 3 });
    const { hard, soft } = schemaErrors(use.input);
    const spec = use.input as AdSpec;
    const checks = hard.length ? [] : validateSpec(spec, { photos: input.photos, settings: input.settings });
    const failing = checks.filter((c) => !c.ok && c.aiFixable);
    if (!hard.length) last = { spec, checks };
    if (!hard.length && !soft.length && !failing.length) return { spec, checks, flagged: false };

    const errors = hard.length
      ? hard.map((e) => `- ${e}`)
      : [...soft.map((e) => `- ${e}`), ...failing.map((c) => `- ${c.label}${c.note ? `: ${c.note}` : ""}`)];
    emit({ type: "log", message: `attempt ${attempt + 1} failed: ${errors.join(" ")}` });
    messages.push({
      role: "user",
      content: [{
        type: "tool_result",
        tool_use_id: use.id,
        is_error: true,
        content: `El anuncio no pasa estas reglas:\n${errors.join("\n")}\nVolvé a llamar a create_ad con el anuncio completo corregido. Cambiá solo lo necesario.`,
      }],
    });
  }

  if (last) return { ...last, flagged: true };
  throw new GenerateError("No se pudo armar un anuncio válido. Probá de nuevo.");
}
