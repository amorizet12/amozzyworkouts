import { EquipmentType, Exercise, MuscleGroupDef, MuscleGroupId } from "./types";
import { makeId } from "./id";

export const MUSCLE_GROUPS: MuscleGroupDef[] = [
  { id: "cardio", label: "Cardio", color: "#fb7185" },
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

type DefaultExercise = { name: string; equipment: EquipmentType };

const defaultExerciseNames: Record<MuscleGroupId, DefaultExercise[]> = {
  cardio: [
    { name: "Walking", equipment: "cardio" },
    { name: "Jogging", equipment: "cardio" },
    { name: "Elliptical", equipment: "cardio" },
  ],
  chest: [
    { name: "Bench Press", equipment: "barbell" },
    { name: "Incline Dumbbell Press", equipment: "dumbbell" },
    { name: "Push-Ups", equipment: "bodyweight" },
    { name: "Cable Fly", equipment: "barbell" },
    { name: "Dips", equipment: "bodyweight" },
  ],
  back: [
    { name: "Deadlift", equipment: "barbell" },
    { name: "Pull-Ups", equipment: "bodyweight" },
    { name: "Barbell Row", equipment: "barbell" },
    { name: "Lat Pulldown", equipment: "barbell" },
    { name: "Seated Cable Row", equipment: "barbell" },
  ],
  shoulders: [
    { name: "Overhead Press", equipment: "barbell" },
    { name: "Lateral Raise", equipment: "dumbbell" },
    { name: "Front Raise", equipment: "dumbbell" },
    { name: "Face Pull", equipment: "band" },
    { name: "Arnold Press", equipment: "dumbbell" },
  ],
  biceps: [
    { name: "Barbell Curl", equipment: "barbell" },
    { name: "Dumbbell Curl", equipment: "dumbbell" },
    { name: "Hammer Curl", equipment: "dumbbell" },
    { name: "Preacher Curl", equipment: "barbell" },
  ],
  triceps: [
    { name: "Close-Grip Bench Press", equipment: "barbell" },
    { name: "Tricep Pushdown", equipment: "barbell" },
    { name: "Skull Crushers", equipment: "barbell" },
    { name: "Overhead Tricep Extension", equipment: "dumbbell" },
  ],
  quads: [
    { name: "Back Squat", equipment: "barbell" },
    { name: "Leg Press", equipment: "barbell" },
    { name: "Walking Lunges", equipment: "dumbbell" },
    { name: "Leg Extension", equipment: "barbell" },
  ],
  hamstrings: [
    { name: "Romanian Deadlift", equipment: "barbell" },
    { name: "Leg Curl", equipment: "barbell" },
    { name: "Good Morning", equipment: "barbell" },
  ],
  glutes: [
    { name: "Hip Thrust", equipment: "barbell" },
    { name: "Glute Bridge", equipment: "bodyweight" },
    { name: "Cable Kickback", equipment: "band" },
  ],
  calves: [
    { name: "Standing Calf Raise", equipment: "barbell" },
    { name: "Seated Calf Raise", equipment: "barbell" },
  ],
  core: [
    { name: "Plank", equipment: "bodyweight" },
    { name: "Hanging Leg Raise", equipment: "bodyweight" },
    { name: "Cable Crunch", equipment: "barbell" },
    { name: "Russian Twist", equipment: "bodyweight" },
  ],
};

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  bodyweight: "Bodyweight",
  band: "Resistance band",
  cardio: "Cardio",
};

export function buildDefaultExercises(): Exercise[] {
  const list: Exercise[] = [];
  (Object.keys(defaultExerciseNames) as MuscleGroupId[]).forEach((mg) => {
    defaultExerciseNames[mg].forEach(({ name, equipment }) => {
      list.push({ id: makeId("ex"), name, muscleGroup: mg, equipment });
    });
  });
  return list;
}
