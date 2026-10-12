import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/studio/SettingsForm";
import type { SettingsRow } from "@/lib/spec";

export default async function AjustesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("director, matricula, default_sede, model").eq("id", 1).single<SettingsRow>();
  return <SettingsForm initial={data ?? { director: "", matricula: "", default_sede: "ambas", model: "claude-opus-5-5" }} />;
}
