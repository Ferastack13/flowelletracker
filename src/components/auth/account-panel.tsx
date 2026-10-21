import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export async function AccountPanel() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : null;

  if (!email) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/40 px-3.5 py-3.5">
        <p className="font-serif text-sm text-plum">Sign in when you are ready</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
          Accounts work. Cycle logs, habits, and notes are still not saved.
        </p>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "soft", size: "sm" }),
            "mt-3 w-full",
          )}
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-muted/40 px-3.5 py-3.5">
      <p className="font-serif text-sm text-plum">Signed in</p>
      <p className="mt-1.5 truncate text-[11px] text-muted-foreground" title={email}>
        {email}
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
        Tracking is not connected yet. Nothing you log here is stored.
      </p>
      <form action={signOut} className="mt-3">
        <Button type="submit" variant="outline" size="sm" className="w-full">
          Sign out
        </Button>
      </form>
    </div>
  );
}
