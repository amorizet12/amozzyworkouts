import { addDays, formatISO, parseISO } from "date-fns";
import { MuscleGroupId, PlanTarget, ScheduledDay } from "./types";

/**
 * Spreads a muscle group's weekly sessions as evenly as possible across the
 * 7 days of the week, staggering the starting offset per target so that
 * different groups don't all land on day 0. Groups can and do share a day
 * (e.g. a "push" day of chest + shoulders + triceps) — that's normal.
 */
function idealDayIndices(timesPerWeek: number, offset: number): number[] {
  if (timesPerWeek <= 0) return [];
  const days: number[] = [];
  for (let k = 0; k < timesPerWeek; k++) {
    const raw = Math.round((k * 7) / timesPerWeek) + offset;
    days.push(((raw % 7) + 7) % 7);
  }
  return Array.from(new Set(days));
}

export function generateSchedule(
  targets: PlanTarget[],
  startDateISO: string,
  durationWeeks: number
): Record<string, ScheduledDay> {
  const activeTargets = targets.filter((t) => t.timesPerWeek > 0 && t.exerciseIds.length > 0);

  const weekPattern: Record<number, { muscleGroup: MuscleGroupId; exerciseIds: string[] }[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
  };

  activeTargets.forEach((target, i) => {
    const dayIndices = idealDayIndices(target.timesPerWeek, i);
    dayIndices.forEach((d) => {
      weekPattern[d].push({ muscleGroup: target.muscleGroup, exerciseIds: target.exerciseIds });
    });
  });

  const schedule: Record<string, ScheduledDay> = {};
  const start = parseISO(startDateISO);
  const totalDays = durationWeeks * 7;

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(start, i);
    const dayOfWeek = date.getDay(); // 0 = Sunday
    const entries = weekPattern[dayOfWeek];
    if (!entries || entries.length === 0) continue;

    const dateISO = formatISO(date, { representation: "date" });
    const muscleGroups = Array.from(new Set(entries.map((e) => e.muscleGroup)));
    const exercises = entries.flatMap((e) =>
      e.exerciseIds.map((exerciseId) => ({ exerciseId, muscleGroup: e.muscleGroup }))
    );

    schedule[dateISO] = { date: dateISO, muscleGroups, exercises };
  }

  return schedule;
}
