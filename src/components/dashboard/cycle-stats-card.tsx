import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CycleStatistics } from "@/lib/cycle-intelligence";
import { cn } from "@/lib/utils";

interface CycleStatsCardProps {
  statistics: CycleStatistics;
  irregular: boolean;
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-3">
      <p className="text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 font-serif text-xl text-plum">{value}</p>
    </div>
  );
}

export function CycleStatsCard({ statistics, irregular }: CycleStatsCardProps) {
  const hasCycleStats = statistics.usableCycleCount > 0;
  const hasPeriodStats = statistics.completedPeriodCount > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl md:text-xl">Cycle overview</CardTitle>
        <CardDescription>
          {hasCycleStats
            ? `Based on ${statistics.usableCycleCount} usable recorded cycle${statistics.usableCycleCount === 1 ? "" : "s"}.`
            : "Statistics appear after Flowelle has usable recorded intervals."}
          {irregular
            ? " Recorded lengths vary, so averages are shown cautiously."
            : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Stat
          label="Average cycle"
          value={
            hasCycleStats && statistics.averageCycleLength != null
              ? `${statistics.averageCycleLength}d`
              : "—"
          }
        />
        <Stat
          label="Cycle range"
          value={
            hasCycleStats &&
            statistics.shortestCycleLength != null &&
            statistics.longestCycleLength != null
              ? `${statistics.shortestCycleLength}–${statistics.longestCycleLength}d`
              : "—"
          }
        />
        <Stat
          label="Average period"
          value={
            hasPeriodStats && statistics.averagePeriodDuration != null
              ? `${statistics.averagePeriodDuration}d`
              : "—"
          }
        />
        <Stat
          label="Period range"
          value={
            hasPeriodStats &&
            statistics.shortestPeriodDuration != null &&
            statistics.longestPeriodDuration != null
              ? `${statistics.shortestPeriodDuration}–${statistics.longestPeriodDuration}d`
              : "—"
          }
        />
      </CardContent>
      <CardFooter>
        <Link href="/cycle" className={cn(buttonVariants({ variant: "outline" }))}>
          View cycle history
        </Link>
      </CardFooter>
    </Card>
  );
}
