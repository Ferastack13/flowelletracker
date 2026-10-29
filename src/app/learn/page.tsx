import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArticleCard } from "@/components/learn/article-card";
import { LearnFilters } from "@/components/learn/learn-filters";
import { LearnIllustration } from "@/components/learn/learn-illustration";
import { LearnSearch } from "@/components/learn/learn-search";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { learnCategoryLabel } from "@/lib/learn/categories";
import {
  filterLearnArticles,
  getFeaturedArticle,
  listLearnArticles,
  parseLearnLibraryQuery,
  selectSavedArticles,
} from "@/lib/learn/catalog";
import { getSignedInUserId } from "@/lib/supabase/auth";
import { listSavedArticleSlugs } from "@/lib/supabase/learn-bookmarks";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Calm, evidence-aware guides on menstrual cycles, symptoms, self-care, and when to seek medical advice.",
};

export default function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    saved?: string | string[];
  }>;
}) {
  return (
    <AppShellWithAuth
      title="Learn"
      description="A small library on cycle literacy, everyday care, and the limits of an app. General education, not a diagnosis."
    >
      <Suspense fallback={<LoadingState label="Loading the library…" />}>
        <LearnLibrary searchParams={searchParams} />
      </Suspense>
    </AppShellWithAuth>
  );
}

async function LearnLibrary({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    saved?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = parseLearnLibraryQuery(params);
  const userId = await getSignedInUserId();
  const savedSlugs = userId ? await listSavedArticleSlugs() : [];
  const featured = getFeaturedArticle();
  const catalog = query.saved
    ? selectSavedArticles(listLearnArticles(), savedSlugs)
    : listLearnArticles();
  const articles = filterLearnArticles(catalog, {
    q: query.q,
    category: query.saved ? undefined : query.category,
  });
  const showFeatured =
    !query.q && !query.category && !query.saved && articles.some((article) => article.featured);
  const cards = showFeatured
    ? articles.filter((article) => article.slug !== featured.slug)
    : articles;
  const savedSet = new Set(savedSlugs);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="rounded-xl border border-border/80 bg-card px-5 py-6 shadow-soft sm:px-7 sm:py-7">
        <p className="text-[11px] font-medium tracking-[0.14em] text-rose-muted uppercase">
          Editorial library
        </p>
        <h2 className="mt-2 max-w-2xl font-serif text-3xl tracking-tight text-plum md:text-4xl">
          Understand your cycle without handing it to a forecast.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          These guides are written for a worldwide audience in plain language.
          They cite public health pages, keep review dates, and will not tell
          you that Flowelle can confirm ovulation or prevent pregnancy.
        </p>
        <div className="mt-6">
          <LearnSearch query={query} />
        </div>
      </section>

      <LearnFilters
        query={query}
        savedCount={savedSlugs.length}
        signedIn={Boolean(userId)}
      />

      {showFeatured ? (
        <article className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-soft lg:grid lg:grid-cols-[1.15fr_1fr]">
          <div className="min-h-[14rem] bg-ivory-warm">
            <LearnIllustration title={featured.title} />
          </div>
          <div className="flex flex-col justify-center gap-4 px-5 py-6 sm:px-7">
            <div className="flex flex-wrap gap-2">
              <Badge variant="rose">{learnCategoryLabel(featured.category)}</Badge>
              <Badge variant="outline">Featured</Badge>
            </div>
            <div>
              <h2 className="font-serif text-3xl tracking-tight text-plum">
                {featured.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {featured.summary}
              </p>
            </div>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {featured.minutes} min read
            </p>
            <Link
              href={`/learn/${featured.slug}`}
              className="text-sm font-medium text-plum underline-offset-4 hover:underline"
            >
              Read the guide
            </Link>
          </div>
        </article>
      ) : null}

      {articles.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-5" aria-hidden="true" />}
          title={
            query.saved
              ? userId
                ? "No saved guides yet"
                : "Sign in to keep a saved list"
              : "No guides match that search"
          }
          description={
            query.saved
              ? "Open a guide and use Save. The list stays with your account, not this browser."
              : "Try another word, or choose All guides to see the full library."
          }
          action={
            query.saved && !userId ? (
              <Link href="/login" className="text-sm font-medium text-plum underline">
                Sign in
              </Link>
            ) : (
              <Link href="/learn" className="text-sm font-medium text-plum underline">
                View all guides
              </Link>
            )
          }
        />
      ) : (
        <section aria-label="Guides">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((article) => (
              <ArticleCard
                key={article.slug}
                article={article}
                saved={savedSet.has(article.slug)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
