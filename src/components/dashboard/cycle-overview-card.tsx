"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CycleRing } from "@/components/dashboard/cycle-ring";
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
import type { CyclePeriod } from "@/lib/cycle";
import { buildCycleIntelligence } from "@/lib/cycle-intelligence";
import { formatLocalDate } from "@/lib/self-care";
import { cn } from "@/lib/utils";

interface CycleOverviewCardProps {
  periods: CyclePeriod[];
  signedIn?: boolean;
  showCycleEstimate?: boolean;
  usualCycleLengthDays?: number | null;
}

export function CycleOverviewCard({
  periods,
  signedIn = false,
  showCycleEstimate = true,
  usualCycleLengthDays = null,
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

  const intelligence = buildCycleIntelligence(periods, {
    today,
    usualCycleLengthDays,
  });
  const { overview, nextPeriod, progressPercent } = intelligence;
  const status = overview.periodStatus;
  const day = status.cycleDay ?? overview.currentDay;

  let ringHeadline = "Set up your cycle";
  if (status.presence === "started-today" || status.presence === "recorded-bleeding") {
    ringHeadline = "Period in progress";
  } else if (nextPeriod.daysUntil != null && showCycleEstimate) {
    if (nextPeriod.daysUntil > 0) {
      ringHeadline = `${nextPeriod.daysUntil} day${nextPeriod.daysUntil === 1 ? "" : "s"} until period`;
    } else if (nextPeriod.daysUntil === 0) {
      ringHeadline = "Period may be due";
    } else {
      ringHeadline = `${Math.abs(nextPeriod.daysUntil)} day${Math.abs(nextPeriod.daysUntil) === 1 ? "" : "s"} past estimate`;
    }
  } else if (day != null) {
    ringHeadline = `Cycle day ${day}`;
  }

  if (!overview.hasCycleData) {
    return (
      <Card className="flex h-full min-h-0 flex-col overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl md:text-xl">Cycle overview</CardTitle>
            <Badge variant="outline">New here</Badge>
          </div>
          <CardDescription>
            {signedIn
              ? "Complete setup with your most recent period dates. Flowelle will not invent a 28-day cycle."
              : "Sign in to save period dates and see a personalised overview."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center py-6">
          <CycleRing
            progressPercent={null}
            headline="Welcome in"
            detail={
              signedIn
                ? "Your circular progress appears after a period start is saved."
                : "Preview mode does not store cycle data."
            }
            cycleDay={null}
            cycleLength={null}
          />
        </CardContent>
        <CardFooter>
          <Link href="/cycle" className={cn(buttonVariants())}>
            {signedIn ? "Open cycle setup" : "Sign in to begin"}
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
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
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
        <CycleRing
          progressPercent={showCycleEstimate ? progressPercent : null}
          headline={ringHeadline}
          detail={
            showCycleEstimate
              ? nextPeriod.source === "reported"
                ? "Progress uses the usual cycle length you reported until more history is recorded."
                : nextPeriod.source === "history"
                  ? "Progress uses your recorded cycle history."
                  : "Add another period start or a usual cycle length for progress against a typical length."
              : "Cycle estimates are hidden in Settings. Your logged dates are unchanged."
          }
          cycleDay={day}
          cycleLength={showCycleEstimate ? nextPeriod.typicalLengthDays : null}
        />
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        <Link href="/cycle" className={cn(buttonVariants({ variant: "outline" }))}>
          Open tracker
        </Link>
        {nextPeriod.source === "reported" ? (
          <p className="text-xs text-muted-foreground">
            Reported usual length: {nextPeriod.typicalLengthDays} days
          </p>
        ) : null}
      </CardFooter>
    </Card>
  );
}
