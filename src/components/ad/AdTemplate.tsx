import type { CSSProperties } from "react";
import { AD_FORMATS, type AdFormat, type Layout } from "@/lib/formats";
import type { SedeKey } from "@/lib/brand";
import { Logo } from "./Logo";
import { Button } from "./Button";
import { Kicker } from "./Kicker";
import { Headline } from "./Headline";
import { Photo } from "./Photo";
import { SedeBlock } from "./SedeBlock";
import { LegalStrip } from "./LegalStrip";
import { SafeZones } from "./SafeZones";

const BODY = { light: "var(--body)", dark: "var(--dark-body)", accent: "var(--on-accent)", photo: "#ffffff" };
type Tone = keyof typeof BODY;

export interface AdTemplateProps {
  /** Artboard size. Logo formats ignore layout and slots. */
  format?: AdFormat;
  /** veil = full photo + #22343a veil · split = 50/50 photo + #8cc3c8 block · flat = #f6fafa, big headline, small photo · dark = #22343a band */
  layout?: Layout;
  /** {titular} — wrap ONE word in *asterisks* for the italic teal word */
  titular?: string;
  /** {tratamiento} — kicker above the headline */
  kicker?: string;
  /** Optional supporting line (≤ 90 chars). Hidden on 1.91:1 */
  cuerpo?: string;
  /** {foto} — image URL; real clinic photos only */
  foto?: string;
  /** Focal point (CSS object-position). All crops derive from it */
  focal?: string;
  sede?: SedeKey | "ambas" | null;
  /** «Sacar turno» · «Consultar por WhatsApp» · «Ver tratamientos» */
  cta?: string;
  director?: string;
  matricula?: string;
  /** Promo validity + conditions. Required if a price or promo appears */
  condiciones?: string;
  /** Show 9:16 safe-zone guides (never on export) */
  showGuides?: boolean;
  /** Export-only: transparent root and an empty photo box, for the reel compositor. */
  photoHole?: boolean;
  style?: CSSProperties;
}

/** Parametrized ad: one component, every format × 4 layouts. Change slots, never the layout. */
export function AdTemplate({
  format = "meta-feed-4x5", layout = "veil",
  titular = "{titular} con una *palabra* en itálica.", kicker = "{tratamiento}", cuerpo,
  foto, focal = "50% 50%", sede = "ambas", cta = "Sacar turno",
  director, matricula, condiciones, showGuides = false, photoHole = false, style,
}: AdTemplateProps) {
  const f = AD_FORMATS[format] || AD_FORMATS["meta-feed-4x5"];
  const { w, h } = f;
  const st = f.safeTop || 0, sb = f.safeBottom || 0;
  const s = Math.min(w, h * 1.25) / 1080;
  const m = 72 * s;
  const ratio = w / h;
  const land = ratio > 1.3;
  const tall = h / w > 1.6;
  const root: CSSProperties = { position: "relative", width: w, height: h, overflow: "hidden", background: photoHole ? "transparent" : "var(--bg)", fontFamily: "var(--font-text)", boxSizing: "border-box", flex: "none", ...style };

  if (f.logo) {
    return (
      <div data-ad-root="" style={{ ...root, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {ratio > 2 ? <Logo variant="lockup" size={140} /> : <Logo variant="symbol" size={520} />}
      </div>
    );
  }

  const showBody = !!cuerpo && !land;
  const head = (layout === "flat" ? 100 : 84) * s * (tall ? 1.12 : 1);
  const copy = (tone: Tone) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 * s }}>
      {kicker && <Kicker tone={tone} s={s}>{kicker}</Kicker>}
      <Headline text={titular} tone={tone} s={s} size={head} />
      {showBody && <p style={{ margin: 0, fontSize: 30 * s, lineHeight: 1.45, color: BODY[tone], maxWidth: 860 * s, textWrap: "pretty" }}>{cuerpo}</p>}
    </div>
  );
  const actions = (tone: Tone, btn: "dark" | "primary") => (
    <div style={{ display: "flex", alignItems: "center", gap: 32 * s, flexWrap: "wrap" }}>
      {cta && <Button variant={btn} s={s} tabIndex={-1}>{cta}</Button>}
      {sede && !land && <SedeBlock sede={sede} layout="inline" tone={tone} s={s} />}
    </div>
  );
  const footer = (tone: "light" | "dark" = "light") => (
    <div style={{
      flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 * s,
      padding: `${26 * s}px ${m}px ${26 * s + sb}px`,
      background: tone === "dark" ? "var(--dark)" : "var(--bg)",
      borderTop: `1px solid ${tone === "dark" ? "var(--dark-line3)" : "var(--line)"}`,
    }}>
      <Logo size={Math.max(48, 56 * s)} tone={tone} />
      <LegalStrip director={director || undefined} matricula={matricula || undefined} extra={condiciones} tone={tone} s={s} align="right" style={{ maxWidth: "62%" }} />
    </div>
  );

  let body;
  if (layout === "split") {
    const col = h / w > 1.1;
    body = (
      <div data-ad-root="" style={{ ...root, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: col ? "column" : "row" }}>
          <Photo src={foto} focal={focal} s={s} hole={photoHole} style={{ flex: "0 0 50%" }} />
          <div style={{ flex: "1 1 0", minWidth: 0, minHeight: 0, background: "var(--accent)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 44 * s, padding: m }}>
            {copy("accent")}{actions("accent", "dark")}
          </div>
        </div>
        {footer()}
      </div>
    );
  } else if (layout === "flat") {
    const row = ratio >= 0.95;
    body = (
      <div data-ad-root="" style={{ ...root, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: row ? "row" : "column", gap: 56 * s, padding: `${st + m}px ${m}px ${m}px` }}>
          <div style={{ flex: row ? "1 1 0" : "none", minWidth: 0, display: "flex", flexDirection: "column", justifyContent: row ? "center" : "flex-start", gap: 44 * s }}>
            {copy("light")}{actions("light", "primary")}
          </div>
          <div style={{ flex: row ? "0 0 34%" : "1 1 0", minHeight: 0, display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
            <Photo src={foto} focal={focal} s={s} hole={photoHole} radius={(row ? 32 : 49) * s} style={{ width: row ? "100%" : "52%", height: "100%" }} />
          </div>
        </div>
        {footer()}
      </div>
    );
  } else if (layout === "dark") {
    const col = ratio < 1.3;
    body = (
      <div data-ad-root="" style={{ ...root, display: "flex", flexDirection: col ? "column" : "row", background: photoHole ? "transparent" : "var(--dark)" }}>
        <Photo src={foto} focal={focal} s={s} hole={photoHole} style={{ flex: col ? `0 0 ${tall ? 42 : ratio > 0.95 ? 34 : 38}%` : "0 0 42%" }} />
        <div style={{ flex: "1 1 0", minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 44 * s, padding: m }}>
            {copy("dark")}{actions("dark", "primary")}
          </div>
          {footer("dark")}
        </div>
      </div>
    );
  } else {
    body = (
      <div data-ad-root="" style={root}>
        <Photo src={foto} focal={focal} s={s} hole={photoHole} veil={[0.35, 0.55]} style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 44 * s, padding: `${st + m}px ${m}px ${m}px` }}>
            {copy("photo")}{actions("photo", "primary")}
          </div>
          {footer()}
        </div>
      </div>
    );
  }
  if (!showGuides || !(st || sb)) return body;
  return (
    <div style={{ position: "relative", width: w, height: h, flex: "none" }}>
      {body}
      <SafeZones top={st} bottom={sb} s={s} />
    </div>
  );
}
