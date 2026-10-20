import { NextResponse } from "next/server";
import { checkSupabaseConnection } from "@/lib/supabase/connection-check";
import { createClient } from "@/lib/supabase/server";

/**
 * Temporary/reusable health endpoint for verifying Supabase public configuration.
 * Does not expose credential values.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const result = await checkSupabaseConnection(supabase);

    return NextResponse.json(result, {
      status: result.ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while checking Supabase connection.";

    return NextResponse.json(
      {
        ok: false,
        configuration: "invalid",
        projectHost: null,
        authHealth: "skipped",
        databaseApi: "skipped",
        messages: [message],
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
