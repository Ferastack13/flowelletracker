import type { CyclePhase } from "../cycle-phase.ts";
import type { SymptomId } from "../symptoms.ts";

export const WELLNESS_CATEGORIES = [
  "hydration",
  "movement",
  "rest",
  "nutrition",
  "comfort",
  "awareness",
] as const;

export type WellnessCategory = (typeof WELLNESS_CATEGORIES)[number];

export interface WellnessRecommendationDef {
  id: string;
  title: string;
  explanation: string;
  action: string;
  category: WellnessCategory;
  phases: ReadonlyArray<CyclePhase | "any">;
  symptoms?: ReadonlyArray<SymptomId>;
  priority: number;
}

export interface PersonalizedRecommendation extends WellnessRecommendationDef {
  source: "phase" | "symptom" | "general";
  completed: boolean;
}

/** Static catalog — deterministic, no AI. Not medical advice. */
export const WELLNESS_CATALOG: readonly WellnessRecommendationDef[] = [
  {
    id: "menstrual-hydrate",
    title: "Stay hydrated",
    explanation:
      "During your period, steady fluids can support comfort. Needs differ for everyone.",
    action: "Sip water or a warm drink through the day.",
    category: "hydration",
    phases: ["menstrual"],
    priority: 10,
  },
  {
    id: "menstrual-stretch",
    title: "Gentle stretching",
    explanation:
      "Light movement may ease tension for some people. Stop if anything feels wrong.",
    action: "Try a few minutes of soft stretches when you feel ready.",
    category: "movement",
    phases: ["menstrual"],
    priority: 20,
  },
  {
    id: "menstrual-rest",
    title: "Protect your rest",
    explanation:
      "Energy often dips during bleeding days. Rest is a valid form of care.",
    action: "Plan one quieter block for recovery today.",
    category: "rest",
    phases: ["menstrual"],
    priority: 15,
  },
  {
    id: "menstrual-warmth",
    title: "Warm comfort",
    explanation:
      "A warm compress is a common comfort choice for period cramps. It is not a treatment plan.",
    action: "Use a warm compress on your lower abdomen if that feels soothing.",
    category: "comfort",
    phases: ["menstrual"],
    priority: 25,
  },
  {
    id: "menstrual-meals",
    title: "Balanced meals",
    explanation:
      "Regular meals can support steadier energy. There is no single “correct” period diet.",
    action: "Aim for one balanced meal with protein, fibre, and something you enjoy.",
    category: "nutrition",
    phases: ["menstrual"],
    priority: 30,
  },
  {
    id: "follicular-move",
    title: "Keep gentle activity",
    explanation:
      "Many people feel more able to move after bleeding eases. Follow your own energy.",
    action: "Choose a walk, stretch, or workout that feels sustainable today.",
    category: "movement",
    phases: ["follicular"],
    priority: 10,
  },
  {
    id: "follicular-try",
    title: "Try something light and new",
    explanation:
      "This phase can feel open for small experiments. Keep expectations kind.",
    action: "Pick one small activity you have been curious about.",
    category: "awareness",
    phases: ["follicular"],
    priority: 25,
  },
  {
    id: "follicular-meals",
    title: "Steady nutrition",
    explanation:
      "Balanced meals support everyday energy. Preferences and access vary.",
    action: "Include a colourful plate or snack you can actually prepare.",
    category: "nutrition",
    phases: ["follicular"],
    priority: 20,
  },
  {
    id: "follicular-sleep",
    title: "Keep a sleep rhythm",
    explanation:
      "Consistent sleep habits help many people feel clearer across the cycle.",
    action: "Choose a realistic bedtime window for tonight.",
    category: "rest",
    phases: ["follicular"],
    priority: 15,
  },
  {
    id: "ovulation-hydrate",
    title: "Keep fluids nearby",
    explanation:
      "Hydration supports everyday comfort around estimated ovulation days.",
    action: "Refill a bottle and drink steadily through the afternoon.",
    category: "hydration",
    phases: ["ovulation"],
    priority: 10,
  },
  {
    id: "ovulation-move",
    title: "Move if it feels good",
    explanation:
      "Continue your usual routine only if your body agrees. Skip pressure.",
    action: "Do your regular movement — or rest — based on how you feel.",
    category: "movement",
    phases: ["ovulation"],
    priority: 20,
  },
  {
    id: "ovulation-notice",
    title: "Notice body changes",
    explanation:
      "Some people notice shifts around ovulation; others do not. Observation is enough.",
    action: "Note one physical or mood detail without judging it.",
    category: "awareness",
    phases: ["ovulation"],
    priority: 15,
  },
  {
    id: "ovulation-nutrition",
    title: "Nourish consistently",
    explanation:
      "Healthy nutrition looks different for every person and household.",
    action: "Eat a meal that includes something filling and something fresh.",
    category: "nutrition",
    phases: ["ovulation"],
    priority: 25,
  },
  {
    id: "luteal-sleep",
    title: "Prioritise sleep",
    explanation:
      "The luteal phase can feel more demanding. Sleep is a practical support.",
    action: "Protect wind-down time before bed tonight.",
    category: "rest",
    phases: ["luteal"],
    priority: 10,
  },
  {
    id: "luteal-gentle-move",
    title: "Choose gentle movement",
    explanation:
      "Softer activity often matches lower energy days better than intensity.",
    action: "Take a short walk or stretch session at an easy pace.",
    category: "movement",
    phases: ["luteal"],
    priority: 20,
  },
  {
    id: "luteal-meals",
    title: "Keep meals balanced",
    explanation:
      "Regular food can help with energy swings some people notice later in the cycle.",
    action: "Plan one grounding meal or snack you will actually eat.",
    category: "nutrition",
    phases: ["luteal"],
    priority: 25,
  },
  {
    id: "luteal-relax",
    title: "Make space to unwind",
    explanation:
      "Relaxation techniques are optional tools, not requirements.",
    action: "Spend five quiet minutes breathing, journaling, or resting.",
    category: "comfort",
    phases: ["luteal"],
    priority: 15,
  },
  {
    id: "luteal-mood",
    title: "Check in with mood and energy",
    explanation:
      "Mood and energy can shift. Tracking helps you notice patterns over time.",
    action: "Write one line about how your energy feels today.",
    category: "awareness",
    phases: ["luteal"],
    priority: 30,
  },
  {
    id: "general-hydrate",
    title: "Drink enough water",
    explanation:
      "A simple daily anchor when cycle phase is still unclear.",
    action: "Have a glass of water in the next hour.",
    category: "hydration",
    phases: ["unknown", "any"],
    priority: 40,
  },
  {
    id: "general-rest",
    title: "Pause for yourself",
    explanation:
      "Self-care can be small. You do not need a perfect routine.",
    action: "Take a short break without checking your phone.",
    category: "rest",
    phases: ["unknown", "any"],
    priority: 45,
  },
  {
    id: "symptom-cramps-warmth",
    title: "Warmth for cramps",
    explanation:
      "You logged cramps. A warm compress is a common comfort option.",
    action: "Place a warm compress where it feels most helpful.",
    category: "comfort",
    phases: ["any"],
    symptoms: ["cramps"],
    priority: 5,
  },
  {
    id: "symptom-cramps-stretch",
    title: "Ease with gentle stretching",
    explanation:
      "Based on your recorded cramps. Keep movement soft and optional.",
    action: "Try a few pelvic or hip stretches if comfortable.",
    category: "movement",
    phases: ["any"],
    symptoms: ["cramps"],
    priority: 8,
  },
  {
    id: "symptom-cramps-rest-hydrate",
    title: "Rest and hydrate with cramps",
    explanation:
      "Rest and fluids can support comfort when cramps are present.",
    action: "Slow down for a short rest with water nearby.",
    category: "rest",
    phases: ["any"],
    symptoms: ["cramps"],
    priority: 9,
  },
  {
    id: "symptom-fatigue-sleep",
    title: "Honour fatigue with sleep",
    explanation:
      "You recorded fatigue. Sleep and softer expectations can help.",
    action: "Protect an earlier bedtime or a short rest window.",
    category: "rest",
    phases: ["any"],
    symptoms: ["fatigue"],
    priority: 5,
  },
  {
    id: "symptom-fatigue-meals",
    title: "Support energy with food",
    explanation:
      "Balanced meals may help when you feel worn down. Listen to appetite.",
    action: "Eat something nourishing even if it is simple.",
    category: "nutrition",
    phases: ["any"],
    symptoms: ["fatigue"],
    priority: 8,
  },
  {
    id: "symptom-fatigue-pace",
    title: "Match activity to energy",
    explanation:
      "Fatigue is a signal to adjust — not push through every plan.",
    action: "Scale today’s movement to what feels manageable.",
    category: "movement",
    phases: ["any"],
    symptoms: ["fatigue"],
    priority: 12,
  },
  {
    id: "symptom-bloating-water",
    title: "Hydrate with bloating in mind",
    explanation:
      "You logged bloating. Steady water intake is a gentle default.",
    action: "Drink water regularly rather than all at once.",
    category: "hydration",
    phases: ["any"],
    symptoms: ["bloating"],
    priority: 5,
  },
  {
    id: "symptom-bloating-move",
    title: "Gentle movement for bloating",
    explanation:
      "Light walking or stretching can feel easing for some people.",
    action: "Take a short, easy walk after a meal if you can.",
    category: "movement",
    phases: ["any"],
    symptoms: ["bloating"],
    priority: 8,
  },
  {
    id: "symptom-bloating-meals",
    title: "Keep eating balanced",
    explanation:
      "There is no universal bloating diet. Balanced, familiar foods are a calm start.",
    action: "Choose a meal that usually sits well for you.",
    category: "nutrition",
    phases: ["any"],
    symptoms: ["bloating"],
    priority: 12,
  },
  {
    id: "symptom-headache-rest",
    title: "Quiet space for a headache",
    explanation:
      "You recorded a headache. Soft light and rest may help.",
    action: "Step into a quieter space for a few minutes.",
    category: "rest",
    phases: ["any"],
    symptoms: ["headache"],
    priority: 5,
  },
  {
    id: "symptom-headache-hydrate",
    title: "Hydrate with a headache",
    explanation:
      "Fluids are a simple support alongside rest.",
    action: "Drink a glass of water slowly.",
    category: "hydration",
    phases: ["any"],
    symptoms: ["headache"],
    priority: 8,
  },
  {
    id: "symptom-mood-pause",
    title: "Make room for mood shifts",
    explanation:
      "You noted mood changes. A short pause can create breathing room.",
    action: "Take five minutes for a calm reset without fixing anything.",
    category: "awareness",
    phases: ["any"],
    symptoms: ["mood-changes"],
    priority: 5,
  },
  {
    id: "symptom-breast-comfort",
    title: "Ease breast tenderness",
    explanation:
      "Based on your recorded tenderness. Soft clothing and rest can help.",
    action: "Choose a supportive top and avoid unnecessary pressure.",
    category: "comfort",
    phases: ["any"],
    symptoms: ["breast-tenderness"],
    priority: 5,
  },
  {
    id: "symptom-acne-gentle",
    title: "Keep skin care gentle",
    explanation:
      "You logged acne. Gentle routines are usually kinder than harsh fixes.",
    action: "Stick to a mild cleanse and moisturiser you already tolerate.",
    category: "comfort",
    phases: ["any"],
    symptoms: ["acne"],
    priority: 5,
  },
  {
    id: "symptom-back-stretch",
    title: "Ease back discomfort",
    explanation:
      "You recorded back pain. Soft stretching may help; stop if pain increases.",
    action: "Try a short, supported stretch for your back or hips.",
    category: "movement",
    phases: ["any"],
    symptoms: ["back-pain"],
    priority: 5,
  },
  {
    id: "symptom-cravings-balance",
    title: "Meet cravings with balance",
    explanation:
      "Food cravings are common. Enjoy what you want alongside steadier meals.",
    action: "Pair a craving with a meal or snack that also includes protein or fibre.",
    category: "nutrition",
    phases: ["any"],
    symptoms: ["food-cravings"],
    priority: 5,
  },
  {
    id: "symptom-nausea-pace",
    title: "Go gently with nausea",
    explanation:
      "You logged nausea. Small sips and slower pacing can feel safer.",
    action: "Sip water slowly and choose a light food if appetite allows.",
    category: "comfort",
    phases: ["any"],
    symptoms: ["nausea"],
    priority: 5,
  },
] as const;

export function isWellnessRecommendationId(value: string): boolean {
  return WELLNESS_CATALOG.some((item) => item.id === value);
}

export function buildPersonalizedRecommendations(input: {
  phase: CyclePhase;
  recordedSymptoms: readonly SymptomId[];
  completedIds?: ReadonlySet<string> | readonly string[];
  limit?: number;
}): PersonalizedRecommendation[] {
  const limit = input.limit ?? 6;
  const completed =
    input.completedIds instanceof Set
      ? input.completedIds
      : new Set(input.completedIds ?? []);
  const symptomSet = new Set(input.recordedSymptoms);
  const selected: PersonalizedRecommendation[] = [];
  const seen = new Set<string>();

  const push = (
    def: WellnessRecommendationDef,
    source: PersonalizedRecommendation["source"],
  ) => {
    if (seen.has(def.id) || selected.length >= limit) return;
    seen.add(def.id);
    selected.push({
      ...def,
      source,
      completed: completed.has(def.id),
    });
  };

  const symptomItems = WELLNESS_CATALOG.filter(
    (item) =>
      item.symptoms?.some((symptom) => symptomSet.has(symptom)) &&
      (item.phases.includes("any") || item.phases.includes(input.phase)),
  ).sort((a, b) => a.priority - b.priority);

  for (const item of symptomItems) {
    push(item, "symptom");
  }

  const phaseItems = WELLNESS_CATALOG.filter(
    (item) =>
      !item.symptoms &&
      (item.phases.includes(input.phase) ||
        (input.phase === "unknown" && item.phases.includes("unknown"))),
  ).sort((a, b) => a.priority - b.priority);

  for (const item of phaseItems) {
    push(item, input.phase === "unknown" ? "general" : "phase");
  }

  if (selected.length < Math.min(3, limit)) {
    const fillers = WELLNESS_CATALOG.filter(
      (item) =>
        !item.symptoms &&
        item.phases.includes("any") &&
        !seen.has(item.id),
    ).sort((a, b) => a.priority - b.priority);
    for (const item of fillers) {
      push(item, "general");
    }
  }

  return selected;
}

export function wellnessProgress(recommendations: readonly PersonalizedRecommendation[]): {
  total: number;
  completed: number;
  percent: number;
} {
  const total = recommendations.length;
  const completed = recommendations.filter((item) => item.completed).length;
  return {
    total,
    completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}
