export type MuscleGroupId =
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

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroupId;
}

export interface PlanTarget {
  muscleGroup: MuscleGroupId;
  timesPerWeek: number;
  exerciseIds: string[];
  setsPerExercise: number;
}

export interface WeeklyTemplateEntry {
  muscleGroup: MuscleGroupId;
  exerciseIds: string[];
  setsPerExercise: number;
}

// Sunday = 0 ... Saturday = 6, matching Date#getDay()
export type WeeklyTemplate = Record<number, WeeklyTemplateEntry[]>;

export interface ScheduledExercise {
  exerciseId: string;
  muscleGroup: MuscleGroupId;
  targetSets: number;
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
  targets: PlanTarget[];
  weeklyTemplate: WeeklyTemplate;
  schedule: Record<string, ScheduledDay>;
  createdAt: string;
}

export interface LoggedSet {
  id: string;
  exerciseId: string;
  weight: number;
  reps: number;
  rpe?: number; // 6-10 in 0.5 increments; omitted = unknown effort
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
}
