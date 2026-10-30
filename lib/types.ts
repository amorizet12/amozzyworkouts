import { AccentColorId, ThemeMode } from "./theme";

export type MuscleGroupId =
  | "cardio"
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core";

export interface MuscleGroupDef {
  id: MuscleGroupId;
  label: string;
  color: string; // tailwind-safe hex used for calendar chips
}

export type EquipmentType = "barbell" | "dumbbell" | "bodyweight" | "band" | "cardio";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroupId;
  equipment: EquipmentType;
  /** Band exercises only: reps are counted per leg (e.g. banded lateral walks). */
  perLeg?: boolean;
}

export interface DaySlotEntry {
  muscleGroup: MuscleGroupId;
  exerciseIds: string[];
  setsPerExercise: number;
  /** Warmup sets to aim for before the working sets, e.g. 1 ramp-up set. */
  warmupSets?: number;
}

/** One day's plan: a list of muscle-group blocks, or an empty array for a rest day. */
export type DaySlot = DaySlotEntry[];

export type SplitStyle = "ppl" | "upper_lower" | "custom";

export interface ScheduledExercise {
  exerciseId: string;
  muscleGroup: MuscleGroupId;
  targetSets: number;
  targetWarmupSets?: number;
}

export interface ScheduledDay {
  date: string; // ISO yyyy-mm-dd
  muscleGroups: MuscleGroupId[];
  exercises: ScheduledExercise[];
}

export interface Plan {
  id: string;
  name: string;
  startDate: string; // ISO yyyy-mm-dd
  durationWeeks: number;
  splitStyle: SplitStyle;
  restDaysPerCycle: number; // informational, only meaningful for ppl/upper_lower presets
  /** The plan's day-by-day content, indexed by offset from startDate (0 = startDate).
   * Built by repeating a base cycle continuously — it does NOT reset weekly.
   * This is the editable source of truth: swapping an exercise or pushing a
   * day mutates specific entries here directly. */
  daySequence: DaySlot[];
  schedule: Record<string, ScheduledDay>;
  createdAt: string;
  /** Set when "Push today" was last used, so it can be undone. Cleared on undo
   * or overwritten by a later push. */
  pendingPush?: { dateISO: string; index: number; length: number } | null;
}

export interface LoggedSet {
  id: string;
  exerciseId: string;
  /** Total weight for barbell/generic equipment; per-arm weight for
   * dumbbells; unused (0) for bodyweight and band exercises. */
  weight: number;
  reps: number;
  rpe?: number; // 6-10 in 0.5 increments; omitted = unknown effort
  bandColor?: string; // free-text label, only meaningful for band exercises
  isWarmup?: boolean;
  setNumber: number;
  loggedAt: string;
}

export type WorkoutLog = Record<string, LoggedSet[]>; // date -> sets

export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export interface UserProfile {
  sex: Sex | null;
  bodyweight: number | null; // in current weightUnit
  heightIn: number | null;
  activityLevel: ActivityLevel | null;
}

export interface AppData {
  exercises: Exercise[];
  plans: Plan[];
  activePlanId: string | null;
  logs: WorkoutLog;
  weightUnit: "lbs" | "kg";
  profile: UserProfile;
  completedDates: string[]; // ISO dates the user marked a scheduled workout complete
  completedAt: Record<string, string>; // ISO date -> timestamp it was marked complete
  warmupCompletedDates: string[]; // ISO dates the pre-workout warmup was checked off
  cooldownCompletedDates: string[]; // ISO dates the post-workout cooldown was checked off
  favoriteLibraryIds: string[]; // Discover-library exercise ids saved as favorites
  tryLaterLibraryIds: string[]; // Discover-library exercise ids saved to try later
  bodyweightLogs: Record<string, number>; // ISO date -> bodyweight in current weightUnit
  exerciseNotes: Record<string, Record<string, string>>; // ISO date -> exerciseId -> free-text note
  appName: string;
  theme: ThemeMode;
  accentColor: AccentColorId;
}
