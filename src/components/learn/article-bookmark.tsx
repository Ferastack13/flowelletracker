"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import {
  toggleLearnBookmark,
  type BookmarkActionState,
} from "@/app/learn/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initialState: BookmarkActionState = { status: "idle", message: "" };

interface ArticleBookmarkProps {
  slug: string;
  signedIn: boolean;
  saved: boolean;
}

export function ArticleBookmark({
  slug,
  signedIn,
  saved,
}: ArticleBookmarkProps) {
  const [state, action, pending] = useActionState(
    toggleLearnBookmark,
    initialState,
  );
  const isSaved = state.saved ?? saved;

  if (!signedIn) {
    return (
      <div className="space-y-2">
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Bookmark className="size-4" aria-hidden="true" />
          Sign in to save
        </Link>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Guides stay readable without an account. Saving a list is stored with
          your sign-in, not on this device.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="slug" value={slug} />
      <Button
        type="submit"
        variant={isSaved ? "soft" : "outline"}
        size="sm"
        disabled={pending}
        aria-pressed={isSaved}
      >
        <Bookmark className="size-4" aria-hidden="true" />
        {pending ? "Saving…" : isSaved ? "Saved" : "Save guide"}
      </Button>
      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "text-xs text-destructive"
              : "text-xs text-muted-foreground"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
