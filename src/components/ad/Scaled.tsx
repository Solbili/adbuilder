import type { ReactNode } from "react";
import { AD_FORMATS, type AdFormat } from "@/lib/formats";

/** Renders an ad at native size and scales the wrapper down. Never re-layout at preview size. */
export function Scaled({ format, maxH, maxW, radius = 10, children }: { format: AdFormat; maxH: number; maxW?: number; radius?: number; children: ReactNode }) {
  const f = AD_FORMATS[format];
  const k = Math.min(maxH / f.h, (maxW ?? maxH * 1.3) / f.w);
  return (
    <div style={{ width: f.w * k, height: f.h * k, overflow: "hidden", borderRadius: radius, border: "1px solid var(--line)", flex: "none", background: "var(--bg)" }}>
      <div style={{ transform: `scale(${k})`, transformOrigin: "0 0", width: f.w, height: f.h }}>{children}</div>
    </div>
  );
}
