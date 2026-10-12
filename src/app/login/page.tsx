"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ad/Logo";
import { Kicker } from "@/components/ad/Kicker";
import { Headline } from "@/components/ad/Headline";
import { Button } from "@/components/ad/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) return setError("Email o contraseña incorrectos.");
    router.replace("/");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "96px 24px", display: "flex", flexDirection: "column", gap: 28 }}>
      <Logo size={44} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Kicker size={13}>Estudio de anuncios</Kicker>
        <Headline size={44} text="Ingresá al *estudio*." />
      </div>
      <form onSubmit={submit} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <label>
          <span className="label">Email</span>
          <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          <span className="label">Contraseña</span>
          <input className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role="alert" style={{ margin: 0, fontSize: 14, color: "var(--ink)" }}>{error}</p>}
        <Button size="web" type="submit" disabled={busy} style={{ opacity: busy ? 0.6 : 1 }}>{busy ? "Ingresando…" : "Ingresar"}</Button>
      </form>
      <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>Las cuentas las crea quien administra el estudio en Supabase.</p>
    </main>
  );
}
