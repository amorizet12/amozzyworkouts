"use client";

import { useMemo, useState } from "react";
import { formatISO } from "date-fns";
import Calendar from "@/components/Calendar";
import DayPanel from "@/components/DayPanel";
import { useStore } from "@/lib/store";
import { computeCurrentStreak } from "@/lib/streak";

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(() =>
    formatISO(new Date(), { representation: "date" })
  );

  const hydrated = useStore((s) => s.hydrated);
  const plans = useStore((s) => s.plans);
  const activePlanId = useStore((s) => s.activePlanId);
  const logs = useStore((s) => s.logs);
  const completedDates = useStore((s) => s.completedDates);

  const activePlan = plans.find((p) => p.id === activePlanId) ?? null;

  const completedSet = useMemo(() => new Set(completedDates), [completedDates]);

  const streak = useMemo(() => {
    if (!activePlan) return 0;
    const today = formatISO(new Date(), { representation: "date" });
    return computeCurrentStreak(activePlan.schedule, completedDates, today);
  }, [activePlan, completedDates]);

  if (!hydrated) {
    return <div className="pt-20 text-center text-[13px] text-base-500">Loading…</div>;
  }

  return (
    <div>
      <Calendar
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        activePlan={activePlan}
        logs={logs}
        completedDates={completedSet}
        streak={streak}
      />
      <DayPanel key={selectedDate} dateISO={selectedDate} />
    </div>
  );
}
