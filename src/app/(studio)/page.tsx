import { createClient } from "@/lib/supabase/server";
import { Home } from "@/components/studio/Home";

export default async function HomePage() {
  const supabase = await createClient();
  const { count } = await supabase.from("photos").select("id", { count: "exact", head: true }).eq("approved", true);
  const warning = count ? undefined : "Todavía no hay fotos aprobadas. Subí las fotos de la clínica en «Fotos» antes de crear anuncios: el estudio solo usa fotos propias.";
  return <Home warning={warning} />;
}
