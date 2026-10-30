"use client";

import { useMemo, useState } from "react";
import { format, formatISO } from "date-fns";
import { Flame, Pencil, Scale } from "lucide-react";
import DayPanel from "@/components/DayPanel";
import { useStore } from "@/lib/store";
import { computeCurrentStreak } from "@/lib/streak";
import { muscleGroupLabel } from "@/lib/muscleGroups";

function joinWithAnd(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} & ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} & ${items[items.length - 1]}`;
}

export default function HomePage() {
  const hydrated = useStore((s) => s.hydrated);
  const plans = useStore((s) => s.plans);
  const activePlanId = useStore((s) => s.activePlanId);
  const completedDates = useStore((s) => s.completedDates);

  const today = useMemo(() => new Date(), []);
  const todayISO = useMemo(() => formatISO(today, { representation: "date" }), [today]);

  const activePlan = plans.find((p) => p.id === activePlanId) ?? null;
  const scheduled = activePlan?.schedule[todayISO];

  const streak = useMemo(() => {
    if (!activePlan) return 0;
    return computeCurrentStreak(activePlan.schedule, completedDates, todayISO);
  }, [activePlan, completedDates, todayISO]);

  const summary = !activePlan
    ? "No active plan yet"
    : scheduled
    ? joinWithAnd(scheduled.muscleGroups.map(muscleGroupLabel))
    : "Rest day";

  if (!hydrated) {
    return <div className="pt-20 text-center text-[13px] text-base-500">Loading…</div>;
  }

  return (
    <div>
      <div className="rounded-2xl border border-base-700/60 bg-base-900/60 p-5">
        <p className="text-[12px] font-medium uppercase tracking-wide text-base-500">
          {format(today, "EEEE")}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <h1 className="text-[22px] font-bold text-base-50">{format(today, "MMMM d, yyyy")}</h1>
          {streak > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-accent-400/15 px-2 py-0.5 text-[11px] font-semibold text-accent-400">
              <Flame size={11} />
              {streak}
            </span>
          )}
        </div>
        <p className="mt-2 text-[15px] font-medium text-accent-400">{summary}</p>
      </div>

      <BodyweightCard todayISO={todayISO} />

      <DayPanel dateISO={todayISO} showHeader={false} numbered showBodyweight={false} />
    </div>
  );
}

function BodyweightCard({ todayISO }: { todayISO: string }) {
  const weightUnit = useStore((s) => s.weightUnit);
  const bodyweightLogs = useStore((s) => s.bodyweightLogs);
  const logBodyweight = useStore((s) => s.logBodyweight);

  const todayWeight = bodyweightLogs[todayISO];
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(todayWeight != null ? String(todayWeight) : "");

  const handleSave = () => {
    const w = parseFloat(value);
    if (Number.isNaN(w) || w <= 0) return;
    logBodyweight(todayISO, w);
    setEditing(false);
  };

  if (!editing && todayWeight != null) {
    return (
      <div className="mt-3 flex items-center justify-between rounded-xl border border-base-700/60 bg-base-900/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <Scale size={15} className="text-accent-400" />
          <span className="text-[13px] text-base-100">
            Today's weight: <span className="font-semibold">{todayWeight}{weightUnit}</span>
          </span>
        </div>
        <button
          onClick={() => {
            setValue(String(todayWeight));
            setEditing(true);
          }}
          className="flex items-center gap-1 text-[12px] font-medium text-accent-400 hover:text-accent-300"
        >
          <Pencil size={12} />
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-base-700/60 bg-base-900/40 px-3 py-2.5">
      <Scale size={15} className="shrink-0 text-base-500" />
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        placeholder={`Log today's weight (${weightUnit})`}
        className="flex-1 rounded-lg border border-base-700 bg-base-950 px-2.5 py-1.5 text-[13px] text-base-100 outline-none focus:border-accent-400/60"
      />
      <button
        onClick={handleSave}
        className="rounded-lg bg-accent-400 px-3 py-1.5 text-[12px] font-semibold text-base-950 hover:bg-accent-300"
      >
        Log
      </button>
    </div>
  );
}
