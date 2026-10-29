import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ArticleBody, ArticleSources } from "@/components/learn/article-body";
import { ArticleBookmark } from "@/components/learn/article-bookmark";
import { ArticleCard } from "@/components/learn/article-card";
import { LearnIllustration } from "@/components/learn/learn-illustration";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { learnCategoryLabel } from "@/lib/learn/categories";
import {
  getLearnArticle,
  listLearnArticles,
} from "@/lib/learn/catalog";
import { learnSearchHref } from "@/lib/learn/catalog";
import { getSignedInUserId } from "@/lib/supabase/auth";
import { isArticleSaved } from "@/lib/supabase/learn-bookmarks";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return listLearnArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getLearnArticle(slug);
  if (!article) {
    return { title: "Guide not found" };
  }
  return {
    title: article.title,
    description: article.summary,
  };
}

export default async function LearnArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getLearnArticle(slug);
  if (!article) notFound();

  const related = listLearnArticles()
    .filter(
      (item) => item.category === article.category && item.slug !== article.slug,
    )
    .slice(0, 2);

  return (
    <AppShellWithAuth
      title={article.title}
      description={article.summary}
    >
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="overflow-hidden rounded-xl border border-border/80 bg-ivory-warm shadow-soft">
          <div className="h-48 sm:h-56">
            <LearnIllustration title="Decorative botanical panel" />
          </div>
        </div>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="rose">{learnCategoryLabel(article.category)}</Badge>
            <Badge variant="outline">{article.minutes} min read</Badge>
            <Badge variant="soft">Reviewed {article.reviewedOn}</Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            General education. Not personalised medical advice, not a diagnosis,
            and not a way to confirm ovulation or prevent pregnancy.
          </p>
          <Suspense fallback={<LoadingState label="Checking saved state…" />}>
            <ArticleBookmarkSlot slug={article.slug} />
          </Suspense>
        </header>

        <ArticleBody blocks={article.body} />
        <ArticleSources sources={article.sources} reviewedOn={article.reviewedOn} />

        <p>
          <Link
            href={learnSearchHref({ category: article.category })}
            className="text-sm font-medium text-plum underline-offset-4 hover:underline"
          >
            More in {learnCategoryLabel(article.category)}
          </Link>
        </p>
      </article>

      {related.length > 0 ? (
        <section className="mx-auto mt-10 w-full max-w-3xl space-y-4">
          <h2 className="font-serif text-2xl tracking-tight text-plum">
            Continue reading
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {related.map((item) => (
              <ArticleCard key={item.slug} article={item} />
            ))}
          </div>
        </section>
      ) : null}
    </AppShellWithAuth>
  );
}

async function ArticleBookmarkSlot({ slug }: { slug: string }) {
  const userId = await getSignedInUserId();
  const saved = userId ? await isArticleSaved(slug) : false;
  return (
    <ArticleBookmark slug={slug} signedIn={Boolean(userId)} saved={saved} />
  );
}
