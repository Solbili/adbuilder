import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Result } from "@/components/studio/Result";
import type { AdRow, AdSpec, PhotoRow, SettingsRow } from "@/lib/spec";

export default async function AdPage({ params }: PageProps<"/ads/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [adRes, photosRes, settingsRes] = await Promise.all([
    supabase.from("ads").select("*").eq("id", id).maybeSingle<AdRow>(),
    supabase.from("photos").select("*").order("created_at").returns<PhotoRow[]>(),
    supabase.from("settings").select("director, matricula, default_sede, model").eq("id", 1).single<SettingsRow>(),
  ]);
  const ad = adRes.data;
  if (!ad?.spec || !settingsRes.data) notFound();
  const parent = ad.parent_id
    ? (await supabase.from("ads").select("id, request").eq("id", ad.parent_id).maybeSingle<{ id: string; request: string }>()).data
    : null;
  return <Result key={ad.id} ad={ad as AdRow & { spec: AdSpec }} parent={parent} photos={photosRes.data ?? []} settings={settingsRes.data} />;
}
