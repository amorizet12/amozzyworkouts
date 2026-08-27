import { LoggedSet, WorkoutLog } from "./types";
import { estimateOneRepMax } from "./strength";

export interface ProgressPoint {
  date: string;
  e1rm: number;
  volume: number;
}

/** One point per day the exercise was logged, sorted chronologically. */
export function getExerciseProgress(logs: WorkoutLog, exerciseId: string): ProgressPoint[] {
  const dates = Object.keys(logs).sort();
  const points: ProgressPoint[] = [];

  for (const date of dates) {
    const sets = (logs[date] ?? []).filter(
      (s: LoggedSet) => s.exerciseId === exerciseId && s.weight > 0 && s.reps > 0
    );
    if (sets.length === 0) continue;

    const e1rm = Math.max(...sets.map((s) => estimateOneRepMax(s.weight, s.reps, s.rpe)));
    const volume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    points.push({ date, e1rm, volume });
  }

  return points;
}
