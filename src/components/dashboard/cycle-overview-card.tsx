import Link from "next/link";
import { CalendarDays, Droplets } from "lucide-react";
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
  MOCK_DATA_NOTICE,
  type MockCycleOverview,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface CycleOverviewCardProps {
  cycle: MockCycleOverview;
  /** When true, shows a preview badge (marketing / sample UI). */
  isPreviewSample?: boolean;
}

export function CycleOverviewCard({
  cycle,
  isPreviewSample = false,
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
            Begin with a period start date to unlock phase context here.
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
              Nothing is logged yet. Open the tracker to prepare your first
              period entry — saving and predictions are not live in this
              preview.
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
      : 0;

  return (
    <Card className="animate-fade-up-delay-1 flex h-full min-h-0 flex-col">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-xl md:text-xl">Cycle overview</CardTitle>
          {isPreviewSample ? (
            <Badge variant="outline" title={MOCK_DATA_NOTICE}>
              Preview sample
            </Badge>
          ) : null}
        </div>
        <CardDescription>
          A calm snapshot of your current phase — not a medical prediction.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Day</p>
            <p className="font-serif text-4xl tracking-tight text-plum sm:text-5xl">
              {cycle.currentDay}
              <span className="text-xl text-muted-foreground sm:text-2xl">
                /{cycle.cycleLength}
              </span>
            </p>
          </div>
          <Badge variant="rose">{cycle.phaseLabel}</Badge>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Cycle progress</span>
            <span>{progress}%</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Cycle progress"
          >
            <div
              className="h-full rounded-full bg-plum-soft transition-[width] duration-700 motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {cycle.lastPeriodStart ? (
          <p className="text-sm text-muted-foreground">
            Last period start in this preview:{" "}
            <time dateTime={cycle.lastPeriodStart}>{cycle.lastPeriodStart}</time>
          </p>
        ) : null}
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
