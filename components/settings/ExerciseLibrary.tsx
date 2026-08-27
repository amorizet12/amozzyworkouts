"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { MUSCLE_GROUPS } from "@/lib/muscleGroups";
import { MuscleGroupId } from "@/lib/types";
import { bestEstimatedOneRepMax, dotsScore, toKg } from "@/lib/strength";

export default function ExerciseLibrary() {
  const exercises = useStore((s) => s.exercises);
  const [openGroup, setOpenGroup] = useState<MuscleGroupId | null>(MUSCLE_GROUPS[0].id);

  return (
    <div className="space-y-2">
      {MUSCLE_GROUPS.map((mg) => {
        const groupExercises = exercises.filter((e) => e.muscleGroup === mg.id);
        const open = openGroup === mg.id;
        return (
          <div key={mg.id} className="rounded-xl border border-base-700/60 bg-base-900/40">
            <button
              onClick={() => setOpenGroup(open ? null : mg.id)}
              className="flex w-full items-center justify-between px-3.5 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: mg.color }} />
                <span className="text-[13.5px] font-medium text-base-100">{mg.label}</span>
                <span className="text-[11.5px] text-base-500">{groupExercises.length}</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-base-500 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div className="border-t border-base-700/60 px-3.5 py-3">
                <ExerciseList muscleGroup={mg.id} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ExerciseList({ muscleGroup }: { muscleGroup: MuscleGroupId }) {
  const exercises = useStore((s) => s.exercises.filter((e) => e.muscleGroup === muscleGroup));
  const addExercise = useStore((s) => s.addExercise);
  const updateExercise = useStore((s) => s.updateExercise);
  const deleteExercise = useStore((s) => s.deleteExercise);
  const logs = useStore((s) => s.logs);
  const weightUnit = useStore((s) => s.weightUnit);
  const profile = useStore((s) => s.profile);

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    addExercise(newName, muscleGroup);
    setNewName("");
  };

  return (
    <div className="space-y-1.5">
      {exercises.map((ex) => {
        const e1rm = bestEstimatedOneRepMax(logs, ex.id);
        const dots =
          e1rm != null && profile.sex && profile.bodyweight
            ? dotsScore(toKg(e1rm, weightUnit), toKg(profile.bodyweight, weightUnit), profile.sex)
            : null;

        return (
          <div key={ex.id} className="rounded-lg bg-base-800/60 px-2.5 py-1.5">
            <div className="flex items-center justify-between gap-2">
              {editingId === ex.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateExercise(ex.id, editValue);
                      setEditingId(null);
                    }
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  onBlur={() => {
                    updateExercise(ex.id, editValue);
                    setEditingId(null);
                  }}
                  className="flex-1 rounded-md border border-accent-400/50 bg-base-950 px-2 py-1 text-[13px] text-base-100 outline-none"
                />
              ) : (
                <span className="text-[13px] text-base-100">{ex.name}</span>
              )}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingId(ex.id);
                    setEditValue(ex.name);
                  }}
                  className="rounded-md p-1 text-base-500 hover:bg-base-700 hover:text-base-100"
                  aria-label="Rename"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => deleteExercise(ex.id)}
                  className="rounded-md p-1 text-base-500 hover:bg-red-500/15 hover:text-red-400"
                  aria-label="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            {e1rm != null && (
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-accent-400/80">
                <TrendingUp size={11} />
                Est. 1RM: {Math.round(e1rm)}
                {weightUnit}
                {dots != null && (
                  <span className="text-base-500"> · DOTS {dots.toFixed(1)}</span>
                )}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex items-center gap-1.5 pt-1">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add exercise…"
          className="flex-1 rounded-lg border border-base-700 bg-base-950 px-2.5 py-1.5 text-[13px] text-base-100 outline-none focus:border-accent-400/60"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 rounded-lg bg-accent-400 px-2.5 py-1.5 text-[12px] font-semibold text-base-950 hover:bg-accent-300"
        >
          <Plus size={13} strokeWidth={2.5} />
          Add
        </button>
      </div>
    </div>
  );
}
