/**
 * Public Supabase env helpers.
 * Never read or expose service-role credentials here.
 */

export const SUPABASE_URL_ENV = "NEXT_PUBLIC_SUPABASE_URL";
export const SUPABASE_PUBLISHABLE_KEY_ENV =
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

export type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

function trimEnv(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Read public env with static property access so Next.js can inline
 * NEXT_PUBLIC_* values into the browser bundle.
 */
function readPublicUrl(): string | undefined {
  return trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

function readPublishableKey(): string | undefined {
  return trimEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

/** Returns names of required public env vars that are missing or empty. */
export function getMissingSupabaseEnvVarNames(): string[] {
  const missing: string[] = [];
  if (!readPublicUrl()) missing.push(SUPABASE_URL_ENV);
  if (!readPublishableKey()) missing.push(SUPABASE_PUBLISHABLE_KEY_ENV);
  return missing;
}

/**
 * Resolves public Supabase credentials for client creation.
 * Throws with missing variable *names* only — never includes credential values.
 */
export function getSupabasePublicEnv(): SupabasePublicEnv {
  const missing = getMissingSupabaseEnvVarNames();

  if (missing.length > 0) {
    throw new Error(
      `Missing required Supabase environment variable(s): ${missing.join(", ")}. ` +
        `Copy .env.example to .env.local and set placeholder-free values from your Supabase project settings.`,
    );
  }

  return {
    url: readPublicUrl()!,
    publishableKey: readPublishableKey()!,
  };
}
