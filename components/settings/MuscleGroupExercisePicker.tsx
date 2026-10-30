"use client";

import { Minus, Plus } from "lucide-react";
import { Exercise, MuscleGroupId } from "@/lib/types";

interface MuscleGroupExercisePickerProps {
  muscleGroup: MuscleGroupId;
  label: string;
  color: string;
  exercises: Exercise[];
  exerciseIds: string[];
  setsPerExercise: number;
  warmupSets: number;
  onToggleExercise: (exerciseId: string) => void;
  onSetsChange: (delta: number) => void;
  onWarmupChange: (delta: number) => void;
  showWarning?: boolean;
}

export default function MuscleGroupExercisePicker({
  muscleGroup,
  label,
  color,
  exercises,
  exerciseIds,
  setsPerExercise,
  warmupSets,
  onToggleExercise,
  onSetsChange,
  onWarmupChange,
  showWarning,
}: MuscleGroupExercisePickerProps) {
  const groupExercises = exercises.filter((e) => e.muscleGroup === muscleGroup);
  const isCardio = muscleGroup === "cardio";

  return (
    <div className="rounded-lg border border-base-700/60 p-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[13px] font-medium text-base-100">{label}</span>
        </div>
      </div>

      {isCardio ? (
        <p className="mt-1 text-[11px] text-base-500">
          Pick the cardio you enjoy — logged by duration, not sets. Add it alongside a lifting day
          for a finisher, or on its own for a cardio-only day.
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] text-base-500">warmup/ex</span>
            <button
              onClick={() => onWarmupChange(-1)}
              className="rounded-md bg-base-800 p-1 text-base-300 hover:bg-base-700"
            >
              <Minus size={12} />
            </button>
            <span className="w-4 text-center text-[12.5px] text-base-200">{warmupSets}</span>
            <button
              onClick={() => onWarmupChange(1)}
              className="rounded-md bg-base-800 p-1 text-base-300 hover:bg-base-700"
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] text-base-500">working/ex</span>
            <button
              onClick={() => onSetsChange(-1)}
              className="rounded-md bg-base-800 p-1 text-base-300 hover:bg-base-700"
            >
              <Minus size={12} />
            </button>
            <span className="w-4 text-center text-[12.5px] text-base-200">{setsPerExercise}</span>
            <button
              onClick={() => onSetsChange(1)}
              className="rounded-md bg-base-800 p-1 text-base-300 hover:bg-base-700"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {groupExercises.length === 0 && (
          <p className="text-[11.5px] text-base-500">
            No exercises in this group yet — add some in the Exercises tab.
          </p>
        )}
        {groupExercises.map((ex) => {
          const selected = exerciseIds.includes(ex.id);
          return (
            <button
              key={ex.id}
              onClick={() => onToggleExercise(ex.id)}
              className={[
                "rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                selected
                  ? "bg-accent-400 text-base-950"
                  : "bg-base-800 text-base-400 hover:text-base-100",
              ].join(" ")}
            >
              {ex.name}
            </button>
          );
        })}
      </div>
      {showWarning && (
        <p className="mt-1.5 text-[11px] text-red-400">
          Pick at least one exercise for {label.toLowerCase()}, or remove it from this day.
        </p>
      )}
    </div>
  );
}
