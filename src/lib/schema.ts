import Ajv2020 from "ajv/dist/2020";
import rawSchema from "./ad-spec.schema.json";
import type { AdSpec } from "./spec";

type Json = Record<string, unknown>;

/** The contract as written: used for server-side validation (lengths, patterns, counts included). */
export const AD_SPEC_SCHEMA = rawSchema as Json;

const UNSUPPORTED_IN_STRICT = new Set(["$schema", "$id", "title", "maxLength", "minLength", "pattern", "minItems", "maxItems", "uniqueItems", "minimum", "maximum"]);

/**
 * Strict tool use accepts a JSON Schema subset: no string/number/array-size constraints, and
 * nullable objects must be spelled with anyOf. Those limits are still enforced, by Ajv below and
 * by validateSpec(), and the errors go back to Claude.
 */
function toStrict(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(toStrict);
  if (!node || typeof node !== "object") return node;
  const out: Json = {};
  for (const [k, v] of Object.entries(node as Json)) {
    if (UNSUPPORTED_IN_STRICT.has(k)) continue;
    out[k] = k === "properties" ? Object.fromEntries(Object.entries(v as Json).map(([pk, pv]) => [pk, toStrict(pv)])) : toStrict(v);
  }
  if (Array.isArray(out.enum) && !out.type) out.type = typeof out.enum[0] === "number" ? "number" : "string";
  if (Array.isArray(out.type) && out.type.includes("null")) {
    const { type, ...rest } = out;
    const nonNull = (type as string[]).filter((t) => t !== "null");
    return { anyOf: [{ ...rest, type: nonNull[0] }, { type: "null" }] };
  }
  return out;
}

export const AD_SPEC_STRICT_SCHEMA = toStrict(AD_SPEC_SCHEMA) as Json;

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile<AdSpec>(AD_SPEC_SCHEMA);

/** Size limits only: the spec is still usable and the checklist flags them. */
const SOFT = new Set(["maxLength", "minLength", "maxItems", "minItems"]);

/** hard = the spec can't be rendered (wrong shape or enum); soft = over a length or count limit. */
export function schemaErrors(input: unknown): { hard: string[]; soft: string[] } {
  if (validate(input)) return { hard: [], soft: [] };
  const fmt = (e: NonNullable<typeof validate.errors>[number]) =>
    `${e.instancePath || "(raíz)"} ${e.message}${e.params && "allowedValues" in e.params ? `: ${(e.params.allowedValues as unknown[]).join(", ")}` : ""}`;
  const errs = validate.errors ?? [];
  return { hard: errs.filter((e) => !SOFT.has(e.keyword)).map(fmt), soft: errs.filter((e) => SOFT.has(e.keyword)).map(fmt) };
}
