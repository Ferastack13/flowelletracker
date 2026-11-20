import type { NextRequest } from "next/server";
import { processDueNotifications } from "@/lib/notifications/process";

export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return false;
  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await processDueNotifications();
    return Response.json({
      ok: true,
      ...result,
      note:
        result.providerConfigured && result.adminConfigured
          ? "Processed due reminders."
          : "Scheduler ran, but delivery still needs RESEND_API_KEY, RESEND_FROM_EMAIL, and SUPABASE_SERVICE_ROLE_KEY.",
    });
  } catch {
    return Response.json(
      {
        ok: false,
        error: "processing_failed",
      },
      { status: 500 },
    );
  }
}
