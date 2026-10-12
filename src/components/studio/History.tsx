"use client";

import Link from "next/link";
import { AdTemplate } from "@/components/ad/AdTemplate";
import { Headline } from "@/components/ad/Headline";
import { Kicker } from "@/components/ad/Kicker";
import { Scaled } from "@/components/ad/Scaled";
import { photoFor, photoUrl } from "@/lib/photos";
import type { AdRow, PhotoRow, SettingsRow } from "@/lib/spec";

const date = (s: string) => new Date(s).toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function Thumb({ ad, photos, settings, maxH }: { ad: AdRow; photos: PhotoRow[]; settings: SettingsRow | null; maxH: number }) {
  const spec = ad.spec!;
  const p = photoFor(photos, spec.photo.id);
  const fmt = spec.formats[0];
  return (
    <Scaled format={fmt} maxH={maxH} maxW={maxH * 1.6}>
      <AdTemplate format={fmt} layout={spec.layout} kicker={spec.slots.kicker} titular={spec.frames[0]?.titular} cuerpo={spec.frames[0]?.cuerpo}
        foto={photoUrl(p?.file_path)} focal={spec.photo.focal ?? p?.focal} sede={spec.slots.sede} cta={spec.slots.cta}
        director={settings?.director} matricula={settings?.matricula} condiciones={spec.legal.condiciones || undefined} />
    </Scaled>
  );
}

export function History({ ads, photos, settings }: { ads: AdRow[]; photos: PhotoRow[]; settings: SettingsRow | null }) {
  const withSpec = ads.filter((a) => a.spec);
  const byId = new Map(withSpec.map((a) => [a.id, a]));
  const rootOf = (a: AdRow): string => {
    let cur = a;
    for (let i = 0; i < 50 && cur.parent_id && byId.has(cur.parent_id); i++) cur = byId.get(cur.parent_id)!;
    return cur.id;
  };
  const groups = new Map<string, AdRow[]>();
  for (const a of [...withSpec].reverse()) {
    const r = rootOf(a);
    if (!groups.has(r)) groups.set(r, []);
    if (r !== a.id) groups.get(r)!.push(a);
  }
  const roots = withSpec.filter((a) => groups.has(a.id) && rootOf(a) === a.id);

  return (
    <main className="page">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Kicker size={13}>Historial</Kicker>
        <Headline size={44} text="Anuncios *creados*." />
      </div>
      {roots.length === 0 && <p className="muted" style={{ margin: 0 }}>Todavía no hay anuncios. <Link href="/">Creá el primero</Link>.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {roots.map((a) => {
          const children = groups.get(a.id) ?? [];
          return (
            <div key={a.id} className="card card-hover" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <Link href={`/ads/${a.id}`} style={{ display: "flex", flexDirection: "column", gap: 10, textDecoration: "none", color: "var(--ink)" }}>
                <div style={{ display: "flex", justifyContent: "center", background: "var(--bg)", borderRadius: 14, padding: 10 }}>
                  <Thumb ad={a} photos={photos} settings={settings} maxH={220} />
                </div>
                <Kicker size={11}>{a.spec!.treatment} · {a.spec!.kind}{a.status === "flagged" ? " · revisar" : ""}</Kicker>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 20, lineHeight: 1.25 }}>«{a.request}»</span>
                <span style={{ fontSize: 12, color: "var(--muted2)" }}>{date(a.created_at)}</span>
              </Link>
              {children.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted2)" }}>Cambios</span>
                  {children.map((c) => (
                    <Link key={c.id} href={`/ads/${c.id}`} style={{ fontSize: 13, textDecoration: "none", display: "flex", gap: 8 }}>
                      <span aria-hidden>↳</span><span>«{c.request}» <span style={{ color: "var(--muted2)" }}>· {date(c.created_at)}</span></span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
