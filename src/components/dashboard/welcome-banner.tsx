interface WelcomeBannerProps {
  /** Optional short supporting line under the heading. */
  subtitle?: string;
  signedIn?: boolean;
}

export function WelcomeBanner({
  subtitle = "A calm overview of your cycle, care, and daily note.",
  signedIn = false,
}: WelcomeBannerProps) {
  return (
    <section
      className="animate-fade-up rounded-xl border border-border/80 bg-card px-5 py-4 shadow-soft sm:px-6 sm:py-5"
      aria-labelledby="welcome-heading"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-medium tracking-[0.14em] text-rose-muted uppercase">
            Today
          </p>
          <h1
            id="welcome-heading"
            className="font-serif text-2xl tracking-tight text-plum sm:text-[1.75rem]"
          >
            Welcome to your space
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <p className="shrink-0 text-xs leading-relaxed text-muted-foreground sm:max-w-[14rem] sm:text-right">
          {signedIn
            ? "You are signed in. Cycle records and notes are still not saved."
            : "You can preview without an account. Tracking is not connected yet."}
        </p>
      </div>
    </section>
  );
}
