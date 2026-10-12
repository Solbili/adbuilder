import Anthropic from "@anthropic-ai/sdk";
import { getMember } from "@/lib/supabase/server";
import { generateSpec, GenerateError, type GenerateEvent } from "@/lib/generate";
import type { AdRow, PhotoRow, SettingsRow } from "@/lib/spec";

export const maxDuration = 300;

type ClientEvent = GenerateEvent | { type: "done"; id: string } | { type: "error"; message: string };

function friendly(err: unknown) {
  if (err instanceof GenerateError) return err.message;
  if (err instanceof Anthropic.RateLimitError) return "Hay demasiados pedidos en este momento. Esperá un minuto y reintentá.";
  if (err instanceof Anthropic.InternalServerError || (err instanceof Anthropic.APIError && err.status === 529)) return "El servicio de IA está saturado. Reintentá en unos segundos.";
  if (err instanceof Anthropic.AuthenticationError) return "Falta configurar la clave de la IA en el servidor.";
  if (err instanceof Anthropic.APIConnectionError) return "No se pudo conectar con el servicio de IA. Reintentá.";
  return "Algo salió mal al crear el anuncio. Reintentá.";
}

export async function POST(req: Request) {
  const { supabase, user, member } = await getMember();
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });
  if (!member) return Response.json({ error: "Tu cuenta no tiene acceso al estudio" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { request?: unknown; parentId?: unknown } | null;
  const request = typeof body?.request === "string" ? body.request.trim().slice(0, 2000) : "";
  const parentId = typeof body?.parentId === "string" ? body.parentId : null;
  if (!request) return Response.json({ error: "Escribí un pedido" }, { status: 400 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: ClientEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
      try {
        send({ type: "step", step: 0 });
        const [settingsRes, photosRes, parentRes] = await Promise.all([
          supabase.from("settings").select("director, matricula, default_sede, model").eq("id", 1).single<SettingsRow>(),
          supabase.from("photos").select("*").returns<PhotoRow[]>(),
          parentId ? supabase.from("ads").select("*").eq("id", parentId).single<AdRow>() : Promise.resolve({ data: null, error: null }),
        ]);
        if (settingsRes.error || photosRes.error || parentRes.error) throw new Error("db read failed");

        const result = await generateSpec(
          { request, photos: photosRes.data ?? [], settings: settingsRes.data, currentSpec: parentRes.data?.spec },
          (e) => (e.type === "log" ? console.log("[generate]", e.message) : send(e)),
        );

        send({ type: "step", step: 4 });
        const { data: ad, error } = await supabase
          .from("ads")
          .insert({
            request,
            parent_id: parentId,
            spec: result.spec,
            failed_checks: result.checks.filter((c) => !c.ok).map((c) => c.id),
            status: result.flagged ? "flagged" : "ready",
          })
          .select("id")
          .single();
        if (error) throw error;
        send({ type: "done", id: ad.id });
      } catch (err) {
        console.error("[generate]", err);
        send({ type: "error", message: friendly(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
