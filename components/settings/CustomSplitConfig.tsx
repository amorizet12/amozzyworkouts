"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Exercise, MuscleGroupId } from "@/lib/types";
import { MUSCLE_GROUPS, muscleGroupColor, muscleGroupLabel } from "@/lib/muscleGroups";
import MuscleGroupExercisePicker from "./MuscleGroupExercisePicker";
import { GroupSelections } from "./planBuilderTypes";

interface CustomSplitConfigProps {
  slots: GroupSelections[];
  onChange: (slots: GroupSelections[]) => void;
  exercises: Exercise[];
}

export default function CustomSplitConfig({ slots, onChange, exercises }: CustomSplitConfigProps) {
  const addSlot = () => onChange([...slots, {}]);
  const removeSlot = (i: number) => onChange(slots.filter((_, idx) => idx !== i));
  const moveSlot = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= slots.length) return;
    const next = [...slots];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const toggleGroup = (i: number, mg: MuscleGroupId) => {
    const next = [...slots];
    const slot = { ...next[i] };
    if (slot[mg]) {
      delete slot[mg];
    } else {
      slot[mg] = { exerciseIds: [], setsPerExercise: 3 };
    }
    next[i] = slot;
    onChange(next);
  };

  const toggleExercise = (i: number, mg: MuscleGroupId, exerciseId: string) => {
    const next = [...slots];
    const current = next[i][mg] ?? { exerciseIds: [], setsPerExercise: 3 };
    const has = current.exerciseIds.includes(exerciseId);
    next[i] = {
      ...next[i],
      [mg]: {
        ...current,
        exerciseIds: has
          ? current.exerciseIds.filter((id) => id !== exerciseId)
          : [...current.exerciseIds, exerciseId],
      },
    };
    onChange(next);
  };

  const changeSets = (i: number, mg: MuscleGroupId, delta: number) => {
    const next = [...slots];
    const current = next[i][mg] ?? { exerciseIds: [], setsPerExercise: 3 };
    next[i] = {
      ...next[i],
      [mg]: { ...current, setsPerExercise: Math.min(10, Math.max(1, current.setsPerExercise + delta)) },
    };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-base-500">
        Build your own repeating cycle, day by day — it repeats continuously from the plan's
        start date (not reset weekly). Leave a day with no muscle groups to make it a rest day.
      </p>

      {slots.map((slot, i) => {
        const activeGroups = Object.keys(slot) as MuscleGroupId[];
        const isRest = activeGroups.length === 0;
        return (
          <div key={i} className="rounded-lg border border-base-700/60 bg-base-900/40 p-3">
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] font-semibold text-base-100">
                Day {i + 1} {isRest && <span className="font-normal text-base-500">· Rest</span>}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveSlot(i, -1)}
                  disabled={i === 0}
                  className="rounded-md p-1 text-base-500 hover:bg-base-700 hover:text-base-100 disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveSlot(i, 1)}
                  disabled={i === slots.length - 1}
                  className="rounded-md p-1 text-base-500 hover:bg-base-700 hover:text-base-100 disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => removeSlot(i)}
                  className="rounded-md p-1 text-base-500 hover:bg-red-500/15 hover:text-red-400"
                  aria-label="Remove day"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {MUSCLE_GROUPS.map((mg) => {
                const on = Boolean(slot[mg.id]);
                return (
                  <button
                    key={mg.id}
                    onClick={() => toggleGroup(i, mg.id)}
                    className={[
                      "rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                      on ? "bg-accent-400 text-base-950" : "bg-base-800 text-base-400 hover:text-base-100",
                    ].join(" ")}
                  >
                    {mg.label}
                  </button>
                );
              })}
            </div>

            {activeGroups.length > 0 && (
              <div className="mt-2 space-y-2">
                {activeGroups.map((mg) => (
                  <MuscleGroupExercisePicker
                    key={mg}
                    muscleGroup={mg}
                    label={muscleGroupLabel(mg)}
                    color={muscleGroupColor(mg)}
                    exercises={exercises}
                    exerciseIds={slot[mg]?.exerciseIds ?? []}
                    setsPerExercise={slot[mg]?.setsPerExercise ?? 3}
                    onToggleExercise={(exerciseId) => toggleExercise(i, mg, exerciseId)}
                    onSetsChange={(delta) => changeSets(i, mg, delta)}
                    showWarning={(slot[mg]?.exerciseIds.length ?? 0) === 0}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={addSlot}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-base-700 py-2 text-[12.5px] font-medium text-base-400 hover:border-accent-400/40 hover:text-accent-400"
      >
        <Plus size={14} />
        Add day
      </button>
    </div>
  );
}
