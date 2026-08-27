import { LoggedSet, WorkoutLog } from "./types";

export interface LastPerformance {
  date: string;
  sets: LoggedSet[];
}

export function getLastPerformance(
  logs: WorkoutLog,
  exerciseId: string,
  beforeDate: string
): LastPerformance | null {
  const dates = Object.keys(logs)
    .filter((d) => d < beforeDate)
    .sort((a, b) => (a < b ? 1 : -1));

  for (const date of dates) {
    const sets = (logs[date] ?? []).filter((s) => s.exerciseId === exerciseId);
    if (sets.length > 0) {
      return { date, sets: sets.sort((a, b) => a.setNumber - b.setNumber) };
    }
  }
  return null;
}

export function formatSets(sets: LoggedSet[], unit: "lbs" | "kg"): string {
  return sets.map((s) => `${s.weight}${unit} × ${s.reps}`).join(", ");
}
