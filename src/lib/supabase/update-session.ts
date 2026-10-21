import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getMissingSupabaseEnvVarNames, getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Refresh the Auth token on each matched request.
 * Always call getClaims() — never trust getSession() in proxy.
 */
export async function updateSession(request: NextRequest) {
  if (getMissingSupabaseEnvVarNames().length > 0) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  const { url, publishableKey } = getSupabasePublicEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  await supabase.auth.getClaims();

  return supabaseResponse;
}
