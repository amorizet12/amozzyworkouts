"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { HelpCircle, Scale, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { MUSCLE_GROUPS, muscleGroupColor } from "@/lib/muscleGroups";
import { MuscleGroupId } from "@/lib/types";
import { getBodyweightProgress, getExerciseProgress } from "@/lib/progress";
import { DOTS_EXPLANATION, dotsApplicable, dotsLiftWeight, dotsScore, toKg } from "@/lib/strength";
import ProgressChart from "@/components/ProgressChart";

type Metric = "e1rm" | "volume";
type View = "exercises" | "bodyweight";

export default function ProgressPage() {
  const hydrated = useStore((s) => s.hydrated);
  const exercises = useStore((s) => s.exercises);
  const logs = useStore((s) => s.logs);
  const weightUnit = useStore((s) => s.weightUnit);
  const profile = useStore((s) => s.profile);
  const bodyweightLogs = useStore((s) => s.bodyweightLogs);

  const [view, setView] = useState<View>("exercises");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupId>(MUSCLE_GROUPS[0].id);
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>("e1rm");
  const [initialized, setInitialized] = useState(false);
  const [showDotsInfo, setShowDotsInfo] = useState(false);

  const bodyweightProgress = useMemo(
    () => getBodyweightProgress(bodyweightLogs),
    [bodyweightLogs]
  );
  const bodyweightPoints = useMemo(
    () => bodyweightProgress.map((p) => ({ date: p.date, value: p.value })),
    [bodyweightProgress]
  );
  const latestBodyweight =
    bodyweightProgress.length > 0 ? bodyweightProgress[bodyweightProgress.length - 1] : null;
  const firstBodyweight = bodyweightProgress[0];
  const bodyweightDelta =
    latestBodyweight && firstBodyweight && bodyweightProgress.length > 1
      ? latestBodyweight.value - firstBodyweight.value
      : null;

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
  const isWeighted = selectedExercise
    ? selectedExercise.equipment === "barbell" || selectedExercise.equipment === "dumbbell"
    : true;
  const isDumbbell = selectedExercise?.equipment === "dumbbell";
  const isCardio = selectedExercise?.equipment === "cardio";

  const progress = useMemo(
    () => (exerciseId ? getExerciseProgress(logs, exerciseId) : []),
    [logs, exerciseId]
  );

  const chartPoints = useMemo(() => {
    if (!isWeighted) return progress.map((p) => ({ date: p.date, value: p.bestReps }));
    return progress.map((p) => ({ date: p.date, value: metric === "e1rm" ? p.e1rm : p.volume }));
  }, [progress, metric, isWeighted]);

  const bestE1rm = progress.length > 0 ? Math.max(...progress.map((p) => p.e1rm)) : null;
  const bestReps = progress.length > 0 ? Math.max(...progress.map((p) => p.bestReps)) : null;
  const firstPoint = progress[0];
  const delta =
    isWeighted && bestE1rm != null && firstPoint && progress.length > 1
      ? bestE1rm - firstPoint.e1rm
      : null;

  const dots =
    selectedExercise &&
    dotsApplicable(selectedExercise.equipment) &&
    bestE1rm != null &&
    profile.sex &&
    profile.bodyweight
      ? dotsScore(
          toKg(dotsLiftWeight(bestE1rm, selectedExercise.equipment), weightUnit),
          toKg(profile.bodyweight, weightUnit),
          profile.sex
        )
      : null;

  if (!hydrated) {
    return <div className="pt-20 text-center text-[13px] text-base-500">Loading…</div>;
  }

  return (
    <div>
      <h1 className="mb-4 text-[17px] font-semibold text-base-100">Progress</h1>

      <div className="mb-4 flex gap-1 rounded-full bg-base-900 p-1 ring-1 ring-base-700/60">
        {(["exercises", "bodyweight"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={[
              "flex-1 rounded-full py-1.5 text-[12.5px] font-medium transition-colors",
              view === v ? "bg-accent-400 text-base-950" : "text-base-400 hover:text-base-100",
            ].join(" ")}
          >
            {v === "exercises" ? "Exercises" : "Bodyweight"}
          </button>
        ))}
      </div>

      {view === "bodyweight" && (
        <div className="rounded-2xl border border-base-700/60 bg-base-900/60 p-4">
          <p className="flex items-center gap-1.5 text-[14px] font-semibold text-base-100">
            <Scale size={14} className="text-accent-400" />
            Bodyweight
          </p>
          {latestBodyweight != null && (
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[12px] text-base-500">
              <span className="flex items-center gap-1">
                <TrendingUp size={12} className="text-accent-400" />
                Latest: {latestBodyweight.value}
                {weightUnit}
              </span>
              {bodyweightDelta != null && bodyweightDelta !== 0 && (
                <span className={bodyweightDelta < 0 ? "text-accent-400" : "text-base-400"}>
                  {bodyweightDelta > 0 ? "+" : ""}
                  {Math.round(bodyweightDelta * 10) / 10}
                  {weightUnit} since {format(parseISO(firstBodyweight.date), "MMM d")}
                </span>
              )}
            </p>
          )}
          <div className="mt-4">
            <ProgressChart points={bodyweightPoints} unit={weightUnit} />
          </div>
          {bodyweightProgress.length === 0 && (
            <p className="mt-2 text-center text-[11.5px] text-base-500">
              Log your weight from the Home page to start seeing a trend.
            </p>
          )}
          {bodyweightProgress.length === 1 && (
            <p className="mt-2 text-center text-[11.5px] text-base-500">
              Log again another day to start seeing a trend.
            </p>
          )}
        </div>
      )}

      {view === "exercises" && (
        <>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-base-500">
        Muscle group
      </p>
      <div className="flex flex-wrap gap-1">
        {MUSCLE_GROUPS.map((mg) => (
          <button
            key={mg.id}
            onClick={() => {
              setMuscleGroup(mg.id);
              const first = exercises.find((e) => e.muscleGroup === mg.id);
              setExerciseId(first ? first.id : null);
            }}
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

      <div className="my-4 border-t border-base-700/60" />

      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-base-500">
        Exercise
      </p>
      <div className="flex flex-wrap gap-1.5">
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
              {isWeighted && bestE1rm != null && (
                <p className="mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[12px] text-base-500">
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} className="text-accent-400" />
                    Est. 1RM: {Math.round(bestE1rm)}
                    {weightUnit}
                    {isDumbbell && <span className="text-base-600">/arm</span>}
                  </span>
                  {delta != null && delta > 0 && (
                    <span className="text-accent-400">
                      +{Math.round(delta)}
                      {weightUnit} since {format(parseISO(firstPoint.date), "MMM d")}
                    </span>
                  )}
                </p>
              )}
              {!isWeighted && bestReps != null && (
                <p className="mt-0.5 flex items-center gap-1 text-[12px] text-base-500">
                  <TrendingUp size={12} className="text-accent-400" />
                  {isCardio ? `Longest session: ${bestReps} min` : `Best set: ${bestReps} reps`}
                </p>
              )}
              {dots != null && (
                <p className="mt-1 flex items-center gap-1 text-[12px] text-base-500">
                  DOTS: <span className="font-semibold text-base-200">{dots.toFixed(1)}</span>
                  <button
                    onClick={() => setShowDotsInfo((v) => !v)}
                    className="text-base-600 hover:text-accent-400"
                    aria-label="What is DOTS?"
                  >
                    <HelpCircle size={13} />
                  </button>
                </p>
              )}
              {showDotsInfo && dots != null && (
                <p className="mt-1 max-w-sm text-[11.5px] leading-snug text-base-500">
                  {DOTS_EXPLANATION}
                </p>
              )}
            </div>

            {isWeighted && (
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
            )}
          </div>

          <div className="mt-4">
            <ProgressChart
              points={chartPoints}
              unit={isWeighted ? (metric === "e1rm" ? weightUnit : "") : ""}
            />
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
        </>
      )}
    </div>
  );
}
