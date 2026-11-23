"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Droplets,
  Heart,
  Leaf,
  Moon,
  PersonStanding,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  toggleWellnessActivity,
  type SelfCareActionState,
} from "@/app/self-care/actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CyclePhaseResolution } from "@/lib/cycle-phase";
import type {
  PersonalizedRecommendation,
  WellnessCategory,
} from "@/lib/wellness/recommendations";
import { cn } from "@/lib/utils";

const initialState: SelfCareActionState = { status: "idle", message: "" };

const categoryIcons: Record<WellnessCategory, LucideIcon> = {
  hydration: Droplets,
  movement: PersonStanding,
  rest: Moon,
  nutrition: Leaf,
  comfort: Heart,
  awareness: Sparkles,
};

interface DailyWellnessPanelProps {
  signedIn: boolean;
  today: string;
  phase: CyclePhaseResolution;
  recommendations: PersonalizedRecommendation[];
  progress: { total: number; completed: number; percent: number };
  compact?: boolean;
}

export function DailyWellnessPanel({
  signedIn,
  today,
  phase,
  recommendations,
  progress,
  compact = false,
}: DailyWellnessPanelProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    toggleWellnessActivity,
    initialState,
  );

  useEffect(() => {
    if (state.status !== "success") return;
    const timer = window.setTimeout(() => {
      router.refresh();
    }, 400);
    return () => window.clearTimeout(timer);
  }, [state, router]);

  const list = compact ? recommendations.slice(0, 4) : recommendations;

  return (
    <Card className="animate-fade-up-delay-2 min-h-0">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl md:text-xl">
            Today’s wellness
          </CardTitle>
          <Badge variant={progress.completed > 0 ? "sage" : "outline"}>
            {signedIn
              ? progress.total === 0
                ? "No tips yet"
                : `${progress.completed} of ${progress.total}`
              : "Sign in to save"}
          </Badge>
        </div>
        <CardDescription>
          {phase.label}. {phase.detail}
        </CardDescription>
        {signedIn && progress.total > 0 ? (
          <div className="pt-2">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={progress.completed}
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-label="Daily wellness progress"
            >
              <div
                className="h-full rounded-full bg-sage/80 transition-[width] duration-700 motion-reduce:transition-none"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {progress.percent}% of today’s suggestions marked done
            </p>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {!signedIn ? (
          <p className="text-sm text-muted-foreground">
            Sign in to receive personalized suggestions from your cycle phase and
            recorded symptoms.
          </p>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add period dates or a symptom log to personalise today’s care ideas.
          </p>
        ) : (
          <ul className="grid gap-3" aria-label="Personalized wellness recommendations">
            {list.map((item) => {
              const Icon = categoryIcons[item.category];
              return (
                <li
                  key={item.id}
                  className={cn(
                    "rounded-xl border border-border/70 bg-muted/25 p-4",
                    item.completed && "border-sage/40 bg-sage-soft/20",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-soft/60 text-plum"
                      aria-hidden="true"
                    >
                      {item.completed ? (
                        <Check className="size-4" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-plum">{item.title}</p>
                        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                          {item.category}
                        </span>
                        {item.source === "symptom" ? (
                          <Badge variant="outline">From your symptoms</Badge>
                        ) : null}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.explanation}
                      </p>
                      <p className="text-sm text-plum/90">
                        <span className="font-medium">Try: </span>
                        {item.action}
                      </p>
                      {today ? (
                        <form action={action}>
                          <input type="hidden" name="localDate" value={today} />
                          <input
                            type="hidden"
                            name="recommendationId"
                            value={item.id}
                          />
                          <input
                            type="hidden"
                            name="completed"
                            value={item.completed ? "" : "on"}
                          />
                          <Button
                            type="submit"
                            size="sm"
                            variant={item.completed ? "outline" : "sage"}
                            disabled={pending}
                          >
                            {pending
                              ? "Saving…"
                              : item.completed
                                ? "Undo"
                                : "Mark done"}
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {state.status === "error" && state.message ? (
          <p className="text-sm text-destructive" role="status">
            {state.message}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          General wellness suggestions only — not a diagnosis or medical plan.
        </p>
      </CardContent>
      {compact ? (
        <CardFooter>
          <Link
            href="/self-care"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Open full self-care
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  );
}
