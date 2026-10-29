"use server";

import { revalidatePath } from "next/cache";
import { isLearnArticleSlug } from "@/lib/learn/catalog";
import { getSignedInUserId } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export type BookmarkActionState = {
  status: "idle" | "error" | "success";
  message: string;
  saved?: boolean;
};

function revalidateLearn(slug: string) {
  revalidatePath("/learn");
  revalidatePath(`/learn/${slug}`);
}

export async function toggleLearnBookmark(
  _previous: BookmarkActionState,
  formData: FormData,
): Promise<BookmarkActionState> {
  const userId = await getSignedInUserId();
  if (!userId) {
    return { status: "error", message: "Sign in to save a guide." };
  }

  const slug = String(formData.get("slug") ?? "");
  if (!isLearnArticleSlug(slug)) {
    return { status: "error", message: "That guide could not be saved." };
  }

  const supabase = await createClient();
  const existing = await supabase
    .from("learn_bookmarks")
    .select("article_slug")
    .eq("user_id", userId)
    .eq("article_slug", slug)
    .maybeSingle();

  if (existing.error) {
    return { status: "error", message: "Your saved list could not be updated." };
  }

  if (existing.data) {
    const { data, error } = await supabase
      .from("learn_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("article_slug", slug)
      .select("article_slug");

    if (error || !data?.length) {
      return {
        status: "error",
        message: "That guide could not be removed from saved.",
      };
    }

    revalidateLearn(slug);
    return {
      status: "success",
      message: "Removed from saved guides.",
      saved: false,
    };
  }

  const { error } = await supabase.from("learn_bookmarks").insert({
    user_id: userId,
    article_slug: slug,
  });

  if (error) {
    return { status: "error", message: "That guide could not be saved." };
  }

  revalidateLearn(slug);
  return { status: "success", message: "Saved to your library.", saved: true };
}
