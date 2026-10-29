import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LearnLibraryQuery } from "@/lib/learn/types";

export function LearnSearch({ query }: { query: LearnLibraryQuery }) {
  return (
    <form
      action="/learn"
      method="get"
      role="search"
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      {query.category ? (
        <input type="hidden" name="category" value={query.category} />
      ) : null}
      {query.saved ? <input type="hidden" name="saved" value="1" /> : null}
      <div className="min-w-0 flex-1 space-y-2">
        <Label htmlFor="learn-search">Search guides</Label>
        <Input
          id="learn-search"
          name="q"
          type="search"
          defaultValue={query.q ?? ""}
          placeholder="Try cramps, mood, or heavy bleeding"
          autoComplete="off"
        />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}
