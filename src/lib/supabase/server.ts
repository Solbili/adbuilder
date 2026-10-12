import { connection } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** No login: every request uses the publishable key, and RLS allows it. */
export async function createClient() {
  // Data changes all the time: render per request, never at build.
  await connection();
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
