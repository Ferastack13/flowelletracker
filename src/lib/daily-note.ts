export interface DailyNote {
  title: "Her Daily Note";
  theme: string;
  message: string;
  isPersonalised: false;
}

interface DailyNoteTemplate {
  theme: string;
  message: string;
}

/**
 * General notes keyed by calendar date. Same date always returns the same note.
 * These are not personalised and are not medical advice.
 */
const DAILY_NOTE_TEMPLATES: readonly DailyNoteTemplate[] = [
  {
    theme: "Gentle energy",
    message:
      "A short walk, warm food, and a quiet moment with your journal can help you stay in rhythm with yourself today.",
  },
  {
    theme: "Warmth",
    message:
      "Warmth is care you can feel. A heated cloth, a slower cup of tea, or a softer layer can be enough for this hour.",
  },
  {
    theme: "Quiet",
    message:
      "Quiet does not have to be empty. Leave one small pocket of the day unscheduled and let your mind arrive there.",
  },
  {
    theme: "Hydration",
    message:
      "Begin with water before you ask more of the day. Warm or cool is a preference, not a rule.",
  },
  {
    theme: "Rest",
    message:
      "Rest is not a prize you earn after finishing everything. It can be the first kind thing you offer yourself.",
  },
  {
    theme: "Soft movement",
    message:
      "If you move today, let it be the kind that asks permission of your body — a stretch, a stroll, a pause at the window.",
  },
  {
    theme: "Rhythm",
    message:
      "Rhythm is built in repeats, not resolutions. One familiar habit kept gently is already a return to yourself.",
  },
  {
    theme: "Nourishment",
    message:
      "Eat something that feels like support, not a test. Regular food is part of how a cycle is lived, not a side note.",
  },
  {
    theme: "Comfort",
    message:
      "Comfort can be ordinary: clean sheets, a softer waistband, a room a little dimmer than usual.",
  },
  {
    theme: "Patience",
    message:
      "You do not owe anyone a brighter mood. Meet the day at the pace you actually have.",
  },
  {
    theme: "Privacy",
    message:
      "Your body story is yours to keep. Share only what feels safe, and keep the rest in a quiet place.",
  },
  {
    theme: "Breath",
    message:
      "Three unhurried breaths can reset a crowded morning. In through the nose, out a little longer than you came in.",
  },
  {
    theme: "Tenderness",
    message:
      "Speak to yourself as you would to a friend who is tired. The words can be small and still be true.",
  },
  {
    theme: "Light",
    message:
      "If you can, take in a little daylight. Even a few minutes by a window helps the day find its shape.",
  },
  {
    theme: "Boundaries",
    message:
      "A clear no today can be a form of care. You may keep your energy for what you already promised yourself.",
  },
  {
    theme: "Stillness",
    message:
      "Stillness is not the absence of life. Sit with a warm drink and let one thought finish before the next begins.",
  },
  {
    theme: "Body literacy",
    message:
      "Notice without scoring yourself. A sensation, a craving, a need for quiet — each is information, not a verdict.",
  },
  {
    theme: "Ease",
    message:
      "Choose the easier kind version of a task if you have one. Lowering the bar can be how you stay kind.",
  },
  {
    theme: "Sleep",
    message:
      "Protect the last hour of the evening if you can. Dimmer light and a slower close help rest arrive.",
  },
  {
    theme: "Company",
    message:
      "Company can be one trusted person or a quiet room. Choose the presence that does not ask you to perform.",
  },
  {
    theme: "Release",
    message:
      "You may put down one thing that is not yours to carry today. The list can wait; your body is already here.",
  },
  {
    theme: "Grounding",
    message:
      "Feel your feet on the floor. Name one thing you can see, one you can hear, and one you can hold.",
  },
  {
    theme: "Kindness",
    message:
      "A kind act toward yourself counts even when no one sees it. The record is the feeling it leaves.",
  },
  {
    theme: "Pace",
    message:
      "If the day is full, keep one part of it unhurried. Pace is a form of respect for a changing body.",
  },
  {
    theme: "Shelter",
    message:
      "Make a small shelter in the day: a favourite mug, a closed door, a playlist that asks nothing of you.",
  },
  {
    theme: "Attention",
    message:
      "Give one ordinary thing your full attention — washing your hands, making the bed, watering a plant.",
  },
  {
    theme: "Forgiveness",
    message:
      "If yesterday was messy, begin again without a lecture. Continuity matters more than a perfect streak.",
  },
  {
    theme: "Homecoming",
    message:
      "Come back to your own pace whenever you notice you have left it. Home is allowed to be a feeling, not a place.",
  },
];

function dayOfYear(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return 0;
  const date = Date.UTC(year, month - 1, day);
  const start = Date.UTC(year, 0, 1);
  return Math.floor((date - start) / 86_400_000);
}

export function noteForDate(isoDate: string): DailyNote {
  const index =
    ((dayOfYear(isoDate) % DAILY_NOTE_TEMPLATES.length) +
      DAILY_NOTE_TEMPLATES.length) %
    DAILY_NOTE_TEMPLATES.length;
  const template = DAILY_NOTE_TEMPLATES[index] ?? DAILY_NOTE_TEMPLATES[0];

  return {
    title: "Her Daily Note",
    theme: template.theme,
    message: template.message,
    isPersonalised: false,
  };
}
