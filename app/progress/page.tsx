"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { MUSCLE_GROUPS, muscleGroupColor } from "@/lib/muscleGroups";
import { MuscleGroupId } from "@/lib/types";
import { getExerciseProgress } from "@/lib/progress";
import ProgressChart from "@/components/ProgressChart";

type Metric = "e1rm" | "volume";

export default function ProgressPage() {
  const hydrated = useStore((s) => s.hydrated);
  const exercises = useStore((s) => s.exercises);
  const logs = useStore((s) => s.logs);
  const weightUnit = useStore((s) => s.weightUnit);

  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupId>(MUSCLE_GROUPS[0].id);
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>("e1rm");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!hydrated || initialized) return;
    let bestId: string | null = null;
    let bestCount = 0;
    for (const ex of exercises) {
      const count = getExerciseProgress(logs, ex.id).length;
      if (count > bestCount) {
        bestCount = count;
        bestId = ex.id;
      }
    }
    if (bestId) {
      const ex = exercises.find((e) => e.id === bestId)!;
      setMuscleGroup(ex.muscleGroup);
      setExerciseId(bestId);
    }
    setInitialized(true);
  }, [hydrated, initialized, exercises, logs]);

  const groupExercises = exercises.filter((e) => e.muscleGroup === muscleGroup);
  const selectedExercise = exercises.find((e) => e.id === exerciseId) ?? null;

  const progress = useMemo(
    () => (exerciseId ? getExerciseProgress(logs, exerciseId) : []),
    [logs, exerciseId]
  );

  const chartPoints = useMemo(
    () => progress.map((p) => ({ date: p.date, value: metric === "e1rm" ? p.e1rm : p.volume })),
    [progress, metric]
  );

  const bestE1rm = progress.length > 0 ? Math.max(...progress.map((p) => p.e1rm)) : null;
  const firstPoint = progress[0];
  const delta =
    bestE1rm != null && firstPoint && progress.length > 1
      ? bestE1rm - firstPoint.e1rm
      : null;

  if (!hydrated) {
    return <div className="pt-20 text-center text-[13px] text-base-500">Loading…</div>;
  }

  return (
    <div>
      <h1 className="mb-4 text-[17px] font-semibold text-base-100">Progress</h1>

      <div className="flex flex-wrap gap-1">
        {MUSCLE_GROUPS.map((mg) => (
          <button
            key={mg.id}
            onClick={() => setMuscleGroup(mg.id)}
            className={[
              "rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors",
              muscleGroup === mg.id
                ? "bg-accent-400 text-base-950"
                : "bg-base-800 text-base-400 hover:text-base-100",
            ].join(" ")}
          >
            {mg.label}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {groupExercises.length === 0 && (
          <p className="text-[12.5px] text-base-500">No exercises in this group yet.</p>
        )}
        {groupExercises.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setExerciseId(ex.id)}
            className={[
              "rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors",
              exerciseId === ex.id
                ? "bg-accent-400 text-base-950"
                : "bg-base-800 text-base-400 hover:text-base-100",
            ].join(" ")}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {selectedExercise && (
        <div className="mt-4 rounded-2xl border border-base-700/60 bg-base-900/60 p-4">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[14px] font-semibold text-base-100">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: muscleGroupColor(selectedExercise.muscleGroup) }}
                />
                {selectedExercise.name}
              </p>
              {bestE1rm != null && (
                <p className="mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[12px] text-base-500">
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} className="text-accent-400" />
                    Est. 1RM: {Math.round(bestE1rm)}
                    {weightUnit}
                  </span>
                  {delta != null && delta > 0 && (
                    <span className="text-accent-400">
                      +{Math.round(delta)}
                      {weightUnit} since {format(parseISO(firstPoint.date), "MMM d")}
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="flex shrink-0 gap-1 rounded-full bg-base-800 p-0.5">
              {(["e1rm", "volume"] as Metric[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={[
                    "whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                    metric === m
                      ? "bg-accent-400 text-base-950"
                      : "text-base-400 hover:text-base-100",
                  ].join(" ")}
                >
                  {m === "e1rm" ? "Est. 1RM" : "Volume"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <ProgressChart points={chartPoints} unit={metric === "e1rm" ? weightUnit : ""} />
          </div>

          {progress.length === 1 && (
            <p className="mt-2 text-center text-[11.5px] text-base-500">
              Log another session for this exercise to start seeing a trend.
            </p>
          )}
        </div>
      )}

      {!selectedExercise && (
        <div className="mt-4 rounded-xl border border-dashed border-base-700 px-4 py-6 text-center text-[13px] text-base-400">
          Pick a muscle group and exercise above to see your progress.
        </div>
      )}
    </div>
  );
}
