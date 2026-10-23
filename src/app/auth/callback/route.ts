import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_NEXT = "/dashboard";

function safeNextPath(next: string | null): string {
  if (!next) return DEFAULT_NEXT;

  try {
    const url = new URL(next, "https://flowelle.invalid");
    if (url.origin !== "https://flowelle.invalid") return DEFAULT_NEXT;
    if (!url.pathname.startsWith("/") || url.pathname.startsWith("//")) {
      return DEFAULT_NEXT;
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return DEFAULT_NEXT;
  }
}

function requestOrigin(request: Request, url: URL): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (process.env.NODE_ENV !== "development" && forwardedHost) {
    return `${forwardedProto ?? "https"}://${forwardedHost}`;
  }
  return url.origin;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const safeNext = safeNextPath(url.searchParams.get("next"));
  const origin = requestOrigin(request, url);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(safeNext, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=callback", origin));
}
