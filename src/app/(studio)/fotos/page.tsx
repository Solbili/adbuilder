import { createClient } from "@/lib/supabase/server";
import { PhotoLibrary } from "@/components/studio/PhotoLibrary";
import type { PhotoRow } from "@/lib/spec";

export default async function FotosPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("photos").select("*").order("created_at", { ascending: false }).returns<PhotoRow[]>();
  return <PhotoLibrary initial={data ?? []} />;
}
