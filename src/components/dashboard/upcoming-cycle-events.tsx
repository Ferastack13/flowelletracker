import { CalendarRange, Droplets, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  FertileWindowEstimate,
  OvulationEstimate,
  PersonalizedNextPeriod,
} from "@/lib/cycle-intelligence";

interface UpcomingCycleEventsProps {
  nextPeriod: PersonalizedNextPeriod;
  ovulation: OvulationEstimate;
  fertileWindow: FertileWindowEstimate;
  showEstimates: boolean;
}

function formatRange(start: string | null, end: string | null): string {
  if (!start) return "Not estimated yet";
  if (!end || end === start) return start;
  return `${start} – ${end}`;
}

export function UpcomingCycleEvents({
  nextPeriod,
  ovulation,
  fertileWindow,
  showEstimates,
}: UpcomingCycleEventsProps) {
  if (!showEstimates) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Upcoming cycle</CardTitle>
          <CardDescription>
            Next-period and fertility estimates are hidden in Settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const items = [
    {
      id: "period",
      title: "Next estimated period",
      value:
        nextPeriod.status === "none"
          ? "Not estimated yet"
          : formatRange(nextPeriod.windowStart, nextPeriod.windowEnd),
      detail: nextPeriod.reason,
      icon: Droplets,
    },
    {
      id: "ovulation",
      title: "Estimated ovulation",
      value:
        ovulation.status === "none"
          ? "Not estimated yet"
          : formatRange(ovulation.windowStart, ovulation.windowEnd),
      detail: ovulation.reason,
      icon: Sparkles,
    },
    {
      id: "fertile",
      title: "Estimated fertile window",
      value:
        fertileWindow.status === "none"
          ? "Not estimated yet"
          : formatRange(fertileWindow.windowStart, fertileWindow.windowEnd),
      detail: fertileWindow.reason,
      icon: CalendarRange,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl md:text-xl">Upcoming cycle</CardTitle>
        <CardDescription>
          Predictions update when you save new valid period starts. They cannot
          confirm ovulation or replace contraception.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-border/70 bg-muted/25 p-4"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-rose-soft/50 text-plum">
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <p className="text-xs tracking-[0.08em] text-muted-foreground uppercase">
                {item.title}
              </p>
              <p className="mt-1 font-serif text-lg tracking-tight text-plum">
                {item.value}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
