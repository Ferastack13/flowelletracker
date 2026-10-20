import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getMissingSupabaseEnvVarNames,
  getSupabasePublicEnv,
} from "@/lib/supabase/env";

/** Probe relation that must not exist — used only to prove PostgREST responds. */
const NONEXISTENT_PROBE_RELATION = "__flowelle_connection_probe__";
const PROBE_TIMEOUT_MS = 8_000;

export type SupabaseConnectionCheckResult = {
  /** True only when configuration is valid and both Auth + Database API probes succeed. */
  ok: boolean;
  configuration: "valid" | "invalid";
  /** Hostname derived from NEXT_PUBLIC_SUPABASE_URL (no credentials). */
  projectHost: string | null;
  authHealth: "reachable" | "unreachable" | "skipped";
  databaseApi: "reachable" | "unreachable" | "skipped";
  /** Human-readable notes — never includes secret values. */
  messages: string[];
};

function projectHostFromUrl(url: string): string | null {
  try {
    return new URL(url).host || null;
  } catch {
    return null;
  }
}

function networkErrorDetail(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const err = error as { name?: string; cause?: { code?: string; name?: string } };
  const code = err.cause?.code ?? err.cause?.name ?? err.name;
  return code && code !== "Error" ? code : null;
}

function sanitizeErrorHint(message: string | undefined): string | null {
  if (!message) return null;
  const trimmed = message.replace(/\s+/g, " ").trim().slice(0, 120);
  if (!trimmed) return null;
  if (/eyJ|sb_|apikey|bearer|jwt/i.test(trimmed)) return null;
  return trimmed;
}

function isMissingRelationError(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "PGRST205" || error.code === "42P01") {
    return true;
  }
  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("could not find the table") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

/**
 * Verifies public Supabase configuration and API reachability.
 * Does not read user/profile rows or alter RLS.
 */
export async function checkSupabaseConnection(
  supabase: SupabaseClient,
): Promise<SupabaseConnectionCheckResult> {
  const messages: string[] = [];
  const missing = getMissingSupabaseEnvVarNames();

  if (missing.length > 0) {
    return {
      ok: false,
      configuration: "invalid",
      projectHost: null,
      authHealth: "skipped",
      databaseApi: "skipped",
      messages: [
        `Missing required environment variable(s): ${missing.join(", ")}.`,
      ],
    };
  }

  let url: string;
  let publishableKey: string;
  try {
    ({ url, publishableKey } = getSupabasePublicEnv());
  } catch (error) {
    return {
      ok: false,
      configuration: "invalid",
      projectHost: null,
      authHealth: "skipped",
      databaseApi: "skipped",
      messages: [
        error instanceof Error
          ? error.message
          : "Failed to resolve Supabase public environment variables.",
      ],
    };
  }

  const projectHost = projectHostFromUrl(url);
  if (!projectHost) {
    return {
      ok: false,
      configuration: "invalid",
      projectHost: null,
      authHealth: "skipped",
      databaseApi: "skipped",
      messages: [
        "NEXT_PUBLIC_SUPABASE_URL is set but is not a valid absolute URL.",
      ],
    };
  }

  const configuration: SupabaseConnectionCheckResult["configuration"] =
    url.startsWith("https://") && projectHost.endsWith(".supabase.co")
      ? "valid"
      : "invalid";

  if (configuration === "invalid") {
    messages.push(
      "NEXT_PUBLIC_SUPABASE_URL must be an https URL whose host ends with .supabase.co.",
    );
  } else {
    messages.push("Public environment variables are present and parseable.");
  }

  messages.push("Server Supabase client was constructed successfully.");

  let authHealth: SupabaseConnectionCheckResult["authHealth"] = "unreachable";
  try {
    const authResponse = await fetch(new URL("/auth/v1/health", url), {
      method: "GET",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });

    if (authResponse.ok) {
      authHealth = "reachable";
      messages.push(
        `Auth health endpoint responded with HTTP ${authResponse.status}.`,
      );
    } else {
      messages.push(
        `Auth health endpoint responded with HTTP ${authResponse.status}.`,
      );
    }
  } catch (error) {
    const detail = networkErrorDetail(error);
    messages.push(
      `Auth health request failed (network error or unreachable host${detail ? `: ${detail}` : ""}).`,
    );
  }

  let databaseApi: SupabaseConnectionCheckResult["databaseApi"] = "unreachable";
  try {
    // Intentionally probes a non-existent relation via the configured client.
    // A "missing relation" PostgREST error proves the Database API accepted the key.
    // This does not read private user data and does not require weakening RLS.
    const { error } = await supabase
      .from(NONEXISTENT_PROBE_RELATION)
      .select("id")
      .limit(1)
      .abortSignal(AbortSignal.timeout(PROBE_TIMEOUT_MS));

    if (!error) {
      messages.push(
        "Database probe unexpectedly succeeded against a non-existent relation.",
      );
    } else if (isMissingRelationError(error)) {
      databaseApi = "reachable";
      messages.push(
        `Database API reachable via server client (expected missing-relation response: ${error.code ?? "no-code"}).`,
      );
    } else if (
      error.message?.toLowerCase().includes("invalid api key") ||
      error.message?.toLowerCase().includes("jwt")
    ) {
      messages.push(
        "Database API rejected the publishable key (invalid or mismatched credentials).",
      );
    } else {
      const hint = sanitizeErrorHint(error.message);
      messages.push(
        `Database probe returned an unexpected error${error.code ? ` code: ${error.code}` : ""}${hint ? ` (${hint})` : ""}.`,
      );
    }
  } catch (error) {
    const detail = networkErrorDetail(error);
    messages.push(
      `Database probe failed (network error or client failure${detail ? `: ${detail}` : ""}).`,
    );
  }

  const ok =
    configuration === "valid" &&
    authHealth === "reachable" &&
    databaseApi === "reachable";

  if (!ok && configuration === "valid") {
    messages.push(
      "Configuration looks structurally valid, but a full connection was not verified.",
    );
  }

  return {
    ok,
    configuration,
    projectHost,
    authHealth,
    databaseApi,
    messages,
  };
}
