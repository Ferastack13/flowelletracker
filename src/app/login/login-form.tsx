"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [status, setStatus] = useState<
    "idle" | "google" | "email" | "sent" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const busy = status === "google" || status === "email";

  async function handleGoogle() {
    setStatus("google");
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        setStatus("error");
        setMessage(
          "Google sign-in could not start. Use the email link, or check that Google is enabled in Supabase.",
        );
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong starting Google sign-in. Try email instead.");
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
        onClick={handleGoogle}
      >
        <GoogleMark />
        {status === "google" ? "Continuing…" : "Continue with Google"}
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
        New here? The same Google or email step creates your account. Period
        dates, symptoms, and self-care then save there. Today’s note is
        general, not personalised.
      </p>
    </form>
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
