import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LEARN_CATEGORIES } from "./categories.ts";
import {
  filterLearnArticles,
  getFeaturedArticle,
  getLearnArticle,
  isLearnArticleSlug,
  selectSavedArticles,
  learnSearchHref,
  listLearnArticles,
  parseLearnLibraryQuery,
} from "./catalog.ts";

describe("learn catalog", () => {
  it("covers every planned category with reviewed sources", () => {
    const articles = listLearnArticles();
    const categories = new Set(articles.map((article) => article.category));

    for (const category of LEARN_CATEGORIES) {
      assert.equal(categories.has(category.id), true, category.id);
    }

    assert.equal(articles.length >= 6, true);
    for (const article of articles) {
      assert.equal(article.body.length > 0, true);
      assert.equal(article.sources.length > 0, true);
      assert.match(article.reviewedOn, /^\d{4}-\d{2}-\d{2}$/);
      for (const source of article.sources) {
        assert.match(source.url, /^https:\/\//);
      }
    }
  });

  it("routes a known slug and rejects an unknown one", () => {
    const featured = getFeaturedArticle();
    assert.equal(featured.featured, true);
    assert.equal(getLearnArticle(featured.slug)?.slug, featured.slug);
    assert.equal(getLearnArticle("not-a-real-guide"), null);
    assert.equal(isLearnArticleSlug(featured.slug), true);
    assert.equal(isLearnArticleSlug("../cycle"), false);
    assert.equal(isLearnArticleSlug("missing-guide"), false);
  });

  it("keeps only the signed-in user's saved slugs", () => {
    const featured = getFeaturedArticle();
    const saved = selectSavedArticles(listLearnArticles(), [
      featured.slug,
      "someone-elses-invented-guide",
    ]);
    assert.deepEqual(
      saved.map((article) => article.slug),
      [featured.slug],
    );
  });

  it("filters by category and search text", () => {
    const medical = filterLearnArticles(listLearnArticles(), {
      category: "medical",
    });
    assert.equal(medical.every((article) => article.category === "medical"), true);
    assert.equal(medical.length > 0, true);

    const cramps = filterLearnArticles(listLearnArticles(), { q: "cramps" });
    assert.equal(
      cramps.some((article) => article.slug === "period-cramps-and-comfort"),
      true,
    );

    const empty = filterLearnArticles(listLearnArticles(), {
      q: "ovulation confirmation kit",
    });
    assert.equal(empty.length, 0);
  });

  it("parses listing query params without inventing a category", () => {
    const parsed = parseLearnLibraryQuery({
      q: "  mood  ",
      category: "mood",
      saved: "1",
    });
    assert.deepEqual(parsed, { q: "mood", category: "mood", saved: true });

    const ignored = parseLearnLibraryQuery({
      category: "fertile-window",
      saved: "no",
    });
    assert.equal(ignored.category, undefined);
    assert.equal(ignored.saved, false);
    assert.equal(
      learnSearchHref({ category: "cycle", saved: true }),
      "/learn?category=cycle&saved=1",
    );
  });
});
