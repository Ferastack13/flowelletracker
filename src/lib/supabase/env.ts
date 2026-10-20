/**
 * Public Supabase env helpers.
 * Never read or expose service-role credentials here.
 */

export const SUPABASE_URL_ENV = "NEXT_PUBLIC_SUPABASE_URL";
export const SUPABASE_PUBLISHABLE_KEY_ENV =
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

const REQUIRED_PUBLIC_ENV_VARS = [
  SUPABASE_URL_ENV,
  SUPABASE_PUBLISHABLE_KEY_ENV,
] as const;

export type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

function readTrimmedEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Returns names of required public env vars that are missing or empty. */
export function getMissingSupabaseEnvVarNames(): string[] {
  return REQUIRED_PUBLIC_ENV_VARS.filter((name) => !readTrimmedEnv(name));
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
    url: readTrimmedEnv(SUPABASE_URL_ENV)!,
    publishableKey: readTrimmedEnv(SUPABASE_PUBLISHABLE_KEY_ENV)!,
  };
}
