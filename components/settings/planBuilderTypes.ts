import { DaySlot, MuscleGroupId } from "@/lib/types";

export type GroupSelections = Partial<
  Record<MuscleGroupId, { exerciseIds: string[]; setsPerExercise: number; warmupSets: number }>
>;

/** Cardio is logged by duration, not sets — one entry per day regardless of
 * what the (hidden, for cardio) sets/warmup steppers happen to hold. */
export function daySlotCounts(muscleGroup: MuscleGroupId, setsPerExercise: number, warmupSets: number) {
  if (muscleGroup === "cardio") return { setsPerExercise: 1, warmupSets: 0 };
  return { setsPerExercise, warmupSets };
}

export function groupSelectionsToDaySlot(selections: GroupSelections): DaySlot {
  return (
    Object.entries(selections) as [
      MuscleGroupId,
      { exerciseIds: string[]; setsPerExercise: number; warmupSets: number }
    ][]
  )
    .filter(([, v]) => v.exerciseIds.length > 0)
    .map(([muscleGroup, v]) => ({
      muscleGroup,
      exerciseIds: v.exerciseIds,
      ...daySlotCounts(muscleGroup, v.setsPerExercise, v.warmupSets),
    }));
}
