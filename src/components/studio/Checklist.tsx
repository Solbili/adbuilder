import Link from "next/link";
import { Kicker } from "@/components/ad/Kicker";
import type { Check } from "@/lib/validate";

export function Checklist({ checks }: { checks: Check[] }) {
  const ok = checks.filter((c) => c.ok).length;
  return (
    <div className="card" style={{ padding: "18px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Kicker size={12}>Checklist</Kicker>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{ok}/{checks.length}</span>
      </div>
      {checks.map((c) => (
        <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderTop: "1px solid var(--line)", fontSize: 14, lineHeight: 1.45 }}>
          <span aria-hidden style={{ flex: "none", width: 20, height: 20, borderRadius: 999, background: c.ok ? "var(--accent-ink)" : "var(--surface)", border: c.ok ? 0 : "1.5px solid var(--ink)", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{c.ok ? "✓" : ""}</span>
          <span style={{ color: "var(--ink)" }}>
            <span className="sr-only">{c.ok ? "Cumple: " : "No cumple: "}</span>
            {c.label}
            {c.note && (
              <span style={{ display: "block", fontSize: 12, color: "var(--muted2)" }}>
                {c.id === "legal" ? <Link href="/ajustes">{c.note}</Link> : c.note}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
