"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

type Event = { type: "step"; step: number } | { type: "done"; id: string } | { type: "error"; message: string };

export interface GenerateState {
  request: string;
  parentId: string | null;
  status: "idle" | "running" | "error";
  step: number;
  error: string;
}

/** POST /api/generate and follow its SSE steps; on success, open the new ad. */
export function useGenerate() {
  const router = useRouter();
  const [state, setState] = useState<GenerateState>({ request: "", parentId: null, status: "idle", step: 0, error: "" });

  const run = useCallback(async (request: string, parentId: string | null = null) => {
    setState({ request, parentId, status: "running", step: 0, error: "" });
    const fail = (error: string) => setState((s) => ({ ...s, status: "error", error }));
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ request, parentId }) });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => null);
        return fail(body?.error ?? "No se pudo iniciar el pedido.");
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        let i;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const line = buf.slice(0, i).replace(/^data: /, "");
          buf = buf.slice(i + 2);
          const ev = JSON.parse(line) as Event;
          if (ev.type === "step") setState((s) => ({ ...s, step: Math.max(s.step, ev.step) }));
          else if (ev.type === "error") return fail(ev.message);
          else if (ev.type === "done") {
            setState((s) => ({ ...s, step: 5 }));
            router.push(`/ads/${ev.id}`);
            return;
          }
        }
      }
      fail("La conexión se cortó antes de terminar.");
    } catch {
      fail("La conexión se cortó antes de terminar.");
    }
  }, [router]);

  const reset = useCallback(() => setState((s) => ({ ...s, status: "idle" })), []);
  return { state, run, reset };
}
