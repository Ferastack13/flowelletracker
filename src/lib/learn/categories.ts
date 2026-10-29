import {
  LEARN_CATEGORY_IDS,
  type LearnCategory,
  type LearnCategoryId,
} from "./types.ts";

export const LEARN_CATEGORIES: readonly LearnCategory[] = [
  {
    id: "cycle",
    label: "Understanding Your Cycle",
    description: "What a menstrual cycle is, and how it can vary.",
  },
  {
    id: "symptoms",
    label: "Periods and Symptoms",
    description: "Cramps, bleeding, and records you keep for yourself.",
  },
  {
    id: "mood",
    label: "Mood and Emotional Wellbeing",
    description: "Feelings around a period, without treating mood as a diagnosis.",
  },
  {
    id: "self-care",
    label: "Self-care and Daily Habits",
    description: "Everyday care that does not depend on a predicted phase.",
  },
  {
    id: "skincare",
    label: "Skincare and Body Care",
    description: "Gentle skin and body care during menstruation.",
  },
  {
    id: "medical",
    label: "When to Seek Medical Advice",
    description: "Signs that deserve a clinician, not an app.",
  },
] as const;

export function isLearnCategoryId(value: string): value is LearnCategoryId {
  return LEARN_CATEGORY_IDS.includes(value as LearnCategoryId);
}

export function learnCategoryLabel(id: LearnCategoryId): string {
  return LEARN_CATEGORIES.find((category) => category.id === id)?.label ?? id;
}
