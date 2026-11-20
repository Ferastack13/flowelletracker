"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CyclePeriod } from "@/lib/cycle";
import type {
  FertileWindowEstimate,
  OvulationEstimate,
} from "@/lib/cycle-intelligence";
import { formatLocalDate } from "@/lib/self-care";
import { cn } from "@/lib/utils";

interface CycleCalendarProps {
  periods: CyclePeriod[];
  ovulation: OvulationEstimate;
  fertileWindow: FertileWindowEstimate;
  showEstimates: boolean;
}

function monthLabel(year: number, monthIndex: number): string {
  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function inRange(date: string, start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  return date >= start && date <= end;
}

function isRecordedPeriodDay(date: string, periods: CyclePeriod[]): boolean {
  return periods.some((period) => {
    if (date < period.startedOn) return false;
    if (period.endedOn) return date <= period.endedOn;
    return date === period.startedOn;
  });
}

export function CycleCalendar({
  periods,
  ovulation,
  fertileWindow,
  showEstimates,
}: CycleCalendarProps) {
  const today = formatLocalDate(new Date());
  const initial = today.split("-").map(Number);
  const [year, setYear] = useState(initial[0] ?? 2026);
  const [monthIndex, setMonthIndex] = useState((initial[1] ?? 1) - 1);
  const [selected, setSelected] = useState<string | null>(today);

  const cells = useMemo(() => {
    const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
    const total = daysInMonth(year, monthIndex);
    const leading = Array.from({ length: firstWeekday }, () => null);
    const days = Array.from({ length: total }, (_, index) => {
      const day = index + 1;
      const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return iso;
    });
    return [...leading, ...days];
  }, [year, monthIndex]);

  function shiftMonth(delta: number) {
    const date = new Date(Date.UTC(year, monthIndex + delta, 1));
    setYear(date.getUTCFullYear());
    setMonthIndex(date.getUTCMonth());
  }

  const selectedDetail = selected
    ? {
        recorded: isRecordedPeriodDay(selected, periods),
        fertile:
          showEstimates &&
          inRange(
            selected,
            fertileWindow.windowStart,
            fertileWindow.windowEnd,
          ),
        ovulation:
          showEstimates &&
          inRange(selected, ovulation.windowStart, ovulation.windowEnd),
        today: selected === today,
      }
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-xl md:text-xl">Cycle calendar</CardTitle>
          <CardDescription>
            Recorded bleeding days stay distinct from future estimates.
          </CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-serif text-lg text-plum">
          {monthLabel(year, monthIndex)}
        </p>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, index) => {
            if (!date) {
              return <span key={`empty-${index}`} className="h-10" />;
            }
            const recorded = isRecordedPeriodDay(date, periods);
            const fertile =
              showEstimates &&
              inRange(date, fertileWindow.windowStart, fertileWindow.windowEnd);
            const ovulating =
              showEstimates &&
              inRange(date, ovulation.windowStart, ovulation.windowEnd);
            const isToday = date === today;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelected(date)}
                className={cn(
                  "flex h-10 flex-col items-center justify-center rounded-lg text-sm transition-colors",
                  selected === date
                    ? "bg-plum text-ivory"
                    : "hover:bg-muted/60 text-plum",
                  isToday && selected !== date && "ring-1 ring-plum/40",
                )}
                aria-pressed={selected === date}
              >
                <span>{Number(date.slice(-2))}</span>
                <span className="mt-0.5 flex gap-0.5">
                  {recorded ? (
                    <span className="size-1 rounded-full bg-rose-muted" />
                  ) : null}
                  {ovulating ? (
                    <span className="size-1 rounded-full bg-plum-soft" />
                  ) : null}
                  {fertile && !ovulating ? (
                    <span className="size-1 rounded-full bg-sage-deep" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rose-muted" /> Recorded period
          </span>
          {showEstimates ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-sage-deep" /> Estimated fertile
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-plum-soft" /> Estimated ovulation
              </span>
            </>
          ) : null}
        </div>
        {selected && selectedDetail ? (
          <div className="rounded-xl border border-border/70 bg-muted/25 px-4 py-3 text-sm">
            <p className="font-medium text-plum">
              <time dateTime={selected}>{selected}</time>
              {selectedDetail.today ? " · Today" : ""}
            </p>
            <p className="mt-1 text-muted-foreground">
              {selectedDetail.recorded
                ? "A recorded period day is saved for this date."
                : selectedDetail.ovulation
                  ? "This date falls in your estimated ovulation window."
                  : selectedDetail.fertile
                    ? "This date falls in your estimated fertile window."
                    : "No recorded period day for this date."}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
