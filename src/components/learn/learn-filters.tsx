import Link from "next/link";
import { LEARN_CATEGORIES } from "@/lib/learn/categories";
import { learnSearchHref } from "@/lib/learn/catalog";
import type { LearnLibraryQuery } from "@/lib/learn/types";
import { cn } from "@/lib/utils";

interface LearnFiltersProps {
  query: LearnLibraryQuery;
  savedCount: number;
  signedIn: boolean;
}

export function LearnFilters({
  query,
  savedCount,
  signedIn,
}: LearnFiltersProps) {
  const items = [
    { href: learnSearchHref({ q: query.q }), label: "All guides", active: !query.category && !query.saved },
    ...LEARN_CATEGORIES.map((category) => ({
      href: learnSearchHref({ q: query.q, category: category.id }),
      label: category.label,
      active: query.category === category.id && !query.saved,
    })),
    {
      href: signedIn
        ? learnSearchHref({ q: query.q, saved: true })
        : "/login",
      label: signedIn ? `Saved (${savedCount})` : "Saved",
      active: Boolean(query.saved),
    },
  ];

  return (
    <nav aria-label="Learn topics" className="overflow-x-auto">
      <ul className="flex min-w-max gap-2 pb-1">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "inline-flex rounded-full border px-3.5 py-2 text-sm transition-colors",
                item.active
                  ? "border-plum/20 bg-plum text-ivory"
                  : "border-border bg-card text-muted-foreground hover:border-plum/20 hover:text-plum",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
