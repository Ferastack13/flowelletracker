"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { noteForDate, type DailyNote } from "@/lib/daily-note";
import { formatLocalDate } from "@/lib/self-care";
import { cn } from "@/lib/utils";

export function DailyNoteCard() {
  const [note, setNote] = useState<DailyNote | null>(null);

  useEffect(() => {
    setNote(noteForDate(formatLocalDate(new Date())));
  }, []);

  return (
    <Card className="animate-fade-up-delay-2 flex h-full min-h-0 flex-col border-rose/25">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-soft/50 text-plum"
            aria-hidden="true"
          >
            <Sparkles className="size-3.5" />
          </span>
          <CardTitle className="text-xl md:text-xl">
            {note?.title ?? "Her Daily Note"}
          </CardTitle>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {note ? <Badge variant="rose">{note.theme}</Badge> : null}
          <Badge variant="outline">General for today</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <blockquote className="border-l-2 border-rose/50 pl-4 font-serif text-lg leading-relaxed text-plum sm:text-xl">
          {note?.message ?? "Today’s note will appear here."}
        </blockquote>
        <p className="mt-4 text-xs text-muted-foreground">
          This note is the same for everyone on this date. It is not medical
          advice, and it is not written from your cycle.
        </p>
      </CardContent>
      <CardFooter className="mt-auto flex-wrap gap-2 border-t border-border/60 pt-4">
        <Link
          href="/learn"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <BookOpen className="size-3.5" aria-hidden="true" />
          Related reading
        </Link>
        <span className="text-xs text-muted-foreground">
          Saving your own notes is not available yet
        </span>
      </CardFooter>
    </Card>
  );
}
