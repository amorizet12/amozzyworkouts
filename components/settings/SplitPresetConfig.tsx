"use client";

import { Minus, Plus } from "lucide-react";
import { Exercise, MuscleGroupId } from "@/lib/types";
import { SPLIT_PRESET_TYPES } from "@/lib/splitPresets";
import { evenlySpacedIndices } from "@/lib/schedule";
import { muscleGroupColor, muscleGroupLabel } from "@/lib/muscleGroups";
import MuscleGroupExercisePicker from "./MuscleGroupExercisePicker";
import { GroupSelections } from "./planBuilderTypes";

interface SplitPresetConfigProps {
  splitType: "ppl" | "upper_lower";
  restDaysPerCycle: number;
  onRestDaysChange: (delta: number) => void;
  selections: GroupSelections;
  onSelectionsChange: (updater: (prev: GroupSelections) => GroupSelections) => void;
  exercises: Exercise[];
}

export default function SplitPresetConfig({
  splitType,
  restDaysPerCycle,
  onRestDaysChange,
  selections,
  onSelectionsChange,
  exercises,
}: SplitPresetConfigProps) {
  const types = SPLIT_PRESET_TYPES[splitType];
  const cycleLength = types.length + restDaysPerCycle;
  const restIndices = new Set(evenlySpacedIndices(restDaysPerCycle, cycleLength));

  const previewOrder: string[] = [];
  let cursor = 0;
  for (let i = 0; i < cycleLength; i++) {
    if (restIndices.has(i)) {
      previewOrder.push("Rest");
    } else {
      previewOrder.push(types[cursor].label);
      cursor++;
    }
  }

  const toggleExercise = (mg: MuscleGroupId, exerciseId: string) => {
    onSelectionsChange((prev) => {
      const current = prev[mg] ?? { exerciseIds: [], setsPerExercise: 3, warmupSets: 1 };
      const has = current.exerciseIds.includes(exerciseId);
      return {
        ...prev,
        [mg]: {
          ...current,
          exerciseIds: has
            ? current.exerciseIds.filter((id) => id !== exerciseId)
            : [...current.exerciseIds, exerciseId],
        },
      };
    });
  };

  const changeSets = (mg: MuscleGroupId, delta: number) => {
    onSelectionsChange((prev) => {
      const current = prev[mg] ?? { exerciseIds: [], setsPerExercise: 3, warmupSets: 1 };
      return {
        ...prev,
        [mg]: { ...current, setsPerExercise: Math.min(10, Math.max(1, current.setsPerExercise + delta)) },
      };
    });
  };

  const changeWarmup = (mg: MuscleGroupId, delta: number) => {
    onSelectionsChange((prev) => {
      const current = prev[mg] ?? { exerciseIds: [], setsPerExercise: 3, warmupSets: 1 };
      return {
        ...prev,
        [mg]: { ...current, warmupSets: Math.min(5, Math.max(0, current.warmupSets + delta)) },
      };
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-base-700/60 p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-base-100">Rest days per cycle</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onRestDaysChange(-1)}
              className="rounded-md bg-base-800 p-1 text-base-300 hover:bg-base-700"
            >
              <Minus size={12} />
            </button>
            <span className="w-4 text-center text-[12.5px] text-base-200">{restDaysPerCycle}</span>
            <button
              onClick={() => onRestDaysChange(1)}
              className="rounded-md bg-base-800 p-1 text-base-300 hover:bg-base-700"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {previewOrder.map((label, i) => (
            <span
              key={i}
              className={[
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                label === "Rest" ? "bg-base-800 text-base-500" : "bg-accent-400/15 text-accent-400",
              ].join(" ")}
            >
              {label}
            </span>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-base-500">
          This {cycleLength}-day pattern repeats continuously for the whole plan — it doesn't
          reset every Sunday, so which day of the week lands on "Push" (for example) will drift
          over time.
        </p>
      </div>

      {types.map((type) => (
        <div key={type.id} className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-base-500">
            {type.label}
          </p>
          {type.muscleGroups.map((mg) => (
            <MuscleGroupExercisePicker
              key={mg}
              muscleGroup={mg}
              label={muscleGroupLabel(mg)}
              color={muscleGroupColor(mg)}
              exercises={exercises}
              exerciseIds={selections[mg]?.exerciseIds ?? []}
              setsPerExercise={selections[mg]?.setsPerExercise ?? 3}
              warmupSets={selections[mg]?.warmupSets ?? 1}
              onToggleExercise={(exerciseId) => toggleExercise(mg, exerciseId)}
              onSetsChange={(delta) => changeSets(mg, delta)}
              onWarmupChange={(delta) => changeWarmup(mg, delta)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
