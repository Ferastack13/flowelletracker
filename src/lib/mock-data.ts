/**
 * Preview-only sample data for UI development.
 * These values are NOT real user records and must not be treated as saved state.
 * Replace with Supabase-backed data once authentication and persistence exist.
 */

export const MOCK_DATA_NOTICE =
  "Preview sample — not saved to your account.";

export const TRACKING_NOT_CONNECTED =
  "Tracking is not connected yet — values shown are layout previews only.";

export type MockCyclePhase =
  | "menstrual"
  | "follicular"
  | "ovulatory"
  | "luteal";

export interface MockCycleOverview {
  hasCycleData: boolean;
  currentDay: number | null;
  cycleLength: number | null;
  phase: MockCyclePhase | null;
  phaseLabel: string | null;
  lastPeriodStart: string | null;
}

/** Empty state: no cycle data entered yet. */
export const mockEmptyCycle: MockCycleOverview = {
  hasCycleData: false,
  currentDay: null,
  cycleLength: null,
  phase: null,
  phaseLabel: null,
  lastPeriodStart: null,
};

/** Visual preview only — used on marketing product mockups. */
export const mockPreviewCycle: MockCycleOverview = {
  hasCycleData: true,
  currentDay: 12,
  cycleLength: 28,
  phase: "follicular",
  phaseLabel: "Follicular phase",
  lastPeriodStart: "2026-09-30",
};

export interface MockDailyNote {
  title: string;
  theme: string;
  message: string;
  isPersonalised: boolean;
}

/** Generic daily note until personalisation is implemented. */
export const mockDailyNote: MockDailyNote = {
  title: "Her Daily Note",
  theme: "Gentle energy",
  message:
    "Gentle energy often rises mid-cycle. A short walk, warm food, and a quiet moment with your journal can help you stay in rhythm with yourself today.",
  isPersonalised: false,
};

export type SelfCarePillarId =
  | "hydration"
  | "movement"
  | "sleep"
  | "personal-care";

export interface MockSelfCarePillar {
  id: SelfCarePillarId;
  name: string;
  detail: string;
  /** Preview status label only — not live tracking. */
  statusLabel: string;
  /** 0–100 preview fill for visual rhythm; not a real measurement. */
  previewLevel: number;
}

/**
 * Self-care overview pillars for the dashboard.
 * Levels are illustrative previews; tracking is not connected.
 */
export const mockSelfCarePillars: MockSelfCarePillar[] = [
  {
    id: "hydration",
    name: "Hydration",
    detail: "Warm drinks & water",
    statusLabel: "Not tracked",
    previewLevel: 45,
  },
  {
    id: "movement",
    name: "Movement",
    detail: "Gentle body care",
    statusLabel: "Not tracked",
    previewLevel: 30,
  },
  {
    id: "sleep",
    name: "Sleep",
    detail: "Rest & recovery",
    statusLabel: "Not tracked",
    previewLevel: 60,
  },
  {
    id: "personal-care",
    name: "Personal care",
    detail: "Rituals & comfort",
    statusLabel: "Not tracked",
    previewLevel: 20,
  },
];

export interface MockHabit {
  id: string;
  name: string;
  completedToday: boolean;
  streakDays: number;
}

/** Preview habits retained for future self-care detail views. */
export const mockHabits: MockHabit[] = [
  {
    id: "hydrate",
    name: "Drink water with intention",
    completedToday: true,
    streakDays: 4,
  },
  {
    id: "rest",
    name: "10 minutes of rest",
    completedToday: false,
    streakDays: 2,
  },
  {
    id: "move",
    name: "Gentle movement",
    completedToday: true,
    streakDays: 6,
  },
];

export function getHabitProgress(habits: MockHabit[]) {
  const completed = habits.filter((h) => h.completedToday).length;
  const total = habits.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}
