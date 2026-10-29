import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { learnCategoryLabel } from "@/lib/learn/categories";
import type { LearnArticle } from "@/lib/learn/types";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: LearnArticle;
  saved?: boolean;
  className?: string;
}

export function ArticleCard({ article, saved, className }: ArticleCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border border-border/80 bg-card p-5 shadow-soft",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="rose">{learnCategoryLabel(article.category)}</Badge>
        {saved ? <Badge variant="sage">Saved</Badge> : null}
      </div>
      <h3 className="mt-3 font-serif text-xl tracking-tight text-plum">
        <Link
          href={`/learn/${article.slug}`}
          className="rounded-sm hover:underline"
        >
          {article.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {article.summary}
      </p>
      <p className="mt-4 text-xs tracking-wide text-muted-foreground uppercase">
        {article.minutes} min read
      </p>
    </article>
  );
}
