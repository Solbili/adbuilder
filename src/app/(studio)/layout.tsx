import { redirect } from "next/navigation";
import { getMember } from "@/lib/supabase/server";
import { Header } from "@/components/studio/Header";
import { Kicker } from "@/components/ad/Kicker";
import { Headline } from "@/components/ad/Headline";

export default async function StudioLayout({ children }: LayoutProps<"/">) {
  const { user, member } = await getMember();
  if (!user) redirect("/login");
  return (
    <div style={{ minHeight: "100vh" }}>
      <Header />
      {member ? children : (
        <main className="page" style={{ maxWidth: 620 }}>
          <Kicker size={13}>Sin acceso</Kicker>
          <Headline size={36} level={2} text="Tu cuenta todavía no tiene *acceso*." />
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "var(--body)" }}>
            Pedile a quien administra el estudio que agregue {user.email} a la tabla <code>members</code> en Supabase.
          </p>
        </main>
      )}
    </div>
  );
}
