import Link from "next/link";
import { CalendarDays, Droplets } from "lucide-react";
import { CycleEstimateSummary } from "@/components/cycle/cycle-estimate-summary";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CycleOverview } from "@/lib/cycle";
import { cn } from "@/lib/utils";

interface CycleOverviewCardProps {
  cycle: CycleOverview;
  signedIn?: boolean;
}

export function CycleOverviewCard({
  cycle,
  signedIn = false,
}: CycleOverviewCardProps) {
  if (!cycle.hasCycleData) {
    return (
      <Card className="animate-fade-up-delay-1 flex h-full min-h-0 flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl md:text-xl">Cycle overview</CardTitle>
            <Badge variant="outline">No data yet</Badge>
          </div>
          <CardDescription>
            Begin with a period start date. Estimates appear only after more
            than one start is recorded.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-center">
          <div className="relative overflow-hidden rounded-xl border border-dashed border-rose/35 bg-gradient-to-b from-rose-soft/25 to-muted/40 px-5 py-8 text-center sm:px-8 sm:py-10">
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-rose/30 bg-card text-plum shadow-soft"
              aria-hidden="true"
            >
              <Droplets className="size-5" />
            </div>
            <h3 className="font-serif text-xl tracking-tight text-plum">
              Your cycle begins with one gentle entry
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {signedIn
                ? "No period start is saved yet. Log dates you already know — Flowelle will not invent a 28-day cycle for you."
                : "Sign in to save a period start. The tracker is ready; nothing is stored until you have an account."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/cycle"
                className={cn(buttonVariants({ variant: "default", size: "default" }))}
              >
                Log your period
              </Link>
              <Link
                href="/learn"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Learn about cycles
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress =
    cycle.currentDay && cycle.cycleLength
      ? Math.min(100, Math.round((cycle.currentDay / cycle.cycleLength) * 100))
      : null;

  return (
    <Card className="animate-fade-up-delay-1 flex h-full min-h-0 flex-col">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-xl md:text-xl">Cycle overview</CardTitle>
        </div>
        <CardDescription>
          Counted from your last logged start on or before today. Lengths come
          from your recorded starts, not a standard 28-day cycle.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {cycle.currentDay ? "Day" : "Cycle day"}
            </p>
            <p className="font-serif text-4xl tracking-tight text-plum sm:text-5xl">
              {cycle.currentDay ?? "—"}
              {cycle.cycleLength ? (
                <span className="text-xl text-muted-foreground sm:text-2xl">
                  /{cycle.cycleLength}
                </span>
              ) : null}
            </p>
          </div>
          <Badge variant="outline">
            {cycle.estimate.status === "approximate"
              ? "From your history"
              : cycle.estimate.status === "limited"
                ? "Limited history"
                : "Logged dates only"}
          </Badge>
        </div>

        {progress != null && cycle.cycleLength ? (
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Progress vs your typical recorded length of {cycle.cycleLength}{" "}
                days
              </span>
              <span>{progress}%</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progress through typical recorded cycle length"
            >
              <div
                className="h-full rounded-full bg-plum-soft transition-[width] duration-700 motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Progress is shown after Flowelle can calculate a typical length from
            at least two recorded starts.
          </p>
        )}

        {cycle.lastPeriodStart ? (
          <p className="text-sm text-muted-foreground">
            Last logged start:{" "}
            <time dateTime={cycle.lastPeriodStart}>{cycle.lastPeriodStart}</time>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            The saved start dates are in the future, so today is not counted
            from them.
          </p>
        )}

        <CycleEstimateSummary estimate={cycle.estimate} />
      </CardContent>
      <CardFooter className="mt-auto flex-wrap">
        <Link
          href="/cycle"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <CalendarDays className="size-4" aria-hidden="true" />
          Open tracker
        </Link>
      </CardFooter>
    </Card>
  );
}
