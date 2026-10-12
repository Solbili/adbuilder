"use client";

import { Kicker } from "@/components/ad/Kicker";
import { Photo } from "@/components/ad/Photo";
import { photoUrl } from "@/lib/photos";
import type { PhotoRow } from "@/lib/spec";

export function PhotoPicker({ photos, treatment, current, onPick, onClose }: { photos: PhotoRow[]; treatment: string; current: string; onPick: (p: PhotoRow) => void; onClose: () => void }) {
  const approved = photos.filter((p) => p.approved);
  const sorted = [...approved].sort((a, b) => Number(b.treatments.includes(treatment)) - Number(a.treatments.includes(treatment)));
  return (
    <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Kicker size={12}>Elegí la foto</Kicker>
        <button className="toggle" style={{ marginLeft: "auto" }} onClick={onClose}>Cerrar</button>
      </div>
      {sorted.length === 0 && <p className="muted" style={{ margin: 0, fontSize: 14 }}>No hay fotos aprobadas. Subilas en «Fotos».</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
        {sorted.map((p) => (
          <button key={p.id} onClick={() => onPick(p)} style={{ border: `1px solid ${p.id === current ? "var(--accent-ink)" : "var(--line)"}`, background: "var(--surface)", borderRadius: 16, padding: 6, cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 6 }}>
            <Photo src={photoUrl(p.file_path)} focal={p.focal} label={p.id} radius={10} style={{ width: "100%", aspectRatio: "1 / 1" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", overflowWrap: "anywhere" }}>{p.id}</span>
            <span style={{ fontSize: 11, color: "var(--muted2)" }}>{p.treatments.join(" · ")}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
