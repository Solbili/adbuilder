import type { CSSProperties } from "react";

export interface PhotoProps {
  /** Image URL. Empty → #cfe6e6 placeholder showing the focal point */
  src?: string;
  /** CSS object-position, e.g. "50% 35%". Define once per photo; all crops derive from it */
  focal?: string;
  /** true = #22343a 35→55% veil · number = flat opacity · [top, bottom] opacities (0.35–0.55) */
  veil?: boolean | number | [number, number];
  radius?: number;
  /** Placeholder label. Default "{foto}" */
  label?: string;
  s?: number;
  /** Export-only: keep the box but paint nothing, so the video encoder can draw the photo itself. */
  hole?: boolean;
  style?: CSSProperties;
}

/** Photo frame with focal point and optional #22343a veil. Shows a #cfe6e6 placeholder when src is empty. */
export function Photo({ src, focal = "50% 50%", veil, radius = 0, label = "{foto}", s = 1, hole, style }: PhotoProps) {
  const v = veil === true ? [0.35, 0.55] : Array.isArray(veil) ? veil : typeof veil === "number" ? [veil, veil] : null;
  if (hole) {
    return <div data-ad-photo="" data-veil={v ? v.join(",") : ""} style={{ position: "relative", borderRadius: radius, minWidth: 0, minHeight: 0, ...style }} />;
  }
  return (
    <div data-ad-photo="" style={{ position: "relative", overflow: "hidden", background: "var(--photo)", borderRadius: radius, minWidth: 0, minHeight: 0, ...style }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- rendered at native ad size and captured to PNG
        <img src={src} alt="" crossOrigin="anonymous" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: focal, display: "block" }} />
      ) : (
        <>
          <span style={{ position: "absolute", left: focal.split(" ")[0], top: focal.split(" ")[1] || "50%", width: 28 * s, height: 28 * s, marginLeft: -14 * s, marginTop: -14 * s, borderRadius: 999, border: `${Math.max(1, 2 * s)}px solid var(--accent-ink)`, boxSizing: "border-box" }} />
          <span style={{ position: "absolute", left: 0, right: 0, bottom: 20 * s, textAlign: "center", fontFamily: "var(--font-text)", fontSize: Math.max(11, 20 * s), color: "var(--accent-ink)" }}>{label} · foco {focal}</span>
        </>
      )}
      {v && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(34,52,58,${v[0]}) 0%, rgba(34,52,58,${v[1]}) 100%)` }} />}
    </div>
  );
}
