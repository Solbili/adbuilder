import { createClient } from "@/lib/supabase/server";
import { History } from "@/components/studio/History";
import type { AdRow, PhotoRow, SettingsRow } from "@/lib/spec";

export default async function HistorialPage() {
  const supabase = await createClient();
  const [adsRes, photosRes, settingsRes] = await Promise.all([
    supabase.from("ads").select("*").order("created_at", { ascending: false }).limit(200).returns<AdRow[]>(),
    supabase.from("photos").select("*").returns<PhotoRow[]>(),
    supabase.from("settings").select("director, matricula, default_sede, model").eq("id", 1).single<SettingsRow>(),
  ]);
  return <History ads={adsRes.data ?? []} photos={photosRes.data ?? []} settings={settingsRes.data} />;
}
