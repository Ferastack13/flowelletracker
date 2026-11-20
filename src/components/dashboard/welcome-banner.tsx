import { Bell } from "lucide-react";
import { displayInitials } from "@/lib/settings-data";

interface WelcomeBannerProps {
  subtitle?: string;
  signedIn?: boolean;
  displayName?: string;
  photoUrl?: string | null;
  cycleSummary?: string;
}

export function WelcomeBanner({
  subtitle = "A calm overview of your cycle, care, and daily note.",
  signedIn = false,
  displayName,
  photoUrl,
  cycleSummary,
}: WelcomeBannerProps) {
  const initials = displayInitials(displayName ?? "");

  return (
    <section
      className="animate-fade-up rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-rose-soft/20 px-5 py-5 shadow-soft sm:px-6"
      aria-labelledby="welcome-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-rose/30 bg-rose-soft/40 text-sm font-medium text-plum">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span aria-hidden="true">{initials}</span>
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-medium tracking-[0.14em] text-rose-muted uppercase">
              Today
            </p>
            <h1
              id="welcome-heading"
              className="font-serif text-2xl tracking-tight text-plum sm:text-[1.75rem]"
            >
              {displayName ? `Welcome, ${displayName}` : "Welcome to your space"}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {cycleSummary || subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card text-plum"
            title="Reminder preferences live in Settings. Delivery is not enabled yet."
          >
            <Bell className="size-4" aria-hidden="true" />
            <span className="sr-only">
              Notifications are preference-only for now. Open Settings to manage
              reminder choices.
            </span>
          </span>
          <p className="hidden max-w-[12rem] text-xs leading-relaxed text-muted-foreground sm:block">
            {signedIn
              ? "Signed in. Your records stay with your account."
              : "Preview mode. Sign in to save records."}
          </p>
        </div>
      </div>
    </section>
  );
}
