"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ad/Logo";

const LINKS = [
  { href: "/historial", label: "Historial" },
  { href: "/fotos", label: "Fotos" },
  { href: "/ajustes", label: "Ajustes" },
];

export function Header() {
  const path = usePathname();
  const link = (active: boolean): React.CSSProperties => ({ textDecoration: "none", color: active ? "var(--ink)" : "var(--accent-ink)" });
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", gap: 24, padding: "16px 32px", background: "var(--surface)", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
      <Link href="/" aria-label="Inicio" style={{ display: "inline-flex" }}><Logo size={36} /></Link>
      <span className="header-kicker" style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--accent-ink)" }}>Estudio de anuncios</span>
      <nav style={{ marginLeft: "auto", display: "flex", gap: 20, fontSize: 14, fontWeight: 600, alignItems: "center" }}>
        {LINKS.map((l) => <Link key={l.href} href={l.href} style={link(path.startsWith(l.href))}>{l.label}</Link>)}
      </nav>
    </header>
  );
}
