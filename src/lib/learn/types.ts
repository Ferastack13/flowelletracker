export const LEARN_CATEGORY_IDS = [
  "cycle",
  "symptoms",
  "mood",
  "self-care",
  "skincare",
  "medical",
] as const;

export type LearnCategoryId = (typeof LEARN_CATEGORY_IDS)[number];

export interface LearnCategory {
  id: LearnCategoryId;
  label: string;
  description: string;
}

export type LearnBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | {
      type: "callout";
      tone: "care" | "caution";
      title: string;
      text: string;
    };

export interface LearnSource {
  title: string;
  publisher: string;
  url: string;
}

export interface LearnArticle {
  slug: string;
  category: LearnCategoryId;
  title: string;
  summary: string;
  featured: boolean;
  reviewedOn: string;
  minutes: number;
  tags: string[];
  sources: LearnSource[];
  body: LearnBlock[];
}

export interface LearnLibraryQuery {
  q?: string;
  category?: string;
  saved?: boolean;
}
