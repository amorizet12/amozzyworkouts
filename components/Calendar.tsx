"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  formatISO,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Check, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Plan, WorkoutLog } from "@/lib/types";
import { muscleGroupColor } from "@/lib/muscleGroups";

interface CalendarProps {
  selectedDate: string;
  onSelect: (dateISO: string) => void;
  activePlan: Plan | null;
  logs: WorkoutLog;
  completedDates: Set<string>;
  streak: number;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function Calendar({
  selectedDate,
  onSelect,
  activePlan,
  logs,
  completedDates,
  streak,
}: CalendarProps) {
  const [monthCursor, setMonthCursor] = useState(() => parseISO(selectedDate));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthCursor));
    const end = endOfWeek(endOfMonth(monthCursor));
    return eachDayOfInterval({ start, end });
  }, [monthCursor]);

  return (
    <div className="rounded-2xl border border-base-700/60 bg-base-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-base-100">
            {format(monthCursor, "MMMM yyyy")}
          </h2>
          {streak > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-accent-400/15 px-2 py-0.5 text-[11px] font-semibold text-accent-400">
              <Flame size={11} />
              {streak}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonthCursor((m) => subMonths(m, 1))}
            className="rounded-lg p-1.5 text-base-400 hover:bg-base-800 hover:text-base-100"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setMonthCursor(now);
              onSelect(formatISO(now, { representation: "date" }));
            }}
            className="rounded-lg px-2 py-1 text-[12px] font-medium text-base-400 hover:bg-base-800 hover:text-base-100"
          >
            Today
          </button>
          <button
            onClick={() => setMonthCursor((m) => addMonths(m, 1))}
            className="rounded-lg p-1.5 text-base-400 hover:bg-base-800 hover:text-base-100"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-base-500">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i} className="pb-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateISO = formatISO(day, { representation: "date" });
          const inMonth = isSameMonth(day, monthCursor);
          const selected = isSameDay(day, parseISO(selectedDate));
          const today = isToday(day);
          const scheduled = activePlan?.schedule[dateISO];
          const hasLogs = (logs[dateISO]?.length ?? 0) > 0;
          const completed = completedDates.has(dateISO);

          return (
            <button
              key={dateISO}
              onClick={() => onSelect(dateISO)}
              className={[
                "relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-[13px] transition-colors",
                selected
                  ? "bg-accent-400 text-base-950 font-semibold"
                  : inMonth
                  ? "text-base-100 hover:bg-base-800"
                  : "text-base-600 hover:bg-base-800/50",
                today && !selected ? "ring-1 ring-accent-400/60" : "",
              ].join(" ")}
            >
              {completed && (
                <span
                  className="absolute right-0.5 top-0.5 flex h-3 w-3 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: selected ? "rgb(var(--base-950))" : "rgb(var(--accent-400))",
                  }}
                >
                  <Check
                    size={8}
                    strokeWidth={3}
                    color={selected ? "rgb(var(--accent-400))" : "rgb(var(--base-950))"}
                  />
                </span>
              )}
              <span>{format(day, "d")}</span>
              <span className="flex h-1.5 items-center gap-0.5">
                {scheduled?.muscleGroups.slice(0, 3).map((mg) => (
                  <span
                    key={mg}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: selected ? "rgb(var(--base-950))" : muscleGroupColor(mg),
                      opacity: selected ? 0.6 : 1,
                    }}
                  />
                ))}
                {hasLogs && !scheduled && (
                  <span
                    className="h-1.5 w-1.5 rounded-full border"
                    style={{ borderColor: selected ? "rgb(var(--base-950))" : "rgb(var(--base-500))" }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
