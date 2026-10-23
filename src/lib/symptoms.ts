export const SYMPTOM_NOTE_MAX_LENGTH = 400;

export type SymptomId =
  | "cramps"
  | "headache"
  | "bloating"
  | "fatigue"
  | "mood-changes"
  | "breast-tenderness";

export type SymptomSeverity = 1 | 2 | 3 | 4 | 5;

export const SYMPTOM_OPTIONS = [
  { id: "cramps", name: "Cramps" },
  { id: "headache", name: "Headache" },
  { id: "bloating", name: "Bloating" },
  { id: "fatigue", name: "Fatigue" },
  { id: "mood-changes", name: "Mood changes" },
  { id: "breast-tenderness", name: "Breast tenderness" },
] as const satisfies ReadonlyArray<{ id: SymptomId; name: string }>;

export const SYMPTOM_SEVERITIES = [
  { value: 1, name: "Mild" },
  { value: 2, name: "Noticeable" },
  { value: 3, name: "Moderate" },
  { value: 4, name: "Strong" },
  { value: 5, name: "Intense" },
] as const satisfies ReadonlyArray<{ value: SymptomSeverity; name: string }>;

export interface SymptomLog {
  id: string;
  loggedOn: string;
  symptom: SymptomId;
  severity: SymptomSeverity;
  notes: string | null;
}

export function isSymptomId(value: string): value is SymptomId {
  return SYMPTOM_OPTIONS.some((option) => option.id === value);
}

export function isSymptomSeverity(value: number): value is SymptomSeverity {
  return SYMPTOM_SEVERITIES.some((option) => option.value === value);
}

export function symptomName(id: SymptomId): string {
  return SYMPTOM_OPTIONS.find((option) => option.id === id)?.name ?? id;
}

export function severityName(value: SymptomSeverity): string {
  return (
    SYMPTOM_SEVERITIES.find((option) => option.value === value)?.name ??
    String(value)
  );
}
