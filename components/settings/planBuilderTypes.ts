import { DaySlot, MuscleGroupId } from "@/lib/types";

export type GroupSelections = Partial<
  Record<MuscleGroupId, { exerciseIds: string[]; setsPerExercise: number }>
>;

export function groupSelectionsToDaySlot(selections: GroupSelections): DaySlot {
  return (Object.entries(selections) as [MuscleGroupId, { exerciseIds: string[]; setsPerExercise: number }][])
    .filter(([, v]) => v.exerciseIds.length > 0)
    .map(([muscleGroup, v]) => ({
      muscleGroup,
      exerciseIds: v.exerciseIds,
      setsPerExercise: v.setsPerExercise,
    }));
}
