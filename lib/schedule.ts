import { addDays, formatISO, parseISO } from "date-fns";
import { DaySlot, ScheduledDay } from "./types";

/** Spreads `count` items as evenly as possible across `total` slots (0-indexed). */
export function evenlySpacedIndices(count: number, total: number): number[] {
  if (count <= 0 || total <= 0) return [];
  const indices: number[] = [];
  for (let k = 0; k < count; k++) {
    indices.push(Math.round((k * total) / count) % total);
  }
  return Array.from(new Set(indices));
}

/** Builds one repeating cycle from an ordered list of workout-day slots plus
 * a number of rest days, spacing the rest days evenly around the cycle. */
export function buildCycleFromWorkoutDays(workoutDays: DaySlot[], restDaysPerCycle: number): DaySlot[] {
  const cycleLength = workoutDays.length + Math.max(0, restDaysPerCycle);
  if (cycleLength === 0) return [];

  const restIndices = new Set(evenlySpacedIndices(restDaysPerCycle, cycleLength));
  const cycle: DaySlot[] = [];
  let workoutCursor = 0;
  for (let i = 0; i < cycleLength; i++) {
    if (restIndices.has(i)) {
      cycle.push([]);
    } else {
      cycle.push(workoutDays[workoutCursor] ?? []);
      workoutCursor++;
    }
  }
  return cycle;
}

/** Repeats a base cycle until it reaches (at least) totalDays, then trims to length. */
export function materializeDaySequence(baseCycle: DaySlot[], totalDays: number): DaySlot[] {
  if (baseCycle.length === 0) return Array.from({ length: totalDays }, () => []);
  const sequence: DaySlot[] = [];
  for (let i = 0; i < totalDays; i++) {
    sequence.push(baseCycle[i % baseCycle.length]);
  }
  return sequence;
}

/** Expands a materialized day sequence into concrete calendar-dated schedule entries. */
export function buildScheduleFromDaySequence(
  daySequence: DaySlot[],
  startDateISO: string
): Record<string, ScheduledDay> {
  const schedule: Record<string, ScheduledDay> = {};
  const start = parseISO(startDateISO);

  daySequence.forEach((slot, i) => {
    if (slot.length === 0) return;

    const date = addDays(start, i);
    const dateISO = formatISO(date, { representation: "date" });
    const muscleGroups = Array.from(new Set(slot.map((e) => e.muscleGroup)));
    const exercises = slot.flatMap((e) =>
      e.exerciseIds.map((exerciseId) => ({
        exerciseId,
        muscleGroup: e.muscleGroup,
        targetSets: e.setsPerExercise,
      }))
    );

    schedule[dateISO] = { date: dateISO, muscleGroups, exercises };
  });

  return schedule;
}

/**
 * "Push today": today (at `index`) becomes a rest day. Everything after it
 * shifts forward by one day, but only up to the next scheduled rest day,
 * which gets converted into a workout day to absorb the shift — so a single
 * missed day doesn't cascade through the rest of the plan. If no rest day
 * exists between today and the end, the whole remainder shifts and the
 * sequence grows by one day.
 */
export function pushDayInSequence(daySequence: DaySlot[], index: number): DaySlot[] {
  if (index < 0 || index >= daySequence.length) return daySequence;

  let restIndex = -1;
  for (let j = index + 1; j < daySequence.length; j++) {
    if (daySequence[j].length === 0) {
      restIndex = j;
      break;
    }
  }

  if (restIndex === -1) {
    return [...daySequence.slice(0, index), [], ...daySequence.slice(index)];
  }

  const span = daySequence.slice(index, restIndex + 1); // ends with the rest day
  const rotated = [span[span.length - 1], ...span.slice(0, span.length - 1)];
  return [...daySequence.slice(0, index), ...rotated, ...daySequence.slice(restIndex + 1)];
}
