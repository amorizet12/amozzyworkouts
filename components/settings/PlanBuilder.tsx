"use client";

import { useMemo, useState } from "react";
import { format, formatISO, parseISO } from "date-fns";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { MUSCLE_GROUPS } from "@/lib/muscleGroups";
import { MuscleGroupId, PlanTarget } from "@/lib/types";
import PlanWeekView from "./PlanWeekView";

type TargetState = Record<
  MuscleGroupId,
  { timesPerWeek: number; exerciseIds: string[]; setsPerExercise: number }
>;

function emptyTargets(): TargetState {
  return Object.fromEntries(
    MUSCLE_GROUPS.map((mg) => [
      mg.id,
      { timesPerWeek: 0, exerciseIds: [] as string[], setsPerExercise: 3 },
    ])
  ) as unknown as TargetState;
}

export default function PlanBuilder() {
  const plans = useStore((s) => s.plans);
  const activePlanId = useStore((s) => s.activePlanId);
  const exercises = useStore((s) => s.exercises);
  const createPlan = useStore((s) => s.createPlan);
  const deletePlan = useStore((s) => s.deletePlan);
  const setActivePlan = useStore((s) => s.setActivePlan);

  const activePlan = plans.find((p) => p.id === activePlanId) ?? null;
  const otherPlans = plans.filter((p) => p.id !== activePlanId);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(() => formatISO(new Date(), { representation: "date" }));
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [targets, setTargets] = useState<TargetState>(emptyTargets);
  const [showBuilder, setShowBuilder] = useState(false);

  const totalSessions = useMemo(
    () => Object.values(targets).reduce((sum, t) => sum + t.timesPerWeek, 0),
    [targets]
  );

  const invalidGroups = useMemo(
    () =>
      MUSCLE_GROUPS.filter(
        (mg) => targets[mg.id].timesPerWeek > 0 && targets[mg.id].exerciseIds.length === 0
      ).map((mg) => mg.label),
    [targets]
  );

  const updateFrequency = (mg: MuscleGroupId, delta: number) => {
    setTargets((prev) => ({
      ...prev,
      [mg]: { ...prev[mg], timesPerWeek: Math.min(7, Math.max(0, prev[mg].timesPerWeek + delta)) },
    }));
  };

  const updateSets = (mg: MuscleGroupId, delta: number) => {
    setTargets((prev) => ({
      ...prev,
      [mg]: {
        ...prev[mg],
        setsPerExercise: Math.min(10, Math.max(1, prev[mg].setsPerExercise + delta)),
      },
    }));
  };

  const toggleExercise = (mg: MuscleGroupId, exerciseId: string) => {
    setTargets((prev) => {
      const has = prev[mg].exerciseIds.includes(exerciseId);
      return {
        ...prev,
        [mg]: {
          ...prev[mg],
          exerciseIds: has
            ? prev[mg].exerciseIds.filter((id) => id !== exerciseId)
            : [...prev[mg].exerciseIds, exerciseId],
        },
      };
    });
  };

  const canCreate = totalSessions > 0 && invalidGroups.length === 0;

  const handleCreate = () => {
    if (!canCreate) return;

    const planTargets: PlanTarget[] = MUSCLE_GROUPS.map((mg) => ({
      muscleGroup: mg.id,
      timesPerWeek: targets[mg.id].timesPerWeek,
      exerciseIds: targets[mg.id].exerciseIds,
      setsPerExercise: targets[mg.id].setsPerExercise,
    })).filter((t) => t.timesPerWeek > 0 && t.exerciseIds.length > 0);

    createPlan({ name, startDate, durationWeeks, targets: planTargets });
    setName("");
    setTargets(emptyTargets());
    setShowBuilder(false);
  };

  return (
    <div className="space-y-5">
      {activePlan && (
        <div className="rounded-xl border border-accent-400/30 bg-accent-400/[0.06] p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-accent-400">
                Active plan
              </p>
              <p className="mt-0.5 text-[14px] font-semibold text-base-100">{activePlan.name}</p>
              <p className="text-[12px] text-base-400">
                {format(parseISO(activePlan.startDate), "MMM d, yyyy")} · {activePlan.durationWeeks}{" "}
                weeks
              </p>
            </div>
            <button
              onClick={() => setActivePlan(null)}
              className="rounded-lg bg-base-800 px-2.5 py-1.5 text-[12px] font-medium text-base-300 hover:bg-base-700"
            >
              End plan
            </button>
          </div>

          <div className="mt-4">
            <PlanWeekView plan={activePlan} exercises={exercises} />
          </div>
        </div>
      )}

      {!showBuilder && (
        <button
          onClick={() => setShowBuilder(true)}
          className="w-full rounded-xl border border-dashed border-base-700 py-2.5 text-[13px] font-medium text-base-400 hover:border-accent-400/40 hover:text-accent-400"
        >
          {activePlan ? "Build a new plan" : "+ Build your first plan"}
        </button>
      )}

      {showBuilder && (
        <div className="rounded-xl border border-base-700/60 bg-base-900/40 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[13.5px] font-semibold text-base-100">Build a new plan</p>
            <button
              onClick={() => setShowBuilder(false)}
              className="text-[12px] font-medium text-base-500 hover:text-base-100"
            >
              Cancel
            </button>
          </div>
          <p className="mt-0.5 text-[12px] text-base-500">
            For each muscle group, pick sessions per week, the exercises, and sets per exercise
            per session. Creating a plan makes it your active one.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <label className="col-span-2 flex flex-col gap-1">
              <span className="text-[11.5px] font-medium text-base-400">Plan name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fall Strength Block"
                className="rounded-lg border border-base-700 bg-base-950 px-2.5 py-1.5 text-[13px] text-base-100 outline-none focus:border-accent-400/60"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11.5px] font-medium text-base-400">Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-base-700 bg-base-950 px-2.5 py-1.5 text-[13px] text-base-100 outline-none focus:border-accent-400/60"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11.5px] font-medium text-base-400">Duration (weeks)</span>
              <input
                type="number"
                min={1}
                max={52}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value, 10) || 1)}
                className="rounded-lg border border-base-700 bg-base-950 px-2.5 py-1.5 text-[13px] text-base-100 outline-none focus:border-accent-400/60"
              />
            </label>
          </div>

          <div className="mt-4 space-y-2">
            {MUSCLE_GROUPS.map((mg) => {
              const state = targets[mg.id];
              const groupExercises = exercises.filter((e) => e.muscleGroup === mg.id);
              const isInvalid = state.timesPerWeek > 0 && state.exerciseIds.length === 0;
              return (
                <div
                  key={mg.id}
                  className={[
                    "rounded-lg border p-2.5",
                    isInvalid ? "border-red-500/40" : "border-base-700/60",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: mg.color }} />
                      <span className="text-[13px] font-medium text-base-100">{mg.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10.5px] text-base-500">sessions/wk</span>
                        <button
                          onClick={() => updateFrequency(mg.id, -1)}
                          className="rounded-md bg-base-800 p-1 text-base-300 hover:bg-base-700"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-4 text-center text-[12.5px] text-base-200">
                          {state.timesPerWeek}
                        </span>
                        <button
                          onClick={() => updateFrequency(mg.id, 1)}
                          className="rounded-md bg-base-800 p-1 text-base-300 hover:bg-base-700"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      {state.timesPerWeek > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10.5px] text-base-500">sets/ex</span>
                          <button
                            onClick={() => updateSets(mg.id, -1)}
                            className="rounded-md bg-base-800 p-1 text-base-300 hover:bg-base-700"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-4 text-center text-[12.5px] text-base-200">
                            {state.setsPerExercise}
                          </span>
                          <button
                            onClick={() => updateSets(mg.id, 1)}
                            className="rounded-md bg-base-800 p-1 text-base-300 hover:bg-base-700"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {state.timesPerWeek > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {groupExercises.length === 0 && (
                        <p className="text-[11.5px] text-base-500">
                          No exercises in this group yet — add some in the Exercises tab.
                        </p>
                      )}
                      {groupExercises.map((ex) => {
                        const selected = state.exerciseIds.includes(ex.id);
                        return (
                          <button
                            key={ex.id}
                            onClick={() => toggleExercise(mg.id, ex.id)}
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
                  )}
                  {isInvalid && (
                    <p className="mt-1.5 text-[11px] text-red-400">
                      Pick at least one exercise for {mg.label.toLowerCase()}.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className="mt-4 w-full rounded-lg bg-accent-400 py-2.5 text-[13px] font-semibold text-base-950 hover:bg-accent-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create &amp; activate plan
          </button>
          {totalSessions === 0 && (
            <p className="mt-2 text-center text-[11.5px] text-base-500">
              Set at least one muscle group's sessions per week above to create a plan.
            </p>
          )}
        </div>
      )}

      {otherPlans.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-base-500">
            Other plans
          </p>
          {otherPlans.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-base-800/60 px-3 py-2"
            >
              <div>
                <p className="text-[13px] text-base-100">{p.name}</p>
                <p className="text-[11px] text-base-500">{p.durationWeeks} weeks</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActivePlan(p.id)}
                  className="rounded-md bg-base-700 px-2 py-1 text-[11.5px] font-medium text-base-100 hover:bg-base-600"
                >
                  Activate
                </button>
                <button
                  onClick={() => deletePlan(p.id)}
                  className="rounded-md p-1.5 text-base-500 hover:bg-red-500/15 hover:text-red-400"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
