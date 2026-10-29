import { LEARN_ARTICLES } from "../../content/learn/articles.ts";
import { isLearnCategoryId } from "./categories.ts";
import type {
  LearnArticle,
  LearnCategoryId,
  LearnLibraryQuery,
} from "./types.ts";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isLearnArticleSlug(value: string): boolean {
  return (
    SLUG_PATTERN.test(value) &&
    value.length >= 3 &&
    value.length <= 80 &&
    LEARN_ARTICLES.some((article) => article.slug === value)
  );
}

export function listLearnArticles(): readonly LearnArticle[] {
  return LEARN_ARTICLES;
}

export function getLearnArticle(slug: string): LearnArticle | null {
  return LEARN_ARTICLES.find((article) => article.slug === slug) ?? null;
}

export function getFeaturedArticle(): LearnArticle {
  const featured =
    LEARN_ARTICLES.find((article) => article.featured) ?? LEARN_ARTICLES[0];
  if (!featured) {
    throw new Error("Learn catalog is empty.");
  }
  return featured;
}

export function selectSavedArticles(
  articles: readonly LearnArticle[],
  savedSlugs: readonly string[],
): LearnArticle[] {
  const allowed = new Set(savedSlugs.filter((slug) => isLearnArticleSlug(slug)));
  return articles.filter((article) => allowed.has(article.slug));
}

function normalizeQuery(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function articleHaystack(article: LearnArticle): string {
  return [
    article.title,
    article.summary,
    article.tags.join(" "),
    article.slug.replaceAll("-", " "),
  ]
    .join(" ")
    .toLowerCase();
}

export function filterLearnArticles(
  articles: readonly LearnArticle[],
  query: LearnLibraryQuery,
): LearnArticle[] {
  const search = query.q ? normalizeQuery(query.q) : "";
  const category =
    query.category && isLearnCategoryId(query.category)
      ? (query.category as LearnCategoryId)
      : null;

  return articles.filter((article) => {
    if (category && article.category !== category) return false;
    if (search && !articleHaystack(article).includes(search)) return false;
    return true;
  });
}

export function parseLearnLibraryQuery(input: {
  q?: string | string[];
  category?: string | string[];
  saved?: string | string[];
}): LearnLibraryQuery {
  const q = Array.isArray(input.q) ? input.q[0] : input.q;
  const category = Array.isArray(input.category)
    ? input.category[0]
    : input.category;
  const saved = Array.isArray(input.saved) ? input.saved[0] : input.saved;

  return {
    q: q?.trim() ? q.trim() : undefined,
    category:
      category && isLearnCategoryId(category) ? category : undefined,
    saved: saved === "1" || saved === "true",
  };
}

export function learnSearchHref(query: LearnLibraryQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.saved) params.set("saved", "1");
  const encoded = params.toString();
  return encoded ? `/learn?${encoded}` : "/learn";
}
