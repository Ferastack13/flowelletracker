import { isLearnArticleSlug } from "@/lib/learn/catalog";
import { getSignedInUserId } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export async function listSavedArticleSlugs(): Promise<string[]> {
  const userId = await getSignedInUserId();
  if (!userId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learn_bookmarks")
    .select("article_slug")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data
    .map((row) => String(row.article_slug ?? ""))
    .filter((slug) => isLearnArticleSlug(slug));
}

export async function isArticleSaved(slug: string): Promise<boolean> {
  const userId = await getSignedInUserId();
  if (!userId || !isLearnArticleSlug(slug)) return false;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learn_bookmarks")
    .select("article_slug")
    .eq("user_id", userId)
    .eq("article_slug", slug)
    .maybeSingle();

  return !error && Boolean(data);
}
