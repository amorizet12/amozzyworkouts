"use client";

import { useMemo, useState } from "react";
import { format, formatISO, parseISO } from "date-fns";
import { Dumbbell, Layers, Trash2, Wrench } from "lucide-react";
import { useStore } from "@/lib/store";
import { DaySlot, SplitStyle } from "@/lib/types";
import { buildCycleFromWorkoutDays } from "@/lib/schedule";
import { SPLIT_PRESET_TYPES } from "@/lib/splitPresets";
import PlanWeekView from "./PlanWeekView";
import SplitPresetConfig from "./SplitPresetConfig";
import CustomSplitConfig from "./CustomSplitConfig";
import { GroupSelections, groupSelectionsToDaySlot } from "./planBuilderTypes";

const SPLIT_OPTIONS: { id: SplitStyle; label: string; description: string; icon: typeof Dumbbell }[] = [
  { id: "ppl", label: "Push / Pull / Legs", description: "Classic 3-way rotation", icon: Dumbbell },
  { id: "upper_lower", label: "Upper / Lower", description: "2-way rotation", icon: Layers },
  { id: "custom", label: "Build your own", description: "Day-by-day, your call", icon: Wrench },
];

export default function PlanBuilder() {
  const plans = useStore((s) => s.plans);
  const activePlanId = useStore((s) => s.activePlanId);
  const exercises = useStore((s) => s.exercises);
  const createPlan = useStore((s) => s.createPlan);
  const deletePlan = useStore((s) => s.deletePlan);
  const setActivePlan = useStore((s) => s.setActivePlan);

  const activePlan = plans.find((p) => p.id === activePlanId) ?? null;
  const otherPlans = plans.filter((p) => p.id !== activePlanId);

  const [showBuilder, setShowBuilder] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(() => formatISO(new Date(), { representation: "date" }));
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [splitStyle, setSplitStyle] = useState<SplitStyle | null>(null);
  const [restDaysPerCycle, setRestDaysPerCycle] = useState(2);
  const [presetSelections, setPresetSelections] = useState<GroupSelections>({});
  const [customSlots, setCustomSlots] = useState<GroupSelections[]>([{}]);

  const resetForm = () => {
    setName("");
    setSplitStyle(null);
    setRestDaysPerCycle(2);
    setPresetSelections({});
    setCustomSlots([{}]);
  };

  const baseCycle: DaySlot[] = useMemo(() => {
    if (splitStyle === "ppl" || splitStyle === "upper_lower") {
      const types = SPLIT_PRESET_TYPES[splitStyle];
      const workoutDays = types.map((type) =>
        type.muscleGroups
          .map((mg) => ({
            muscleGroup: mg,
            exerciseIds: presetSelections[mg]?.exerciseIds ?? [],
            setsPerExercise: presetSelections[mg]?.setsPerExercise ?? 3,
          }))
          .filter((e) => e.exerciseIds.length > 0)
      );
      return buildCycleFromWorkoutDays(workoutDays, restDaysPerCycle);
    }
    if (splitStyle === "custom") {
      return customSlots.map(groupSelectionsToDaySlot);
    }
    return [];
  }, [splitStyle, presetSelections, restDaysPerCycle, customSlots]);

  const hasAnyExercise = baseCycle.some((slot) => slot.length > 0);

  const customHasIncompleteGroup = customSlots.some((slot) =>
    Object.values(slot).some((v) => v.exerciseIds.length === 0)
  );

  const canCreate = splitStyle != null && hasAnyExercise && !(splitStyle === "custom" && customHasIncompleteGroup);

  const handleCreate = () => {
    if (!canCreate || !splitStyle) return;
    createPlan({ name, startDate, durationWeeks, splitStyle, restDaysPerCycle, baseCycle });
    resetForm();
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
              onClick={() => {
                resetForm();
                setShowBuilder(false);
              }}
              className="text-[12px] font-medium text-base-500 hover:text-base-100"
            >
              Cancel
            </button>
          </div>

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

          <p className="mt-4 mb-1.5 text-[11.5px] font-medium text-base-400">Workout split</p>
          <div className="grid grid-cols-3 gap-1.5">
            {SPLIT_OPTIONS.map(({ id, label, description, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSplitStyle(id)}
                className={[
                  "flex flex-col items-center gap-1 rounded-lg border p-2.5 text-center transition-colors",
                  splitStyle === id
                    ? "border-accent-400/60 bg-accent-400/10"
                    : "border-base-700/60 hover:border-base-600",
                ].join(" ")}
              >
                <Icon
                  size={16}
                  className={splitStyle === id ? "text-accent-400" : "text-base-400"}
                />
                <span className="text-[11.5px] font-medium text-base-100">{label}</span>
                <span className="text-[10px] text-base-500">{description}</span>
              </button>
            ))}
          </div>

          {(splitStyle === "ppl" || splitStyle === "upper_lower") && (
            <div className="mt-4">
              <SplitPresetConfig
                splitType={splitStyle}
                restDaysPerCycle={restDaysPerCycle}
                onRestDaysChange={(delta) =>
                  setRestDaysPerCycle((n) => Math.min(6, Math.max(0, n + delta)))
                }
                selections={presetSelections}
                onSelectionsChange={(updater) => setPresetSelections(updater)}
                exercises={exercises}
              />
            </div>
          )}

          {splitStyle === "custom" && (
            <div className="mt-4">
              <CustomSplitConfig slots={customSlots} onChange={setCustomSlots} exercises={exercises} />
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className="mt-4 w-full rounded-lg bg-accent-400 py-2.5 text-[13px] font-semibold text-base-950 hover:bg-accent-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create &amp; activate plan
          </button>
          {splitStyle == null && (
            <p className="mt-2 text-center text-[11.5px] text-base-500">
              Pick a workout split above to continue.
            </p>
          )}
          {splitStyle != null && !hasAnyExercise && (
            <p className="mt-2 text-center text-[11.5px] text-base-500">
              Pick at least one exercise somewhere in the split to create a plan.
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
