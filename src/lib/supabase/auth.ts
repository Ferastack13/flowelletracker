import { createClient } from "@/lib/supabase/server";

export async function getSignedInEmail(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return typeof data?.claims?.email === "string" ? data.claims.email : null;
}
