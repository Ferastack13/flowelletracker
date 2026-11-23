"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteBleedingLog,
  deletePeriodRecord,
  logPeriodStart,
  savePeriodEnd,
  updatePeriodRecord,
  upsertBleedingLog,
  type CycleActionState,
} from "@/app/cycle/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CycleEstimateSummary } from "@/components/cycle/cycle-estimate-summary";
import {
  BLEEDING_INTENSITY_OPTIONS,
  bleedingIntensityLabel,
  type PeriodBleedingLog,
} from "@/lib/bleeding";
import {
  buildCycleOverview,
  intervalStatusLabel,
  type CyclePeriod,
} from "@/lib/cycle";
import { buildCycleIntelligence } from "@/lib/cycle-intelligence";
import { periodDurationDays } from "@/lib/cycle-records";
import { formatLocalDate } from "@/lib/self-care";
import { cn } from "@/lib/utils";

const initialState: CycleActionState = { status: "idle", message: "" };

const fieldClassName =
  "flex h-11 w-full rounded-md border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-soft transition-colors disabled:cursor-not-allowed disabled:opacity-50";

interface CycleTrackerProps {
  signedIn: boolean;
  periods: CyclePeriod[];
  bleedingLogs: PeriodBleedingLog[];
  showCycleEstimate?: boolean;
  usualCycleLengthDays?: number | null;
}

export function CycleTracker({
  signedIn,
  periods,
  bleedingLogs,
  showCycleEstimate = true,
  usualCycleLengthDays = null,
}: CycleTrackerProps) {
  const router = useRouter();
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(formatLocalDate(new Date()));
  }, []);
  const [startState, startAction, startPending] = useActionState(
    logPeriodStart,
    initialState,
  );
  const [endState, endAction, endPending] = useActionState(
    savePeriodEnd,
    initialState,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updatePeriodRecord,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePeriodRecord,
    initialState,
  );
  const [bleedingState, bleedingAction, bleedingPending] = useActionState(
    upsertBleedingLog,
    initialState,
  );
  const [bleedingDeleteState, bleedingDeleteAction, bleedingDeletePending] =
    useActionState(deleteBleedingLog, initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmingBleedId, setConfirmingBleedId] = useState<string | null>(
    null,
  );
  const [bleedFocusId, setBleedFocusId] = useState<string | null>(null);

  useEffect(() => {
    if (updateState.status === "success") {
      setEditingId(null);
      setConfirmingId(null);
    }
  }, [updateState]);

  useEffect(() => {
    if (deleteState.status === "success") {
      setEditingId(null);
      setConfirmingId(null);
    }
  }, [deleteState]);

  useEffect(() => {
    if (bleedingDeleteState.status === "success") {
      setConfirmingBleedId(null);
    }
  }, [bleedingDeleteState]);

  useEffect(() => {
    const leaveAfterSave = [
      startState.status,
      endState.status,
      updateState.status,
      deleteState.status,
      bleedingState.status,
      bleedingDeleteState.status,
    ].includes("success");
    if (!leaveAfterSave) return;

    const timer = window.setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [
    startState.status,
    endState.status,
    updateState.status,
    deleteState.status,
    bleedingState.status,
    bleedingDeleteState.status,
    router,
  ]);

  const logsByPeriod = useMemo(() => {
    const map = new Map<string, PeriodBleedingLog[]>();
    for (const entry of bleedingLogs) {
      const list = map.get(entry.periodId) ?? [];
      list.push(entry);
      map.set(entry.periodId, list);
    }
    for (const [key, list] of map) {
      map.set(
        key,
        [...list].sort((a, b) =>
          a.loggedOn === b.loggedOn
            ? a.id.localeCompare(b.id)
            : a.loggedOn < b.loggedOn
              ? -1
              : 1,
        ),
      );
    }
    return map;
  }, [bleedingLogs]);

  if (!signedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Sign in to log</CardTitle>
          <CardDescription>
            Period dates and bleeding days are stored only for your account.
            Previewing the dashboard does not save anything.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className={cn(buttonVariants())}>
            Sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  const overview = today ? buildCycleOverview(periods, today) : null;
  const intelligence =
    today
      ? buildCycleIntelligence(periods, {
          today,
          usualCycleLengthDays,
        })
      : null;
  const historyById = new Map(
    (overview?.history ?? []).map((item) => [item.period.id, item]),
  );

  return (
    <div className="flex flex-col gap-6">
      {overview ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-xl">
              {overview.periodStatus.headline}
            </CardTitle>
            <CardDescription>{overview.periodStatus.detail}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Checking today’s date…</p>
      )}
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-xl">
              Log a period start
            </CardTitle>
            <CardDescription>
              Record the first day of bleeding. You can add an end date and
              daily intensity later. Next-period windows use starts, not a
              fixed 28-day length.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={startAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startedOn">Start date</Label>
                <Input
                  id="startedOn"
                  name="startedOn"
                  type="date"
                  required
                  disabled={startPending}
                />
              </div>
              <Button type="submit" disabled={startPending}>
                {startPending ? "Saving…" : "Save start date"}
              </Button>
              {startState.message ? (
                <p
                  className={
                    startState.status === "error"
                      ? "text-sm text-destructive"
                      : "text-sm text-muted-foreground"
                  }
                  role="status"
                >
                  {startState.message}
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-xl">Recent periods</CardTitle>
            <CardDescription>
              Ongoing periods stay open until you add an end date. Duration is
              counted inclusively from start to end.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {periods.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No periods saved yet. Log a start date to begin.
              </p>
            ) : (
              <ul className="space-y-4">
                {periods.map((period) => {
                  const item = historyById.get(period.id);
                  const duration = periodDurationDays(
                    period.startedOn,
                    period.endedOn,
                  );
                  const periodLogs = logsByPeriod.get(period.id) ?? [];
                  const ongoing = !period.endedOn;
                  return (
                    <li
                      key={period.id}
                      className="rounded-lg border border-border/70 bg-muted/30 p-3"
                    >
                      <p className="text-sm text-plum">
                        Started{" "}
                        <time dateTime={period.startedOn}>
                          {period.startedOn}
                        </time>
                      </p>
                      {today && period.startedOn > today ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          This start is after today, so it is not used as a
                          current period. Edit the date if it was entered by
                          mistake.
                        </p>
                      ) : null}
                      {period.endedOn ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ended{" "}
                          <time dateTime={period.endedOn}>
                            {period.endedOn}
                          </time>
                          {duration != null
                            ? ` · lasted ${duration} day${duration === 1 ? "" : "s"}`
                            : ""}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ongoing — no end date yet.
                        </p>
                      )}
                      {item?.lengthDays != null && item.intervalStatus ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Cycle to next start: {item.lengthDays} days ·{" "}
                          {intervalStatusLabel(item.intervalStatus)}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">
                          No later start recorded yet, so this cycle length is
                          still open.
                        </p>
                      )}

                      {editingId === period.id ? (
                        <form action={updateAction} className="mt-3 space-y-3">
                          <input
                            type="hidden"
                            name="periodId"
                            value={period.id}
                          />
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="space-y-1">
                              <Label
                                htmlFor={`startedOn-${period.id}`}
                                className="text-xs"
                              >
                                Start date
                              </Label>
                              <Input
                                id={`startedOn-${period.id}`}
                                name="startedOn"
                                type="date"
                                defaultValue={period.startedOn}
                                required
                                disabled={updatePending}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label
                                htmlFor={`editEndedOn-${period.id}`}
                                className="text-xs"
                              >
                                End date
                              </Label>
                              <Input
                                id={`editEndedOn-${period.id}`}
                                name="endedOn"
                                type="date"
                                defaultValue={period.endedOn ?? ""}
                                min={period.startedOn}
                                disabled={updatePending}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Leave end empty to keep this period ongoing.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="submit"
                              size="sm"
                              disabled={updatePending}
                            >
                              {updatePending ? "Saving…" : "Save changes"}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={updatePending}
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {ongoing ? (
                            <form
                              action={endAction}
                              className="flex flex-wrap items-end gap-2"
                            >
                              <input
                                type="hidden"
                                name="periodId"
                                value={period.id}
                              />
                              <div className="space-y-1">
                                <Label
                                  htmlFor={`endedOn-${period.id}`}
                                  className="text-xs"
                                >
                                  End date
                                </Label>
                                <Input
                                  id={`endedOn-${period.id}`}
                                  name="endedOn"
                                  type="date"
                                  min={period.startedOn}
                                  required
                                  disabled={endPending}
                                />
                              </div>
                              <Button
                                type="submit"
                                size="sm"
                                variant="outline"
                                disabled={endPending}
                              >
                                {endPending ? "Saving…" : "Mark ended"}
                              </Button>
                            </form>
                          ) : null}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={updatePending || deletePending}
                            onClick={() => {
                              setEditingId(period.id);
                              setConfirmingId(null);
                              setBleedFocusId(null);
                            }}
                          >
                            Edit dates
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={bleedingPending}
                            onClick={() =>
                              setBleedFocusId(
                                bleedFocusId === period.id ? null : period.id,
                              )
                            }
                          >
                            {bleedFocusId === period.id
                              ? "Hide bleeding"
                              : "Daily bleeding"}
                          </Button>
                          {confirmingId === period.id ? (
                            <form action={deleteAction}>
                              <input
                                type="hidden"
                                name="periodId"
                                value={period.id}
                              />
                              <input type="hidden" name="confirm" value="yes" />
                              <Button
                                type="submit"
                                size="sm"
                                variant="outline"
                                disabled={deletePending}
                              >
                                {deletePending
                                  ? "Removing…"
                                  : "Confirm remove"}
                              </Button>
                            </form>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={deletePending}
                              onClick={() => setConfirmingId(period.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      )}

                      {(bleedFocusId === period.id || periodLogs.length > 0) &&
                      editingId !== period.id ? (
                        <div className="mt-4 space-y-3 border-t border-border/60 pt-3">
                          <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
                            Daily bleeding
                          </p>
                          {periodLogs.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                              No daily intensity saved for this period yet.
                            </p>
                          ) : (
                            <ul className="space-y-2">
                              {periodLogs.map((entry) => (
                                <li
                                  key={entry.id}
                                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                                >
                                  <span>
                                    <time dateTime={entry.loggedOn}>
                                      {entry.loggedOn}
                                    </time>
                                    {" · "}
                                    {bleedingIntensityLabel(entry.intensity)}
                                  </span>
                                  {confirmingBleedId === entry.id ? (
                                    <form action={bleedingDeleteAction}>
                                      <input
                                        type="hidden"
                                        name="bleedingId"
                                        value={entry.id}
                                      />
                                      <input
                                        type="hidden"
                                        name="confirm"
                                        value="yes"
                                      />
                                      <Button
                                        type="submit"
                                        size="sm"
                                        variant="outline"
                                        disabled={bleedingDeletePending}
                                      >
                                        {bleedingDeletePending
                                          ? "Removing…"
                                          : "Confirm"}
                                      </Button>
                                    </form>
                                  ) : (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      disabled={bleedingDeletePending}
                                      onClick={() =>
                                        setConfirmingBleedId(entry.id)
                                      }
                                    >
                                      Remove day
                                    </Button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                          {bleedFocusId === period.id ? (
                            <form
                              action={bleedingAction}
                              className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                            >
                              <input
                                type="hidden"
                                name="periodId"
                                value={period.id}
                              />
                              <div className="space-y-1">
                                <Label
                                  htmlFor={`bleed-on-${period.id}`}
                                  className="text-xs"
                                >
                                  Date
                                </Label>
                                <Input
                                  id={`bleed-on-${period.id}`}
                                  name="loggedOn"
                                  type="date"
                                  min={period.startedOn}
                                  max={
                                    period.endedOn ??
                                    (today ? today : undefined)
                                  }
                                  required
                                  disabled={bleedingPending}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label
                                  htmlFor={`bleed-intensity-${period.id}`}
                                  className="text-xs"
                                >
                                  Intensity
                                </Label>
                                <select
                                  id={`bleed-intensity-${period.id}`}
                                  name="intensity"
                                  required
                                  disabled={bleedingPending}
                                  className={fieldClassName}
                                  defaultValue="medium"
                                >
                                  {BLEEDING_INTENSITY_OPTIONS.map((option) => (
                                    <option key={option.id} value={option.id}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-end">
                                <Button
                                  type="submit"
                                  size="sm"
                                  disabled={bleedingPending}
                                >
                                  {bleedingPending ? "Saving…" : "Save day"}
                                </Button>
                              </div>
                            </form>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
            {[
              endState,
              updateState,
              deleteState,
              bleedingState,
              bleedingDeleteState,
            ]
              .filter((state) => state.message)
              .map((state) => (
                <p
                  key={`${state.status}-${state.message}`}
                  className={
                    state.status === "error"
                      ? "mt-3 text-sm text-destructive"
                      : "mt-3 text-sm text-muted-foreground"
                  }
                  role="status"
                >
                  {state.message}
                </p>
              ))}
          </CardContent>
        </Card>
      </div>
      <Card id="history" className="scroll-mt-24">
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Recorded cycles</CardTitle>
          <CardDescription>
            Cycle length is the days between consecutive starts. Period duration
            is the inclusive bleeding span for one period. Dashboard estimates
            use this same history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {intelligence && showCycleEstimate ? (
            <>
              <CycleEstimateSummary
                estimate={{
                  status:
                    intelligence.nextPeriod.status === "reported"
                      ? "limited"
                      : intelligence.nextPeriod.status === "none"
                        ? "none"
                        : intelligence.nextPeriod.status,
                  reason: intelligence.nextPeriod.reason,
                  typicalLengthDays: intelligence.nextPeriod.typicalLengthDays,
                  estimatedStart: intelligence.nextPeriod.estimatedStart,
                  windowStart: intelligence.nextPeriod.windowStart,
                  windowEnd: intelligence.nextPeriod.windowEnd,
                  completedCyclesUsed:
                    intelligence.nextPeriod.completedCyclesUsed,
                }}
              />
              {intelligence.nextPeriod.source === "reported" ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Source: your reported usual cycle length (
                  {intelligence.nextPeriod.typicalLengthDays} days), not multiple
                  recorded cycles yet.
                </p>
              ) : null}
              {intelligence.ovulation.status === "estimated" ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Estimated ovulation:{" "}
                  {intelligence.ovulation.windowStart ===
                  intelligence.ovulation.windowEnd
                    ? intelligence.ovulation.midpoint
                    : `${intelligence.ovulation.windowStart} – ${intelligence.ovulation.windowEnd}`}
                  . This cannot confirm ovulation.
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {intelligence.ovulation.reason}
                </p>
              )}
            </>
          ) : overview && !showCycleEstimate ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              The next-period window is hidden in Settings. Lengths between
              recorded starts still appear above.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Checking today’s date…
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
