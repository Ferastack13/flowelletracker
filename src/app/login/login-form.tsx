"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [status, setStatus] = useState<
    "idle" | "google" | "github" | "email" | "sent" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const busy =
    status === "google" || status === "github" || status === "email";

  async function handleOAuth(provider: "google" | "github") {
    setStatus(provider);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        setStatus("error");
        setMessage(oauthSetupMessage(provider, error.message));
      }
    } catch (caught) {
      setStatus("error");
      const text = caught instanceof Error ? caught.message : "";
      setMessage(
        text.includes("Missing required Supabase")
          ? "The live site cannot reach Supabase yet. Check the Vercel environment variables, then redeploy."
          : oauthSetupMessage(provider, text),
      );
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();

    if (!email) {
      setStatus("error");
      setMessage("Enter an email address.");
      return;
    }

    setStatus("email");
    setMessage(null);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        setStatus("error");
        setMessage(
          "We could not send a sign-in link. Check the address and try again.",
        );
        return;
      }

      setStatus("sent");
      setMessage(
        "If that address can receive mail, a sign-in link is on its way. It may take a minute.",
      );
    } catch {
      setStatus("error");
      setMessage("Something went wrong sending the link. Try again shortly.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={busy}
        onClick={() => handleOAuth("google")}
      >
        <GoogleMark />
        {status === "google" ? "Continuing…" : "Continue with Google"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={busy}
        onClick={() => handleOAuth("github")}
      >
        <GitHubMark />
        {status === "github" ? "Continuing…" : "Continue with GitHub"}
      </Button>
      <div className="flex items-center gap-3 text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border" />
        or email
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          disabled={busy}
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {status === "email"
          ? "Sending link…"
          : status === "sent"
            ? "Send another link"
            : "Email me a sign-in link"}
      </Button>
      {message ? (
        <p
          className={
            status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}
      <p className="text-xs leading-relaxed text-muted-foreground">
        New here? The same Google, GitHub, or email step creates your account.
        Period dates, symptoms, and self-care then save there. Today’s note is
        general, not personalised.
      </p>
    </form>
  );
}

function oauthSetupMessage(
  provider: "google" | "github",
  detail: string,
): string {
  const label = provider === "github" ? "GitHub" : "Google";
  const lower = detail.toLowerCase();
  if (
    lower.includes("provider") ||
    lower.includes("unsupported") ||
    lower.includes("disabled") ||
    lower.includes("validation")
  ) {
    return `${label} is not turned on in Supabase yet. Enable the ${label} provider, or use the email link.`;
  }
  return `${label} sign-in could not start. Enable ${label} in Supabase Auth, or use the email link.`;
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="currentColor"
        d="M12 1.5C6.2 1.5 1.5 6.24 1.5 12.1c0 4.69 2.97 8.66 7.1 10.06.52.1.71-.23.71-.51 0-.25-.01-.92-.01-1.8-2.89.64-3.5-1.42-3.5-1.42-.47-1.22-1.15-1.55-1.15-1.55-.94-.66.07-.65.07-.65 1.04.08 1.59 1.09 1.59 1.09.93 1.62 2.43 1.15 3.02.88.09-.69.36-1.15.66-1.42-2.31-.27-4.74-1.18-4.74-5.25 0-1.16.4-2.11 1.07-2.85-.11-.27-.46-1.36.1-2.84 0 0 .87-.28 2.85 1.09a9.6 9.6 0 0 1 5.18 0c1.98-1.37 2.85-1.09 2.85-1.09.56 1.48.21 2.57.1 2.84.67.74 1.07 1.69 1.07 2.85 0 4.08-2.44 4.97-4.76 5.23.37.33.71.97.71 1.96 0 1.42-.01 2.56-.01 2.91 0 .28.19.62.72.51A10.62 10.62 0 0 0 22.5 12.1C22.5 6.24 17.8 1.5 12 1.5Z"
      />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.97 6.97 0 0 1 5.48 12c0-.72.12-1.43.36-2.09V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.16-3.16C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
      />
    </svg>
  );
}
