"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createSymptomLog,
  deleteSymptomLog,
  updateSymptomLog,
  type SymptomActionState,
} from "@/app/cycle/symptom-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatLocalDate } from "@/lib/self-care";
import {
  SYMPTOM_NOTE_MAX_LENGTH,
  SYMPTOM_OPTIONS,
  SYMPTOM_SEVERITIES,
  severityName,
  symptomName,
  type SymptomLog as SymptomLogEntry,
} from "@/lib/symptoms";
import { cn } from "@/lib/utils";

const initialState: SymptomActionState = { status: "idle", message: "" };

const fieldClassName =
  "flex h-11 w-full rounded-md border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-soft transition-colors disabled:cursor-not-allowed disabled:opacity-50";

interface SymptomLogProps {
  entries: SymptomLogEntry[];
}

export function SymptomLog({ entries }: SymptomLogProps) {
  const [today, setToday] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [createState, createAction, createPending] = useActionState(
    createSymptomLog,
    initialState,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateSymptomLog,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteSymptomLog,
    initialState,
  );

  useEffect(() => {
    setToday(formatLocalDate(new Date()));
  }, []);

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

  return (
    <div id="symptoms" className="grid scroll-mt-24 gap-6 lg:grid-cols-[1.15fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Log a symptom</CardTitle>
          <CardDescription>
            A personal record of how a day felt. Flowelle does not diagnose
            conditions from what you save.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {today ? (
            <form action={createAction} className="space-y-4">
              <SymptomFields
                idPrefix="new"
                defaultLoggedOn={today}
                maxDate={today}
                disabled={createPending}
              />
              <Button type="submit" disabled={createPending}>
                {createPending ? "Saving…" : "Save symptom"}
              </Button>
              <StatusMessage state={createState} />
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">Loading today’s date…</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-xl">Recent symptoms</CardTitle>
          <CardDescription>
            Edit or remove an entry you already saved. Nothing here is a medical
            reading.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No symptoms saved yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {entries.map((entry) => {
                const isEditing = editingId === entry.id;
                return (
                  <li
                    key={entry.id}
                    className="rounded-lg border border-border/70 bg-muted/30 p-3"
                  >
                    {isEditing ? (
                      <form action={updateAction} className="space-y-4">
                        <input type="hidden" name="entryId" value={entry.id} />
                        <SymptomFields
                          idPrefix={entry.id}
                          defaultLoggedOn={entry.loggedOn}
                          defaultSymptom={entry.symptom}
                          defaultSeverity={entry.severity}
                          defaultNotes={entry.notes ?? ""}
                          maxDate={today || entry.loggedOn}
                          disabled={updatePending}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button type="submit" size="sm" disabled={updatePending}>
                            {updatePending ? "Saving…" : "Save changes"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            disabled={updatePending}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <p className="text-sm text-plum">
                          {symptomName(entry.symptom)}
                          <span className="text-muted-foreground">
                            {" "}
                            · {severityName(entry.severity)}
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          <time dateTime={entry.loggedOn}>{entry.loggedOn}</time>
                        </p>
                        {entry.notes ? (
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {entry.notes}
                          </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(entry.id);
                              setConfirmingId(null);
                            }}
                            disabled={updatePending || deletePending}
                          >
                            Edit
                          </Button>
                          {confirmingId === entry.id ? (
                            <form action={deleteAction}>
                              <input type="hidden" name="entryId" value={entry.id} />
                              <Button
                                type="submit"
                                size="sm"
                                variant="outline"
                                disabled={deletePending}
                              >
                                {deletePending ? "Removing…" : "Confirm remove"}
                              </Button>
                            </form>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setConfirmingId(entry.id)}
                              disabled={deletePending}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <StatusMessage state={updateState} className="mt-3" />
          <StatusMessage state={deleteState} className="mt-3" />
        </CardContent>
      </Card>
    </div>
  );
}

function SymptomFields({
  idPrefix,
  defaultLoggedOn,
  defaultSymptom,
  defaultSeverity,
  defaultNotes,
  maxDate,
  disabled,
}: {
  idPrefix: string;
  defaultLoggedOn: string;
  defaultSymptom?: string;
  defaultSeverity?: number;
  defaultNotes?: string;
  maxDate?: string;
  disabled: boolean;
}) {
  const dateId = `loggedOn-${idPrefix}`;
  const symptomId = `symptom-${idPrefix}`;
  const notesId = `notes-${idPrefix}`;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={dateId}>Date</Label>
          <Input
            id={dateId}
            name="loggedOn"
            type="date"
            required
            defaultValue={defaultLoggedOn}
            max={maxDate}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={symptomId}>Symptom</Label>
          <select
            id={symptomId}
            name="symptom"
            required
            defaultValue={defaultSymptom ?? ""}
            disabled={disabled}
            className={fieldClassName}
          >
            <option value="" disabled>
              Choose one
            </option>
            {SYMPTOM_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium leading-none text-plum">
          How noticeable
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {SYMPTOM_SEVERITIES.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-lg border border-border/70 bg-card px-2 py-2 text-center text-xs text-plum transition-colors",
                "has-[:checked]:border-plum/30 has-[:checked]:bg-rose-soft/40",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <input
                type="radio"
                name="severity"
                value={option.value}
                defaultChecked={defaultSeverity === option.value}
                required
                disabled={disabled}
                className="sr-only"
              />
              {option.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor={notesId}>Note (optional)</Label>
        <Textarea
          id={notesId}
          name="notes"
          defaultValue={defaultNotes}
          maxLength={SYMPTOM_NOTE_MAX_LENGTH}
          disabled={disabled}
          placeholder="Only if you want extra context. You can leave this blank."
          className="min-h-[88px]"
        />
      </div>
    </>
  );
}

function StatusMessage({
  state,
  className,
}: {
  state: SymptomActionState;
  className?: string;
}) {
  if (!state.message) return null;

  return (
    <p
      className={cn(
        "text-sm",
        state.status === "error" ? "text-destructive" : "text-muted-foreground",
        className,
      )}
      role="status"
    >
      {state.message}
    </p>
  );
}
