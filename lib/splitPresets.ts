import { MuscleGroupId } from "./types";

export interface SplitType {
  id: string;
  label: string;
  muscleGroups: MuscleGroupId[];
}

/** Ordered workout types for each preset. Rest days get interleaved evenly
 * around one pass through this list, and the whole thing repeats as a
 * continuous cycle (see lib/schedule.ts). */
export const SPLIT_PRESET_TYPES: Record<"ppl" | "upper_lower", SplitType[]> = {
  ppl: [
    { id: "push", label: "Push", muscleGroups: ["chest", "shoulders", "triceps"] },
    { id: "pull", label: "Pull", muscleGroups: ["back", "biceps"] },
    { id: "legs", label: "Legs", muscleGroups: ["quads", "hamstrings", "glutes", "calves"] },
  ],
  upper_lower: [
    {
      id: "upper",
      label: "Upper",
      muscleGroups: ["chest", "back", "shoulders", "biceps", "triceps"],
    },
    { id: "lower", label: "Lower", muscleGroups: ["quads", "hamstrings", "glutes", "calves"] },
  ],
};
