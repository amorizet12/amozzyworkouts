import { formatISO, parseISO, subDays } from "date-fns";
import { ScheduledDay } from "./types";

const MAX_LOOKBACK_DAYS = 200;

/**
 * Consecutive completed workout days, walking backward from today. Rest days
 * (no schedule entry) are skipped over rather than breaking the streak.
 * Today doesn't break the streak if it's not done yet — it just doesn't add
 * to the count until it's marked complete.
 */
export function computeCurrentStreak(
  schedule: Record<string, ScheduledDay>,
  completedDates: string[],
  todayISO: string
): number {
  const completed = new Set(completedDates);
  let streak = 0;
  let cursor = parseISO(todayISO);

  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    const dateISO = formatISO(cursor, { representation: "date" });
    const isWorkoutDay = Boolean(schedule[dateISO]);

    if (isWorkoutDay) {
      if (completed.has(dateISO)) {
        streak++;
      } else if (dateISO !== todayISO) {
        break;
      }
    }

    cursor = subDays(cursor, 1);
  }

  return streak;
}
