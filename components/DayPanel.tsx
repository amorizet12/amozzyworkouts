"use client";

import { useMemo, useState } from "react";
import { format, formatISO, isToday, parseISO } from "date-fns";
import { CalendarClock, Plus, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Exercise, MuscleGroupId } from "@/lib/types";
import { MUSCLE_GROUPS, muscleGroupColor, muscleGroupLabel } from "@/lib/muscleGroups";
import { getLastPerformance } from "@/lib/history";
import { RPE_SCALE } from "@/lib/strength";

interface DayPanelProps {
  dateISO: string;
}

export default function DayPanel({ dateISO }: DayPanelProps) {
  const exercises = useStore((s) => s.exercises);
  const logs = useStore((s) => s.logs);
  const activePlanId = useStore((s) => s.activePlanId);
  const plans = useStore((s) => s.plans);
  const weightUnit = useStore((s) => s.weightUnit);
  const pushDay = useStore((s) => s.pushDay);

  const activePlan = plans.find((p) => p.id === activePlanId) ?? null;
  const scheduled = activePlan?.schedule[dateISO];
  const isTodayView = isToday(parseISO(dateISO));

  const scheduledExerciseIds = useMemo(
    () => new Set(scheduled?.exercises.map((e) => e.exerciseId) ?? []),
    [scheduled]
  );

  const groupedScheduled = useMemo(() => {
    if (!scheduled) return [];
    return scheduled.muscleGroups.map((mg) => ({
      muscleGroup: mg,
      exercises: scheduled.exercises
        .filter((se) => se.muscleGroup === mg)
        .map((se) => ({
          exercise: exercises.find((e) => e.id === se.exerciseId),
          targetSets: se.targetSets,
        }))
        .filter((e): e is { exercise: Exercise; targetSets: number } => Boolean(e.exercise)),
    }));
  }, [scheduled, exercises]);

  const loggedExtraIds = Array.from(
    new Set((logs[dateISO] ?? []).map((s) => s.exerciseId))
  ).filter((id) => !scheduledExerciseIds.has(id));

  const [manualExtraIds, setManualExtraIds] = useState<string[]>([]);

  const extraExerciseIds = Array.from(new Set([...loggedExtraIds, ...manualExtraIds]));
  const extraExercises = exercises.filter((e) => extraExerciseIds.includes(e.id));

  const dateLabel = isTodayView
    ? `Today · ${format(parseISO(dateISO), "EEEE, MMM d")}`
    : format(parseISO(dateISO), "EEEE, MMMM d");

  return (
    <div className="mt-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-base-100">{dateLabel}</h3>
        {scheduled && (
          <div className="flex gap-1.5">
            {scheduled.muscleGroups.map((mg) => (
              <span
                key={mg}
                className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{
                  backgroundColor: `${muscleGroupColor(mg)}22`,
                  color: muscleGroupColor(mg),
                }}
              >
                {muscleGroupLabel(mg)}
              </span>
            ))}
          </div>
        )}
      </div>

      {isTodayView && scheduled && activePlanId && (
        <button
          onClick={() => pushDay(activePlanId, dateISO)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-base-700 py-2 text-[12.5px] font-medium text-base-400 hover:border-accent-400/40 hover:text-accent-400"
        >
          <CalendarClock size={14} />
          Push today — I can't work out, use a rest day instead
        </button>
      )}

      {!activePlan && (
        <EmptyState message="No active plan yet. Head to Settings → Workout Plan to build one." />
      )}

      {activePlan && !scheduled && extraExercises.length === 0 && (
        <EmptyState message="Rest day. No scheduled muscle groups — but you can still log a lift below." />
      )}

      {groupedScheduled.map(
        (group) =>
          group.exercises.length > 0 && (
            <div key={group.muscleGroup} className="space-y-2">
              {group.exercises.map(({ exercise, targetSets }) => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  dateISO={dateISO}
                  weightUnit={weightUnit}
                  targetSets={targetSets}
                />
              ))}
            </div>
          )
      )}

      {extraExercises.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-base-500">
            Also logged today
          </p>
          {extraExercises.map((ex) => (
            <ExerciseRow key={ex.id} exercise={ex} dateISO={dateISO} weightUnit={weightUnit} />
          ))}
        </div>
      )}

      <AddExtraExercise
        exercises={exercises}
        excludeIds={new Set([...scheduledExerciseIds, ...extraExerciseIds])}
        onAdd={(id) => setManualExtraIds((prev) => [...prev, id])}
      />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-base-700 px-4 py-6 text-center text-[13px] text-base-400">
      {message}
    </div>
  );
}

function ExerciseRow({
  exercise,
  dateISO,
  weightUnit,
  targetSets,
}: {
  exercise: Exercise;
  dateISO: string;
  weightUnit: "lbs" | "kg";
  targetSets?: number;
}) {
  const logs = useStore((s) => s.logs);
  const logSet = useStore((s) => s.logSet);
  const deleteSet = useStore((s) => s.deleteSet);

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("8");

  const todaySets = (logs[dateISO] ?? []).filter((s) => s.exerciseId === exercise.id);
  const last = getLastPerformance(logs, exercise.id, dateISO);

  const handleAdd = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (Number.isNaN(w) || Number.isNaN(r) || w < 0 || r <= 0) return;
    const rpeValue = rpe === "" ? undefined : parseFloat(rpe);
    logSet(dateISO, exercise.id, w, r, rpeValue);
    setReps("");
  };

  return (
    <div className="rounded-xl border border-base-700/60 bg-base-900/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[13.5px] font-medium text-base-100">
            {exercise.name}
            {targetSets != null && (
              <span className="ml-1.5 text-[11px] font-normal text-base-500">
                target: {targetSets} sets
              </span>
            )}
          </p>
          {last && (
            <p className="text-[11.5px] text-base-500">
              Last: {last.sets.map((s) => `${s.weight}${weightUnit}×${s.reps}`).join(", ")}
            </p>
          )}
        </div>
      </div>

      {todaySets.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {todaySets.map((s) => (
            <span
              key={s.id}
              className="group flex items-center gap-1 rounded-full bg-accent-400/12 px-2 py-0.5 text-[11.5px] font-medium text-accent-400"
            >
              {s.weight}
              {weightUnit}×{s.reps}
              {s.rpe != null && <span className="text-accent-400/70">RPE {s.rpe}</span>}
              <button
                onClick={() => deleteSet(dateISO, s.id)}
                className="text-accent-400/50 hover:text-accent-400"
                aria-label="Delete set"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center gap-1.5">
        <input
          type="number"
          inputMode="decimal"
          placeholder={weightUnit}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-16 rounded-lg border border-base-700 bg-base-950 px-2 py-1.5 text-[13px] text-base-100 outline-none focus:border-accent-400/60"
        />
        <span className="text-base-600">×</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder="reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="w-16 rounded-lg border border-base-700 bg-base-950 px-2 py-1.5 text-[13px] text-base-100 outline-none focus:border-accent-400/60"
        />
        <button
          onClick={handleAdd}
          className="ml-auto flex items-center gap-1 rounded-lg bg-accent-400 px-2.5 py-1.5 text-[12px] font-semibold text-base-950 hover:bg-accent-300"
        >
          <Plus size={13} strokeWidth={2.5} />
          Set
        </button>
      </div>
      <select
        value={rpe}
        onChange={(e) => setRpe(e.target.value)}
        title="RPE — how hard was this set? (optional)"
        className="mt-1.5 w-full rounded-lg border border-base-700 bg-base-950 px-2 py-1.5 text-[12px] text-base-100 outline-none focus:border-accent-400/60"
      >
        <option value="">Effort (RPE) — not recorded</option>
        {RPE_SCALE.map(({ value, label }) => (
          <option key={value} value={value}>
            {value} - {label}
          </option>
        ))}
      </select>
    </div>
  );
}

function AddExtraExercise({
  exercises,
  excludeIds,
  onAdd,
}: {
  exercises: Exercise[];
  excludeIds: Set<string>;
  onAdd: (exerciseId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupId>(MUSCLE_GROUPS[0].id);

  const available = exercises.filter((e) => e.muscleGroup === muscleGroup && !excludeIds.has(e.id));

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-base-700 py-2.5 text-[13px] font-medium text-base-400 hover:border-accent-400/40 hover:text-accent-400"
      >
        <Plus size={14} />
        Log a lift
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-base-700/60 bg-base-900/40 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium text-base-400">Add an exercise for today</p>
        <button onClick={() => setOpen(false)} className="text-base-500 hover:text-base-100">
          <X size={14} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
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
        {available.length === 0 && (
          <p className="text-[12px] text-base-500">No more exercises in this group.</p>
        )}
        {available.map((ex) => (
          <button
            key={ex.id}
            onClick={() => {
              onAdd(ex.id);
              setOpen(false);
            }}
            className="rounded-lg border border-base-700 px-2.5 py-1.5 text-[12.5px] text-base-100 hover:border-accent-400/50 hover:bg-accent-400/10"
          >
            {ex.name}
          </button>
        ))}
      </div>
    </div>
  );
}
