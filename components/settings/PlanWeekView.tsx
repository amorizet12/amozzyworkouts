"use client";

import { useState } from "react";
import { addDays, format, formatISO, parseISO } from "date-fns";
import { ArrowLeftRight, ChevronDown, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Exercise, MuscleGroupId, Plan } from "@/lib/types";
import { muscleGroupColor, muscleGroupLabel } from "@/lib/muscleGroups";

const PREVIEW_DAYS = 28;
const DAYS_PER_WEEK = 7;

interface PlanWeekViewProps {
  plan: Plan;
  exercises: Exercise[];
}

export default function PlanWeekView({ plan, exercises }: PlanWeekViewProps) {
  const [swapKey, setSwapKey] = useState<string | null>(null);
  const swapDayExercise = useStore((s) => s.swapDayExercise);

  const exerciseName = (id: string) => exercises.find((e) => e.id === id)?.name ?? "Unknown";
  const start = parseISO(plan.startDate);
  const daysToShow = Math.min(plan.daySequence.length, PREVIEW_DAYS);
  const weekCount = Math.ceil(daysToShow / DAYS_PER_WEEK);

  const [openWeeks, setOpenWeeks] = useState<Set<number>>(() => new Set([0]));

  const toggleWeek = (week: number) => {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  const allOpen = openWeeks.size === weekCount;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-base-500">
          {weekCount} week{weekCount === 1 ? "" : "s"} shown
        </p>
        <button
          onClick={() =>
            setOpenWeeks(allOpen ? new Set() : new Set(Array.from({ length: weekCount }, (_, i) => i)))
          }
          className="text-[11.5px] font-medium text-accent-400 hover:text-accent-300"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {Array.from({ length: weekCount }, (_, week) => {
        const weekStart = addDays(start, week * DAYS_PER_WEEK);
        const weekEnd = addDays(start, Math.min((week + 1) * DAYS_PER_WEEK, daysToShow) - 1);
        const open = openWeeks.has(week);
        return (
          <div key={week} className="rounded-lg border border-base-700/60 overflow-hidden">
            <button
              onClick={() => toggleWeek(week)}
              className="flex w-full items-center justify-between bg-base-800/40 px-3 py-2"
            >
              <span className="text-[12.5px] font-semibold text-base-100">
                Week {week + 1}
                <span className="ml-1.5 font-normal text-base-500">
                  {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")}
                </span>
              </span>
              <ChevronDown
                size={15}
                className={`text-base-500 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div className="space-y-2 p-2">
                {Array.from(
                  { length: Math.min(DAYS_PER_WEEK, daysToShow - week * DAYS_PER_WEEK) },
                  (_, i) => week * DAYS_PER_WEEK + i
                ).map((day) => (
                  <PlanDayCard
                    key={day}
                    day={day}
                    date={addDays(start, day)}
                    entries={plan.daySequence[day] ?? []}
                    exercises={exercises}
                    exerciseName={exerciseName}
                    swapKey={swapKey}
                    setSwapKey={setSwapKey}
                    onSwap={(dateISO, muscleGroup, oldExerciseId, newExerciseId) =>
                      swapDayExercise(plan.id, dateISO, muscleGroup, oldExerciseId, newExerciseId)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {plan.daySequence.length > daysToShow && (
        <p className="text-center text-[11.5px] text-base-500">
          Showing the first {daysToShow} days · the pattern keeps repeating for the rest of the
          plan
        </p>
      )}
    </div>
  );
}

function PlanDayCard({
  date,
  entries,
  exercises,
  exerciseName,
  swapKey,
  setSwapKey,
  onSwap,
}: {
  day: number;
  date: Date;
  entries: Plan["daySequence"][number];
  exercises: Exercise[];
  exerciseName: (id: string) => string;
  swapKey: string | null;
  setSwapKey: (key: string | null) => void;
  onSwap: (
    dateISO: string,
    muscleGroup: MuscleGroupId,
    oldExerciseId: string,
    newExerciseId: string
  ) => void;
}) {
  const dateISO = formatISO(date, { representation: "date" });
  return (
    <div className="rounded-lg border border-base-700/60 p-3">
      <p className="text-[11.5px] font-semibold uppercase tracking-wide text-base-400">
        {format(date, "EEEE, MMM d")}
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
                        const key = `${dateISO}-${entry.muscleGroup}-${exId}`;
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
                                          onSwap(
                                            dateISO,
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
}
