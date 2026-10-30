import { EquipmentType, LoggedSet, Sex, WorkoutLog } from "./types";

/**
 * %1RM by rep count at RPE 10 (true failure), from the Reactive Training
 * Systems / Tuchscherer RPE chart — the standard reference table used by
 * most RPE-based load calculators. Index 0 = 1 rep.
 */
const RPE10_PERCENT_BY_REPS = [
  1.0, 0.955, 0.922, 0.892, 0.863, 0.837, 0.811, 0.786, 0.762, 0.739, 0.716, 0.694,
];

function percentAtReps(effectiveReps: number): number {
  if (effectiveReps <= 1) return RPE10_PERCENT_BY_REPS[0];
  if (effectiveReps <= 12) {
    const lower = Math.floor(effectiveReps);
    const upper = Math.ceil(effectiveReps);
    const lowPct = RPE10_PERCENT_BY_REPS[lower - 1];
    const highPct = RPE10_PERCENT_BY_REPS[upper - 1];
    const frac = effectiveReps - lower;
    return lowPct + (highPct - lowPct) * frac;
  }
  // Beyond the chart, fall back to the classic Epley decay curve.
  return 1 / (1 + effectiveReps / 30);
}

/**
 * Estimates a one-rep max from a single set. RPE (6-10, "reps in reserve"
 * scale) is optional — each point below 10 is treated as one more rep in
 * the tank. Omitting it assumes the set was taken to failure (RPE 10),
 * which is conservative for lighter working sets but keeps the estimate
 * from silently guessing at effort that wasn't recorded.
 */
export function estimateOneRepMax(weight: number, reps: number, rpe?: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  const repsInReserve = rpe != null ? Math.max(0, 10 - rpe) : 0;
  const effectiveReps = reps + repsInReserve;
  const percent = percentAtReps(effectiveReps);
  return weight / percent;
}

/** Best estimated 1RM ever logged for an exercise, or null with no data. */
export function bestEstimatedOneRepMax(logs: WorkoutLog, exerciseId: string): number | null {
  let best: number | null = null;
  for (const sets of Object.values(logs)) {
    for (const s of sets as LoggedSet[]) {
      if (s.exerciseId !== exerciseId || s.weight <= 0 || s.reps <= 0) continue;
      const e1rm = estimateOneRepMax(s.weight, s.reps, s.rpe);
      if (best == null || e1rm > best) best = e1rm;
    }
  }
  return best;
}

const LB_PER_KG = 2.2046226218;

export function toKg(value: number, unit: "lbs" | "kg"): number {
  return unit === "kg" ? value : value / LB_PER_KG;
}

// DOTS coefficients (2020 IPF-adopted formula), bodyweight in kg.
const DOTS_COEFFICIENTS: Record<Sex, [number, number, number, number, number]> = {
  male: [-0.000001093, 0.0007391293, -0.1918759221, 24.0900756, -307.75076],
  female: [-0.0000010706, 0.0005158568, -0.1126655495, 13.6175032, 57.96288],
};

/**
 * DOTS score: a bodyweight-normalized strength score (successor to Wilks,
 * used in modern raw powerlifting). Works for any single lift, not just a
 * powerlifting total — higher means stronger relative to bodyweight.
 */
export function dotsScore(liftKg: number, bodyweightKg: number, sex: Sex): number | null {
  if (liftKg <= 0 || bodyweightKg <= 0) return null;
  const [a, b, c, d, e] = DOTS_COEFFICIENTS[sex];
  const bw = bodyweightKg;
  const denominator = a * bw ** 4 + b * bw ** 3 + c * bw ** 2 + d * bw + e;
  if (denominator <= 0) return null;
  return (liftKg * 500) / denominator;
}

export const DOTS_EXPLANATION =
  "DOTS is a bodyweight-adjusted strength score (the 2020 update to the old Wilks formula). It scales a lift against what's typical for someone at your bodyweight, so a 130lb lifter and a 230lb lifter can be compared fairly on the same number — higher DOTS means more relative strength, regardless of size.";

/** DOTS only makes sense for lifts with a real external load. Dumbbell
 * weight is logged per arm, so both hands' load is doubled to approximate
 * the total lifted weight; bodyweight and band exercises have no
 * quantifiable load and are excluded entirely. */
export function dotsApplicable(equipment: EquipmentType): boolean {
  return equipment === "barbell" || equipment === "dumbbell";
}

export function dotsLiftWeight(e1rm: number, equipment: EquipmentType): number {
  return equipment === "dumbbell" ? e1rm * 2 : e1rm;
}

export const RPE_SCALE: { value: number; label: string }[] = [
  { value: 6, label: "Very easy" },
  { value: 6.5, label: "Easy" },
  { value: 7, label: "Moderate" },
  { value: 7.5, label: "Somewhat hard" },
  { value: 8, label: "Hard" },
  { value: 8.5, label: "Fairly difficult" },
  { value: 9, label: "Very hard" },
  { value: 9.5, label: "Extremely hard" },
  { value: 10, label: "Maximum effort" },
];

// Standard NSCA %1RM-by-rep-goal guidelines (Essentials of Strength
// Training and Conditioning), used as reference points when planning loads.
export const NSCA_LOAD_GUIDE: { reps: number; percent: number }[] = [
  { reps: 1, percent: 100 },
  { reps: 2, percent: 95 },
  { reps: 3, percent: 93 },
  { reps: 4, percent: 90 },
  { reps: 5, percent: 87 },
  { reps: 6, percent: 85 },
  { reps: 7, percent: 83 },
  { reps: 8, percent: 80 },
  { reps: 9, percent: 77 },
  { reps: 10, percent: 75 },
  { reps: 12, percent: 70 },
  { reps: 15, percent: 65 },
];
