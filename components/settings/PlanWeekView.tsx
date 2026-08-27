"use client";

import { useState } from "react";
import { ArrowLeftRight, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Exercise, MuscleGroupId, Plan } from "@/lib/types";
import { muscleGroupColor, muscleGroupLabel } from "@/lib/muscleGroups";

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface PlanWeekViewProps {
  plan: Plan;
  exercises: Exercise[];
}

export default function PlanWeekView({ plan, exercises }: PlanWeekViewProps) {
  const [swapKey, setSwapKey] = useState<string | null>(null);
  const swapPlanExercise = useStore((s) => s.swapPlanExercise);

  const exerciseName = (id: string) => exercises.find((e) => e.id === id)?.name ?? "Unknown";

  return (
    <div className="space-y-2">
      {DAY_LABELS.map((label, day) => {
        const entries = plan.weeklyTemplate?.[day] ?? [];
        return (
          <div key={day} className="rounded-lg border border-base-700/60 p-3">
            <p className="text-[11.5px] font-semibold uppercase tracking-wide text-base-400">
              {label}
            </p>

            {entries.length === 0 ? (
              <p className="mt-1 text-[12.5px] text-base-500">Rest day</p>
            ) : (
              <div className="mt-2 space-y-2">
                {entries.map((entry) => (
                  <div key={entry.muscleGroup}>
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor: `${muscleGroupColor(entry.muscleGroup)}22`,
                        color: muscleGroupColor(entry.muscleGroup),
                      }}
                    >
                      {muscleGroupLabel(entry.muscleGroup)}
                    </span>
                    <div className="mt-1.5 space-y-1">
                      {entry.exerciseIds.map((exId) => {
                        const key = `${day}-${entry.muscleGroup}-${exId}`;
                        const alternatives = exercises.filter(
                          (e) =>
                            e.muscleGroup === entry.muscleGroup &&
                            !entry.exerciseIds.includes(e.id)
                        );
                        return (
                          <div key={exId}>
                            <div className="flex items-center justify-between gap-2 rounded-md bg-base-800/60 px-2.5 py-1.5">
                              <span className="text-[12.5px] text-base-100">
                                {exerciseName(exId)}{" "}
                                <span className="text-base-500">
                                  · {entry.setsPerExercise} sets
                                </span>
                              </span>
                              <button
                                onClick={() => setSwapKey(swapKey === key ? null : key)}
                                className="rounded-md p-1 text-base-500 hover:bg-base-700 hover:text-accent-400"
                                aria-label="Swap exercise"
                              >
                                <ArrowLeftRight size={13} />
                              </button>
                            </div>

                            {swapKey === key && (
                              <div className="mt-1 rounded-md border border-base-700/60 bg-base-900/60 p-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-[11px] font-medium text-base-400">
                                    Swap for:
                                  </p>
                                  <button
                                    onClick={() => setSwapKey(null)}
                                    className="text-base-500 hover:text-base-100"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                                {alternatives.length === 0 ? (
                                  <p className="mt-1 text-[11.5px] text-base-500">
                                    No other {muscleGroupLabel(entry.muscleGroup).toLowerCase()}{" "}
                                    exercises in your library yet.
                                  </p>
                                ) : (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {alternatives.map((alt) => (
                                      <button
                                        key={alt.id}
                                        onClick={() => {
                                          swapPlanExercise(
                                            plan.id,
                                            day,
                                            entry.muscleGroup as MuscleGroupId,
                                            exId,
                                            alt.id
                                          );
                                          setSwapKey(null);
                                        }}
                                        className="rounded-full border border-base-700 px-2 py-1 text-[11.5px] text-base-100 hover:border-accent-400/50 hover:bg-accent-400/10"
                                      >
                                        {alt.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
