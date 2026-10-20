import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Browser Supabase client for Client Components.
 * Uses only the public URL and publishable key.
 */
export function createClient() {
  const { url, publishableKey } = getSupabasePublicEnv();

  return createBrowserClient(url, publishableKey);
}
