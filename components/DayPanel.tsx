"use client";

import { useEffect, useMemo, useState } from "react";
import { format, formatISO, isToday, parseISO } from "date-fns";
import {
  ArrowLeftRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  Flame,
  Pencil,
  Plus,
  Scale,
  StickyNote,
  Timer,
  Trash2,
  Undo2,
  Wind,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Exercise, LoggedSet, MuscleGroupId } from "@/lib/types";
import { MUSCLE_GROUPS, muscleGroupColor, muscleGroupLabel } from "@/lib/muscleGroups";
import { getLastPerformance } from "@/lib/history";
import { RPE_SCALE } from "@/lib/strength";

interface DayPanelProps {
  dateISO: string;
  showHeader?: boolean;
  /** Number each exercise in the order it's listed (e.g. "1. Bench Press"). */
  numbered?: boolean;
  /** When true, only past days allow logging new sets — today and future
   * days show the plan/history read-only. Used on the Calendar page, since
   * the Home page is the dedicated surface for logging today's workout. */
  restrictToPastLogging?: boolean;
  /** Show the logged/loggable bodyweight for this day. Off on the Home page,
   * which has its own dedicated bodyweight card above the panel. */
  showBodyweight?: boolean;
}

export default function DayPanel({
  dateISO,
  showHeader = true,
  numbered = false,
  restrictToPastLogging = false,
  showBodyweight = true,
}: DayPanelProps) {
  const exercises = useStore((s) => s.exercises);
  const logs = useStore((s) => s.logs);
  const activePlanId = useStore((s) => s.activePlanId);
  const plans = useStore((s) => s.plans);
  const weightUnit = useStore((s) => s.weightUnit);
  const pushDay = useStore((s) => s.pushDay);
  const undoPushDay = useStore((s) => s.undoPushDay);
  const completedDates = useStore((s) => s.completedDates);
  const completedAt = useStore((s) => s.completedAt);
  const toggleDayComplete = useStore((s) => s.toggleDayComplete);

  const activePlan = plans.find((p) => p.id === activePlanId) ?? null;
  const scheduled = activePlan?.schedule[dateISO];
  const isTodayView = isToday(parseISO(dateISO));
  const isCompleted = completedDates.includes(dateISO);
  const isPushedToday = activePlan?.pendingPush?.dateISO === dateISO;

  const todayISO = formatISO(new Date(), { representation: "date" });
  const isPastDay = dateISO < todayISO;
  // Today is normally read-only here (Home is the dedicated surface for logging
  // today's workout) — except when today has no scheduled workout (a rest day,
  // including one just created by "Push today"), since there's nothing to
  // accidentally double-log and the whole point of pushing is to still be able
  // to log whatever you actually did instead.
  const canLog = !restrictToPastLogging || isPastDay || (isTodayView && !scheduled);

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
          targetWarmupSets: se.targetWarmupSets,
        }))
        .filter(
          (e): e is { exercise: Exercise; targetSets: number; targetWarmupSets: number | undefined } =>
            Boolean(e.exercise)
        ),
    }));
  }, [scheduled, exercises]);

  const loggedExtraIds = Array.from(
    new Set((logs[dateISO] ?? []).map((s) => s.exerciseId))
  ).filter((id) => !scheduledExerciseIds.has(id));

  const [manualExtraIds, setManualExtraIds] = useState<string[]>([]);

  const extraExerciseIds = Array.from(new Set([...loggedExtraIds, ...manualExtraIds]));
  const extraExercises = exercises.filter((e) => extraExerciseIds.includes(e.id));

  const numberByExerciseId = useMemo(() => {
    const map = new Map<string, number>();
    if (!numbered) return map;
    let n = 0;
    groupedScheduled.forEach((group) => {
      group.exercises.forEach(({ exercise }) => {
        n += 1;
        map.set(exercise.id, n);
      });
    });
    extraExercises.forEach((ex) => {
      n += 1;
      map.set(ex.id, n);
    });
    return map;
  }, [numbered, groupedScheduled, extraExercises]);

  const dateLabel = isTodayView
    ? `Today · ${format(parseISO(dateISO), "EEEE, MMM d")}`
    : format(parseISO(dateISO), "EEEE, MMMM d");

  return (
    <div className="mt-4 space-y-4 animate-fade-in">
      {showHeader && (
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
      )}

      {scheduled && (
        <button
          onClick={() => toggleDayComplete(dateISO)}
          className={[
            "flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-semibold transition-colors",
            isCompleted
              ? "bg-accent-400 text-base-950 hover:bg-accent-300"
              : "border border-base-700 text-base-400 hover:border-accent-400/40 hover:text-accent-400",
          ].join(" ")}
        >
          {isCompleted ? <CheckCircle2 size={15} /> : <Circle size={15} />}
          {isCompleted
            ? completedAt[dateISO]
              ? `Workout complete · ${formatClockTime(completedAt[dateISO])}`
              : "Workout complete"
            : "Mark as complete"}
        </button>
      )}

      {isTodayView && activePlanId && !isCompleted && isPushedToday && (
        <button
          onClick={() => undoPushDay(activePlanId, dateISO)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-accent-400/40 py-2 text-[12.5px] font-medium text-accent-400 hover:border-accent-400/70"
        >
          <Undo2 size={14} />
          I plan on working out today — reset push day
        </button>
      )}

      {isTodayView && scheduled && activePlanId && !isCompleted && !isPushedToday && (
        <button
          onClick={() => pushDay(activePlanId, dateISO)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-base-700 py-2 text-[12.5px] font-medium text-base-400 hover:border-accent-400/40 hover:text-accent-400"
        >
          <CalendarClock size={14} />
          Push today — I can't work out, use a rest day instead
        </button>
      )}

      {showBodyweight && <DayBodyweightRow dateISO={dateISO} canLog={canLog} />}

      {!activePlan && (
        <EmptyState message="No active plan yet. Head to Settings → Workout Plan to build one." />
      )}

      {activePlan && !scheduled && extraExercises.length === 0 && (
        <EmptyState
          message={
            canLog
              ? "Rest day. No scheduled muscle groups — but you can still log an exercise below."
              : "Rest day. No scheduled muscle groups."
          }
        />
      )}

      {scheduled && <WarmupBlock dateISO={dateISO} />}

      {groupedScheduled.map(
        (group) =>
          group.exercises.length > 0 && (
            <div key={group.muscleGroup} className="space-y-2">
              {group.exercises.map(({ exercise, targetSets, targetWarmupSets }) => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  dateISO={dateISO}
                  weightUnit={weightUnit}
                  targetSets={targetSets}
                  targetWarmupSets={targetWarmupSets}
                  index={numberByExerciseId.get(exercise.id)}
                  canLog={canLog}
                  isTodayView={isTodayView}
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
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              dateISO={dateISO}
              weightUnit={weightUnit}
              index={numberByExerciseId.get(ex.id)}
              canLog={canLog}
              isTodayView={isTodayView}
              onRemove={
                canLog
                  ? () => setManualExtraIds((prev) => prev.filter((id) => id !== ex.id))
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {canLog && (
        <AddExtraExercise
          exercises={exercises}
          excludeIds={scheduledExerciseIds}
          onAdd={(id) => setManualExtraIds((prev) => [...prev, id])}
        />
      )}

      {scheduled && <CooldownBlock dateISO={dateISO} />}
    </div>
  );
}

function WarmupBlock({ dateISO }: { dateISO: string }) {
  const warmupCompletedDates = useStore((s) => s.warmupCompletedDates);
  const toggleWarmupComplete = useStore((s) => s.toggleWarmupComplete);
  const done = warmupCompletedDates.includes(dateISO);

  return (
    <button
      onClick={() => toggleWarmupComplete(dateISO)}
      className={[
        "flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors duration-300",
        done ? "border-accent-400/60 bg-accent-400/10" : "border-base-700/60 bg-base-900/40",
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5">
        <Flame size={16} className={done ? "text-accent-400" : "text-base-500"} />
        <div>
          <p className="text-[13px] font-medium text-base-100">Warm-up</p>
          <p className="text-[11px] text-base-500">5–10 min general + dynamic stretching</p>
        </div>
      </div>
      {done ? (
        <CheckCircle2 size={17} className="shrink-0 text-accent-400" />
      ) : (
        <Circle size={17} className="shrink-0 text-base-500" />
      )}
    </button>
  );
}

function CooldownBlock({ dateISO }: { dateISO: string }) {
  const cooldownCompletedDates = useStore((s) => s.cooldownCompletedDates);
  const toggleCooldownComplete = useStore((s) => s.toggleCooldownComplete);
  const done = cooldownCompletedDates.includes(dateISO);

  return (
    <button
      onClick={() => toggleCooldownComplete(dateISO)}
      className={[
        "flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors duration-300",
        done ? "border-accent-400/60 bg-accent-400/10" : "border-base-700/60 bg-base-900/40",
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5">
        <Wind size={16} className={done ? "text-accent-400" : "text-base-500"} />
        <div>
          <p className="text-[13px] font-medium text-base-100">Cool-down &amp; stretching</p>
          <p className="text-[11px] text-base-500">5–10 min static stretching to wind down</p>
        </div>
      </div>
      {done ? (
        <CheckCircle2 size={17} className="shrink-0 text-accent-400" />
      ) : (
        <Circle size={17} className="shrink-0 text-base-500" />
      )}
    </button>
  );
}

function DayBodyweightRow({ dateISO, canLog }: { dateISO: string; canLog: boolean }) {
  const weightUnit = useStore((s) => s.weightUnit);
  const bodyweightLogs = useStore((s) => s.bodyweightLogs);
  const logBodyweight = useStore((s) => s.logBodyweight);

  const loggedWeight = bodyweightLogs[dateISO];
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(loggedWeight != null ? String(loggedWeight) : "");

  if (loggedWeight == null && !canLog) return null;

  const handleSave = () => {
    const w = parseFloat(value);
    if (Number.isNaN(w) || w <= 0) return;
    logBodyweight(dateISO, w);
    setEditing(false);
  };

  if (!editing && loggedWeight != null) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-base-700/60 bg-base-900/40 px-3 py-2">
        <span className="flex items-center gap-1.5 text-[12.5px] text-base-100">
          <Scale size={13} className="text-accent-400" />
          Weight: <span className="font-semibold">{loggedWeight}{weightUnit}</span>
        </span>
        {canLog && (
          <button
            onClick={() => {
              setValue(String(loggedWeight));
              setEditing(true);
            }}
            className="flex items-center gap-1 text-[11.5px] font-medium text-accent-400 hover:text-accent-300"
          >
            <Pencil size={11} />
            Edit
          </button>
        )}
      </div>
    );
  }

  if (!canLog) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-base-700/60 bg-base-900/40 px-3 py-2">
      <Scale size={13} className="shrink-0 text-base-500" />
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        placeholder={`Log weight (${weightUnit})`}
        className="flex-1 rounded-lg border border-base-700 bg-base-950 px-2 py-1 text-[12.5px] text-base-100 outline-none focus:border-accent-400/60"
      />
      <button
        onClick={handleSave}
        className="rounded-lg bg-accent-400 px-2.5 py-1 text-[11.5px] font-semibold text-base-950 hover:bg-accent-300"
      >
        Log
      </button>
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

const COMMON_BAND_COLORS = ["Yellow", "Red", "Green", "Blue", "Black", "Purple", "Orange", "Gray"];

function formatClockTime(iso: string): string {
  return format(parseISO(iso), "h:mm:ss a");
}

function formatRestTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function ExerciseRow({
  exercise,
  dateISO,
  weightUnit,
  targetSets,
  targetWarmupSets,
  index,
  canLog = true,
  isTodayView = false,
  onRemove,
}: {
  exercise: Exercise;
  dateISO: string;
  weightUnit: "lbs" | "kg";
  targetSets?: number;
  targetWarmupSets?: number;
  index?: number;
  canLog?: boolean;
  isTodayView?: boolean;
  /** Only passed for manually-added "also logged today" exercises — removes
   * this exercise (and any sets logged for it today) from the day. */
  onRemove?: () => void;
}) {
  const logs = useStore((s) => s.logs);
  const logSet = useStore((s) => s.logSet);
  const deleteSet = useStore((s) => s.deleteSet);

  const needsWeight = exercise.equipment === "barbell" || exercise.equipment === "dumbbell";
  const needsBandColor = exercise.equipment === "band";
  const perLeg = exercise.equipment === "band" && exercise.perLeg;
  const isCardio = exercise.equipment === "cardio";
  const hasWarmupTarget = (targetWarmupSets ?? 0) > 0;

  const todaySets = (logs[dateISO] ?? []).filter((s) => s.exerciseId === exercise.id);
  const warmupLogged = todaySets.filter((s) => s.isWarmup);
  const workingLogged = todaySets.filter((s) => !s.isWarmup);
  const isComplete = targetSets != null && workingLogged.length >= targetSets;

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("8");
  const [bandColor, setBandColor] = useState("");
  const [setType, setSetType] = useState<"warmup" | "working">(() =>
    hasWarmupTarget && warmupLogged.length < (targetWarmupSets ?? 0) ? "warmup" : "working"
  );

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isTodayView || !canLog) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isTodayView, canLog]);

  const last = getLastPerformance(logs, exercise.id, dateISO);
  const lastSet = todaySets[todaySets.length - 1];
  const restSeconds =
    isTodayView && canLog && lastSet
      ? Math.max(0, Math.floor((now - new Date(lastSet.loggedAt).getTime()) / 1000))
      : null;

  const handleAdd = () => {
    const r = parseInt(reps, 10);
    if (Number.isNaN(r) || r <= 0) return;
    let w = 0;
    if (needsWeight) {
      w = parseFloat(weight);
      if (Number.isNaN(w) || w < 0) return;
    }
    const rpeValue = rpe === "" ? undefined : parseFloat(rpe);
    const bandValue = needsBandColor && bandColor.trim() ? bandColor.trim() : undefined;
    const isWarmup = hasWarmupTarget ? setType === "warmup" : undefined;
    logSet(dateISO, exercise.id, w, r, rpeValue, bandValue, isWarmup);
    setReps("");
    if (hasWarmupTarget && setType === "warmup" && warmupLogged.length + 1 >= (targetWarmupSets ?? 0)) {
      setSetType("working");
    }
  };

  const formatSet = (s: LoggedSet) => {
    if (exercise.equipment === "dumbbell") return `${s.weight}${weightUnit}/arm×${s.reps}`;
    if (exercise.equipment === "barbell") return `${s.weight}${weightUnit}×${s.reps}`;
    if (isCardio) return `${s.reps} min`;
    if (perLeg) return `${s.reps} reps/leg`;
    return `${s.reps} reps`;
  };

  const formatSetWithRpe = (s: LoggedSet) => {
    const base = formatSet(s);
    return s.rpe != null ? `${base} (${s.rpe})` : base;
  };

  return (
    <div
      className={[
        "relative rounded-xl border p-3 transition-colors duration-300",
        isComplete ? "border-accent-400/60 bg-accent-400/10" : "border-base-700/60 bg-base-900/40",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="flex items-center gap-1 text-[13.5px] font-medium text-base-100">
            {index != null && <span className="text-base-500">{index}. </span>}
            {exercise.name}
            {isComplete && <CheckCircle2 size={13} className="text-accent-400" />}
            {targetSets != null && isCardio && (
              <span className="ml-1 text-[11px] font-normal text-base-500">scheduled today</span>
            )}
            {targetSets != null && !isCardio && (
              <span className="ml-1 text-[11px] font-normal text-base-500">
                target: {hasWarmupTarget ? `${targetWarmupSets} warmup + ` : ""}
                {targetSets} working {targetSets === 1 ? "set" : "sets"}
              </span>
            )}
          </p>
          {last && (
            <p className="text-[11.5px] text-base-500">
              Last: {last.sets.map(formatSetWithRpe).join(", ")}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {restSeconds != null && (
            <span className="flex items-center gap-1 text-[11px] text-base-500">
              <Timer size={11} />
              {formatRestTime(restSeconds)}
            </span>
          )}
          {targetSets != null && canLog && (
            <SubstituteExercise exercise={exercise} dateISO={dateISO} />
          )}
          {onRemove && (
            <button
              onClick={() => {
                todaySets.forEach((s) => deleteSet(dateISO, s.id));
                onRemove();
              }}
              title="Remove this exercise from today"
              className="text-base-500 hover:text-red-400"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {todaySets.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {todaySets.map((s) => (
            <span
              key={s.id}
              className={[
                "group flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium",
                s.isWarmup ? "bg-base-700/60 text-base-300" : "bg-accent-400/12 text-accent-400",
              ].join(" ")}
            >
              {s.isWarmup && <span className="text-base-500">W</span>}
              {formatSet(s)}
              {s.bandColor && <span className="opacity-70">{s.bandColor}</span>}
              {s.rpe != null && <span className="opacity-70">RPE {s.rpe}</span>}
              <span className="opacity-50">{formatClockTime(s.loggedAt)}</span>
              <button
                onClick={() => deleteSet(dateISO, s.id)}
                className="opacity-50 hover:opacity-100"
                aria-label="Delete set"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <ExerciseNote dateISO={dateISO} exerciseId={exercise.id} canLog={canLog} />

      {canLog && (
        <>
          {hasWarmupTarget && (
            <div className="mt-2 flex gap-1 rounded-full bg-base-800 p-0.5">
              {(["warmup", "working"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSetType(t)}
                  className={[
                    "flex-1 rounded-full py-1 text-[11px] font-medium transition-colors",
                    setType === t
                      ? "bg-accent-400 text-base-950"
                      : "text-base-400 hover:text-base-100",
                  ].join(" ")}
                >
                  {t === "warmup" ? `Warmup (${warmupLogged.length}/${targetWarmupSets})` : "Working"}
                </button>
              ))}
            </div>
          )}
          <div className="mt-2 flex items-center gap-1.5">
            {needsWeight && (
              <>
                <div className="flex flex-col">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder={exercise.equipment === "dumbbell" ? `${weightUnit}/arm` : weightUnit}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-20 rounded-lg border border-base-700 bg-base-950 px-2 py-1.5 text-[13px] text-base-100 outline-none focus:border-accent-400/60"
                  />
                  {exercise.equipment === "dumbbell" && (
                    <span className="mt-0.5 text-[9.5px] text-base-600">each arm</span>
                  )}
                </div>
                <span className="text-base-600">×</span>
              </>
            )}
            <input
              type="number"
              inputMode="numeric"
              placeholder={isCardio ? "minutes" : perLeg ? "reps/leg" : "reps"}
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

          {needsBandColor && (
            <input
              list={`band-colors-${exercise.id}`}
              value={bandColor}
              onChange={(e) => setBandColor(e.target.value)}
              placeholder="Band color (optional)"
              className="mt-1.5 w-full rounded-lg border border-base-700 bg-base-950 px-2 py-1.5 text-[12px] text-base-100 outline-none focus:border-accent-400/60"
            />
          )}
          {needsBandColor && (
            <datalist id={`band-colors-${exercise.id}`}>
              {COMMON_BAND_COLORS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          )}

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
        </>
      )}
    </div>
  );
}

function ExerciseNote({
  dateISO,
  exerciseId,
  canLog,
}: {
  dateISO: string;
  exerciseId: string;
  canLog: boolean;
}) {
  const note = useStore((s) => s.exerciseNotes[dateISO]?.[exerciseId] ?? "");
  const setExerciseNote = useStore((s) => s.setExerciseNote);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(note);

  const save = () => {
    setExerciseNote(dateISO, exerciseId, value);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") setEditing(false);
        }}
        onBlur={save}
        placeholder="Note about this exercise…"
        className="mt-1.5 w-full rounded-lg border border-accent-400/50 bg-base-950 px-2 py-1 text-[12px] text-base-100 outline-none"
      />
    );
  }

  if (note) {
    return (
      <div className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-base-800/40 px-2 py-1.5">
        <StickyNote size={11} className="mt-0.5 shrink-0 text-base-500" />
        <span className="flex-1 text-[11.5px] italic text-base-400">{note}</span>
        {canLog && (
          <button
            onClick={() => {
              setValue(note);
              setEditing(true);
            }}
            className="shrink-0 text-base-500 hover:text-accent-400"
            aria-label="Edit note"
          >
            <Pencil size={11} />
          </button>
        )}
      </div>
    );
  }

  if (!canLog) return null;

  return (
    <button
      onClick={() => {
        setValue("");
        setEditing(true);
      }}
      className="mt-1.5 flex items-center gap-1 text-[10.5px] font-medium text-base-500 hover:text-accent-400"
    >
      <StickyNote size={11} />
      Add note
    </button>
  );
}

function SubstituteExercise({ exercise, dateISO }: { exercise: Exercise; dateISO: string }) {
  const exercises = useStore((s) => s.exercises);
  const activePlanId = useStore((s) => s.activePlanId);
  const swapDayExercise = useStore((s) => s.swapDayExercise);
  const [open, setOpen] = useState(false);

  if (!activePlanId) return null;

  const options = exercises.filter(
    (e) => e.muscleGroup === exercise.muscleGroup && e.id !== exercise.id
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Substitute this exercise for today"
        className="flex items-center gap-1 text-[10.5px] font-medium text-base-500 hover:text-accent-400"
      >
        <ArrowLeftRight size={11} />
        Substitute
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-base-700 bg-base-900 p-1.5 shadow-lg">
          <div className="mb-1 flex items-center justify-between px-1">
            <p className="text-[10.5px] font-medium uppercase tracking-wide text-base-500">
              Swap for today
            </p>
            <button onClick={() => setOpen(false)} className="text-base-500 hover:text-base-100">
              <X size={12} />
            </button>
          </div>
          <div className="max-h-48 space-y-0.5 overflow-y-auto">
            {options.length === 0 && (
              <p className="px-2 py-1 text-[11px] text-base-500">No other exercises in this group.</p>
            )}
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  swapDayExercise(activePlanId, dateISO, exercise.muscleGroup, exercise.id, opt.id);
                  setOpen(false);
                }}
                className="block w-full rounded-md px-2 py-1 text-left text-[12px] text-base-100 hover:bg-accent-400/10 hover:text-accent-400"
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AddExtraExercise({
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
        Log an exercise
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
