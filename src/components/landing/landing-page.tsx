import Link from "next/link";
import {
  BookOpen,
  HeartHandshake,
  Lock,
  Sparkles,
  Waves,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ProductPreview } from "@/components/landing/product-preview";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Cycle clarity",
    description:
      "Log period dates and everyday symptoms in a calm interface designed for understanding — not alarmist predictions.",
    icon: Waves,
  },
  {
    title: "Self-care rhythm",
    description:
      "Build gentle habits that move with your energy across the month, one small ritual at a time.",
    icon: HeartHandshake,
  },
  {
    title: "Her Daily Note",
    description:
      "Receive a thoughtful daily message. It is general for the date, not written from your cycle.",
    icon: Sparkles,
  },
  {
    title: "Learn with care",
    description:
      "Editorial guides that respect your body literacy without shame, clutter, or medical overclaim.",
    icon: BookOpen,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow-lift"
      >
        Skip to main content
      </a>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Logo size="md" />
        <nav aria-label="Marketing" className="flex items-center gap-2 sm:gap-3">
          <Link
            href="#features"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-plum sm:inline"
          >
            Features
          </Link>
          <Link
            href="#privacy"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-plum sm:inline"
          >
            Privacy
          </Link>
          <Link
            href="/dashboard"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-plum md:inline"
          >
            Dashboard
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Sign in
          </Link>
          <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
            Sign up
          </Link>
        </nav>
      </header>

      <main id="main-content">
        {/* Hero — brand first, one composition */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgb(214_154_168/0.28),transparent_45%),radial-gradient(ellipse_at_90%_20%,rgb(165_169_149/0.22),transparent_40%)]"
            aria-hidden="true"
          />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
            <div className="animate-fade-up">
              <p className="mb-4 font-serif text-5xl tracking-tight text-plum sm:text-6xl lg:text-7xl">
                Flowelle
              </p>
              <p className="mb-5 text-sm font-medium tracking-[0.16em] text-rose-muted uppercase">
                Your cycle. Your care. Your rhythm.
              </p>
              <h1 className="max-w-xl text-balance font-serif text-3xl leading-tight text-plum sm:text-4xl">
                A premium space to understand your cycle and care for yourself
                with intention.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                Log period dates, nurture self-care habits, and receive a
                thoughtful daily note — designed with editorial calm, not
                clinical noise.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Sign in or sign up
                </Link>
                <Link
                  href="#features"
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "lg" }),
                  )}
                >
                  See how it works
                </Link>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Sign in to save period dates, symptoms, and self-care. Today’s
                note is general.
              </p>
            </div>
            <ProductPreview />
          </div>
        </section>

        <section
          id="features"
          className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-2xl text-center animate-fade-up">
            <Badge variant="soft">What Flowelle offers</Badge>
            <h2
              id="features-heading"
              className="mt-4 font-serif text-3xl tracking-tight text-plum md:text-4xl"
            >
              Built for body literacy and everyday tenderness
            </h2>
            <p className="mt-3 text-muted-foreground">
              Four pillars that stay clear, private, and unhurried.
            </p>
          </div>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <li
                  key={feature.title}
                  className={cn(
                    index % 2 === 0
                      ? "animate-fade-up-delay-1"
                      : "animate-fade-up-delay-2",
                  )}
                >
                  <Card className="h-full transition-shadow duration-300 hover:shadow-lift">
                    <CardHeader>
                      <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-sage-soft/70 text-plum">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <CardTitle className="text-xl md:text-xl">
                        {feature.title}
                      </CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="editorial-rule mx-auto max-w-3xl" aria-hidden="true" />

        <section
          className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20"
          aria-labelledby="preview-heading"
        >
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Badge variant="rose">Product preview</Badge>
              <h2
                id="preview-heading"
                className="mt-4 font-serif text-3xl tracking-tight text-plum md:text-4xl"
              >
                A dashboard that feels like a journal, not a clinic
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Welcome message, cycle overview, daily note, and self-care
                progress — arranged with generous space and restrained detail.
                Sample figures illustrate the layout; they are not your records.
              </p>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "soft", size: "lg" }),
                  "mt-6 inline-flex",
                )}
              >
                Explore the dashboard
              </Link>
            </div>
            <Card className="bg-gradient-to-br from-ivory-warm to-card">
              <CardContent className="space-y-4 p-6">
                {[
                  "Empty-state clarity when no cycle data exists",
                  "Period dates, symptom notes, and self-care check-ins save to your account",
                  "Mobile navigation that stays reachable and calm",
                ].map((item) => (
                  <p
                    key={item}
                    className="flex items-start gap-3 text-sm leading-relaxed text-plum"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-deep"
                      aria-hidden="true"
                    />
                    {item}
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section
          id="privacy"
          className="border-y border-border/60 bg-card/50"
          aria-labelledby="privacy-heading"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 sm:flex-row sm:items-start sm:px-6 lg:py-20">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-plum text-ivory">
              <Lock className="size-5" aria-hidden="true" />
            </div>
            <div className="max-w-2xl">
              <h2
                id="privacy-heading"
                className="font-serif text-3xl tracking-tight text-plum"
              >
                Your health story stays yours
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Flowelle is being built with privacy as a foundation. Cycle
                details should never feel exposed or performative. Sign-in,
                period dates, symptom notes, and self-care check-ins save
                privately to your account. Personalised notes are not stored
                yet.
              </p>
            </div>
          </div>
        </section>

        <section
          className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6 lg:py-24"
          aria-labelledby="cta-heading"
        >
          <h2
            id="cta-heading"
            className="font-serif text-3xl tracking-tight text-plum md:text-4xl"
          >
            Begin in your space
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Sign in to save period dates, symptoms, and self-care. Today’s note
            is already here. Personalised notes are not live yet.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
              Sign in or sign up
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              View dashboard
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo size="sm" href="/" />
          <p>© 2026 Flowelle. Crafted with care.</p>
        </div>
      </footer>
    </div>
  );
}
