/**
 * One-off / reusable CLI verification for public Supabase configuration.
 * Loads .env.local, never prints credential values.
 * Mirrors the probes in src/lib/supabase/connection-check.ts.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const URL_ENV = "NEXT_PUBLIC_SUPABASE_URL";
const KEY_ENV = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
const PROBE = "__flowelle_connection_probe__";
const PROBE_TIMEOUT_MS = 8_000;

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    return { missingFile: true };
  }
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(name in process.env) || !process.env[name]) {
      process.env[name] = value;
    }
  }
  return { missingFile: false };
}

function missingNames() {
  return [URL_ENV, KEY_ENV].filter((name) => {
    const value = process.env[name];
    return typeof value !== "string" || value.trim().length === 0;
  });
}

function isMissingRelationError(error) {
  if (!error) return false;
  if (error.code === "PGRST205" || error.code === "42P01") return true;
  const message = String(error.message ?? "").toLowerCase();
  return (
    message.includes("could not find the table") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

async function main() {
  const { missingFile } = loadEnvLocal();
  const messages = [];

  if (missingFile) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          configuration: "invalid",
          projectHost: null,
          authHealth: "skipped",
          databaseApi: "skipped",
          messages: [".env.local not found"],
          clientUsed: "none",
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
    return;
  }

  const missing = missingNames();
  if (missing.length > 0) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          configuration: "invalid",
          projectHost: null,
          authHealth: "skipped",
          databaseApi: "skipped",
          messages: [`Missing: ${missing.join(", ")}`],
          clientUsed: "none",
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
    return;
  }

  const url = process.env[URL_ENV].trim();
  const key = process.env[KEY_ENV].trim();
  let projectHost = null;
  try {
    projectHost = new URL(url).host;
  } catch {
    console.log(
      JSON.stringify(
        {
          ok: false,
          configuration: "invalid",
          projectHost: null,
          authHealth: "skipped",
          databaseApi: "skipped",
          messages: ["URL is not a valid absolute URL"],
          clientUsed: "none",
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
    return;
  }

  const configuration =
    url.startsWith("https://") && projectHost.endsWith(".supabase.co")
      ? "valid"
      : "invalid";

  if (configuration === "invalid") {
    messages.push(
      "URL must be https and host must end with .supabase.co",
    );
  } else {
    messages.push("Public environment variables are present and parseable.");
  }

  // Equivalent public client (same URL + publishable key as server/browser helpers).
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  messages.push(
    "Public Supabase JS client constructed with URL + publishable key.",
  );

  let authHealth = "unreachable";
  try {
    const authResponse = await fetch(new URL("/auth/v1/health", url), {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (authResponse.ok) {
      authHealth = "reachable";
      messages.push(`Auth health HTTP ${authResponse.status}`);
    } else {
      messages.push(`Auth health HTTP ${authResponse.status}`);
    }
  } catch (error) {
    const code = error?.cause?.code || error?.name || "";
    messages.push(`Auth health network failure${code ? `: ${code}` : ""}`);
  }

  let databaseApi = "unreachable";
  try {
    const { error } = await supabase
      .from(PROBE)
      .select("id")
      .limit(1)
      .abortSignal(AbortSignal.timeout(PROBE_TIMEOUT_MS));
    if (!error) {
      messages.push("Unexpected success on non-existent probe relation");
    } else if (isMissingRelationError(error)) {
      databaseApi = "reachable";
      messages.push(
        `Database API reachable (missing-relation: ${error.code ?? "no-code"})`,
      );
    } else {
      const hint = String(error.message ?? "")
        .replace(/\s+/g, " ")
        .slice(0, 80);
      const safeHint = /eyJ|sb_|apikey|bearer/i.test(hint) ? "" : hint;
      messages.push(
        `Unexpected DB probe error${error.code ? ` code: ${error.code}` : ""}${safeHint ? ` (${safeHint})` : ""}`,
      );
    }
  } catch (error) {
    const code = error?.cause?.code || error?.name || "";
    messages.push(
      `Database probe network/client failure${code ? `: ${code}` : ""}`,
    );
  }

  const ok =
    configuration === "valid" &&
    authHealth === "reachable" &&
    databaseApi === "reachable";

  console.log(
    JSON.stringify(
      {
        ok,
        configuration,
        projectHost,
        authHealth,
        databaseApi,
        messages,
        clientUsed: "@supabase/supabase-js createClient (public key)",
        note: "Next.js route /api/supabase-health uses src/lib/supabase/server createClient with the same env vars and probes.",
      },
      null,
      2,
    ),
  );

  process.exitCode = ok ? 0 : 1;
}

main();
