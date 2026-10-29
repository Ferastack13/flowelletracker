"use client";

import { useEffect, useState } from "react";
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
import {
  buildCycleOverview,
  type CyclePeriod,
} from "@/lib/cycle";
import { formatLocalDate } from "@/lib/self-care";
import { cn } from "@/lib/utils";

interface CycleOverviewCardProps {
  periods: CyclePeriod[];
  signedIn?: boolean;
  showCycleEstimate?: boolean;
}

export function CycleOverviewCard({
  periods,
  signedIn = false,
  showCycleEstimate = true,
}: CycleOverviewCardProps) {
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(formatLocalDate(new Date()));
  }, []);

  if (!today) {
    return (
      <Card className="flex h-full min-h-0 flex-col">
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Cycle overview</CardTitle>
          <CardDescription>Checking today’s date…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const cycle = buildCycleOverview(periods, today);
  const status = cycle.periodStatus;
  const day = status.cycleDay ?? cycle.currentDay;
  const progress =
    day && cycle.cycleLength
      ? Math.min(100, Math.round((day / cycle.cycleLength) * 100))
      : null;
  const pastTypical =
    Boolean(day && cycle.cycleLength && day > cycle.cycleLength);

  if (!cycle.hasCycleData) {
    return (
      <Card className="flex h-full min-h-0 flex-col">
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
                className={cn(buttonVariants({ variant: "default" }))}
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

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-xl md:text-xl">Cycle overview</CardTitle>
          <Badge
            variant={
              status.presence === "started-today" ||
              status.presence === "recorded-bleeding"
                ? "rose"
                : "outline"
            }
          >
            {status.headline}
          </Badge>
        </div>
        <CardDescription>{status.detail}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {status.presence === "started-today" ||
              status.presence === "recorded-bleeding"
                ? "Period day"
                : "Cycle day"}
            </p>
            <p className="font-serif text-4xl tracking-tight text-plum sm:text-5xl">
              {day ?? "—"}
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

        {progress != null && cycle.cycleLength && !pastTypical ? (
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
                className="h-full rounded-full bg-plum-soft"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : pastTypical && cycle.cycleLength ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            This is past your typical recorded length of {cycle.cycleLength}{" "}
            days. Flowelle is not filling the gap with a 28-day cycle.
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Progress is shown after Flowelle can calculate a typical length from
            at least two recorded starts.
          </p>
        )}

        {status.futureStartCount > 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {status.futureStartCount === 1
              ? "One saved start is after today."
              : `${status.futureStartCount} saved starts are after today.`}{" "}
            They are not counted as a current period. Edit them in the tracker
            if the date was a mistake.
          </p>
        ) : null}

        {showCycleEstimate ? (
          <CycleEstimateSummary estimate={cycle.estimate} />
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            The next-period window is hidden in Settings. Your logged dates are
            unchanged.
          </p>
        )}
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
