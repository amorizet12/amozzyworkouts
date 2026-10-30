import { LoggedSet, WorkoutLog } from "./types";
import { estimateOneRepMax } from "./strength";

export interface ProgressPoint {
  date: string;
  /** 0 for bodyweight/band sets, which have no external load. */
  e1rm: number;
  volume: number;
  /** Most reps done in a single set that day — the trend metric for
   * bodyweight/band exercises, where weight isn't tracked. */
  bestReps: number;
}

/** One point per day the exercise was logged, sorted chronologically. */
export function getExerciseProgress(logs: WorkoutLog, exerciseId: string): ProgressPoint[] {
  const dates = Object.keys(logs).sort();
  const points: ProgressPoint[] = [];

  for (const date of dates) {
    const sets = (logs[date] ?? []).filter(
      (s: LoggedSet) => s.exerciseId === exerciseId && s.reps > 0
    );
    if (sets.length === 0) continue;

    const weightedSets = sets.filter((s) => s.weight > 0);
    const e1rm =
      weightedSets.length > 0
        ? Math.max(...weightedSets.map((s) => estimateOneRepMax(s.weight, s.reps, s.rpe)))
        : 0;
    const volume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    const bestReps = Math.max(...sets.map((s) => s.reps));
    points.push({ date, e1rm, volume, bestReps });
  }

  return points;
}

export interface BodyweightPoint {
  date: string;
  value: number;
}

/** Logged bodyweight, sorted chronologically. */
export function getBodyweightProgress(bodyweightLogs: Record<string, number>): BodyweightPoint[] {
  return Object.entries(bodyweightLogs)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, value]) => ({ date, value }));
}
