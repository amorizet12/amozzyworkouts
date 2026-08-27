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
}

export interface ScheduledDay {
  date: string; // ISO yyyy-mm-dd
  muscleGroups: MuscleGroupId[];
  exercises: { exerciseId: string; muscleGroup: MuscleGroupId }[];
}

export interface Plan {
  id: string;
  name: string;
  startDate: string; // ISO yyyy-mm-dd
  durationWeeks: number;
  targets: PlanTarget[];
  schedule: Record<string, ScheduledDay>;
  createdAt: string;
}

export interface LoggedSet {
  id: string;
  exerciseId: string;
  weight: number;
  reps: number;
  setNumber: number;
  loggedAt: string;
}

export type WorkoutLog = Record<string, LoggedSet[]>; // date -> sets

export interface AppData {
  exercises: Exercise[];
  plans: Plan[];
  activePlanId: string | null;
  logs: WorkoutLog;
  weightUnit: "lbs" | "kg";
}
