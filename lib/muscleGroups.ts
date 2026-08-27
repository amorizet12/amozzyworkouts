import { Exercise, MuscleGroupDef, MuscleGroupId } from "./types";
import { makeId } from "./id";

export const MUSCLE_GROUPS: MuscleGroupDef[] = [
  { id: "chest", label: "Chest", color: "#39e991" },
  { id: "back", label: "Back", color: "#5cc8ff" },
  { id: "shoulders", label: "Shoulders", color: "#f2c94c" },
  { id: "biceps", label: "Biceps", color: "#c792ea" },
  { id: "triceps", label: "Triceps", color: "#ff8a65" },
  { id: "quads", label: "Quads", color: "#4fd1c5" },
  { id: "hamstrings", label: "Hamstrings", color: "#f472b6" },
  { id: "glutes", label: "Glutes", color: "#fca5a5" },
  { id: "calves", label: "Calves", color: "#a3e635" },
  { id: "core", label: "Core", color: "#93c5fd" },
];

export function muscleGroupLabel(id: MuscleGroupId): string {
  return MUSCLE_GROUPS.find((m) => m.id === id)?.label ?? id;
}

export function muscleGroupColor(id: MuscleGroupId): string {
  return MUSCLE_GROUPS.find((m) => m.id === id)?.color ?? "#39e991";
}

const defaultExerciseNames: Record<MuscleGroupId, string[]> = {
  chest: ["Bench Press", "Incline Dumbbell Press", "Push-Ups", "Cable Fly", "Dips"],
  back: ["Deadlift", "Pull-Ups", "Barbell Row", "Lat Pulldown", "Seated Cable Row"],
  shoulders: ["Overhead Press", "Lateral Raise", "Front Raise", "Face Pull", "Arnold Press"],
  biceps: ["Barbell Curl", "Dumbbell Curl", "Hammer Curl", "Preacher Curl"],
  triceps: ["Close-Grip Bench Press", "Tricep Pushdown", "Skull Crushers", "Overhead Tricep Extension"],
  quads: ["Back Squat", "Leg Press", "Walking Lunges", "Leg Extension"],
  hamstrings: ["Romanian Deadlift", "Leg Curl", "Good Morning"],
  glutes: ["Hip Thrust", "Glute Bridge", "Cable Kickback"],
  calves: ["Standing Calf Raise", "Seated Calf Raise"],
  core: ["Plank", "Hanging Leg Raise", "Cable Crunch", "Russian Twist"],
};

export function buildDefaultExercises(): Exercise[] {
  const list: Exercise[] = [];
  (Object.keys(defaultExerciseNames) as MuscleGroupId[]).forEach((mg) => {
    defaultExerciseNames[mg].forEach((name) => {
      list.push({ id: makeId("ex"), name, muscleGroup: mg });
    });
  });
  return list;
}
