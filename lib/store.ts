"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addDays, differenceInCalendarDays, formatISO, parseISO } from "date-fns";
import {
  AppData,
  DaySlot,
  Exercise,
  LoggedSet,
  MuscleGroupId,
  Plan,
  SplitStyle,
  UserProfile,
} from "./types";
import { buildDefaultExercises } from "./muscleGroups";
import { buildScheduleFromDaySequence, materializeDaySequence, pushDayInSequence } from "./schedule";
import { makeId } from "./id";

interface StoreState extends AppData {
  hydrated: boolean;
  addExercise: (name: string, muscleGroup: MuscleGroupId) => void;
  updateExercise: (id: string, name: string) => void;
  deleteExercise: (id: string) => void;
  createPlan: (input: {
    name: string;
    startDate: string;
    durationWeeks: number;
    splitStyle: SplitStyle;
    restDaysPerCycle: number;
    baseCycle: DaySlot[];
  }) => void;
  deletePlan: (id: string) => void;
  setActivePlan: (id: string | null) => void;
  swapDayExercise: (
    planId: string,
    dateISO: string,
    muscleGroup: MuscleGroupId,
    oldExerciseId: string,
    newExerciseId: string
  ) => void;
  pushDay: (planId: string, dateISO: string) => void;
  toggleDayComplete: (dateISO: string) => void;
  logSet: (date: string, exerciseId: string, weight: number, reps: number, rpe?: number) => void;
  deleteSet: (date: string, setId: string) => void;
  setWeightUnit: (unit: "lbs" | "kg") => void;
  setProfile: (profile: Partial<UserProfile>) => void;
  exportData: () => string;
  importData: (json: string) => { ok: boolean; error?: string };
  clearAllData: () => void;
  setHydrated: () => void;
}

const CURRENT_PLAN_WEEKS_CAP = 52;

const emptyProfile: UserProfile = {
  sex: null,
  bodyweight: null,
  heightIn: null,
  activityLevel: null,
};

/** Upgrades any legacy plan shape (weekly-template era, or older) into the
 * current day-sequence shape. Falls back to a blank plan rather than crash
 * if the shape is unrecognized. */
function normalizePlan(raw: any): Plan {
  if (Array.isArray(raw.daySequence)) {
    return {
      id: raw.id,
      name: raw.name,
      startDate: raw.startDate,
      durationWeeks: raw.durationWeeks ?? Math.ceil(raw.daySequence.length / 7),
      splitStyle: raw.splitStyle ?? "custom",
      restDaysPerCycle: raw.restDaysPerCycle ?? 0,
      daySequence: raw.daySequence,
      schedule: buildScheduleFromDaySequence(raw.daySequence, raw.startDate),
      createdAt: raw.createdAt ?? new Date().toISOString(),
    };
  }

  const durationWeeks = raw.durationWeeks ?? 8;
  const totalDays = durationWeeks * 7;

  if (raw.weeklyTemplate) {
    const start = parseISO(raw.startDate);
    const daySequence: DaySlot[] = [];
    for (let i = 0; i < totalDays; i++) {
      const dow = addDays(start, i).getDay();
      const entries = raw.weeklyTemplate[dow] ?? [];
      daySequence.push(
        entries.map((e: any) => ({
          muscleGroup: e.muscleGroup,
          exerciseIds: e.exerciseIds,
          setsPerExercise: e.setsPerExercise ?? 3,
        }))
      );
    }
    return {
      id: raw.id,
      name: raw.name,
      startDate: raw.startDate,
      durationWeeks,
      splitStyle: "custom",
      restDaysPerCycle: 0,
      daySequence,
      schedule: buildScheduleFromDaySequence(daySequence, raw.startDate),
      createdAt: raw.createdAt ?? new Date().toISOString(),
    };
  }

  const daySequence = Array.from({ length: totalDays }, () => [] as DaySlot);
  return {
    id: raw.id ?? makeId("plan"),
    name: raw.name ?? "Untitled Plan",
    startDate: raw.startDate ?? formatISO(new Date(), { representation: "date" }),
    durationWeeks,
    splitStyle: "custom",
    restDaysPerCycle: 0,
    daySequence,
    schedule: {},
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      exercises: buildDefaultExercises(),
      plans: [],
      activePlanId: null,
      logs: {},
      weightUnit: "lbs",
      profile: emptyProfile,
      completedDates: [],
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      addExercise: (name, muscleGroup) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          exercises: [...state.exercises, { id: makeId("ex"), name: trimmed, muscleGroup }],
        }));
      },

      updateExercise: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          exercises: state.exercises.map((e) => (e.id === id ? { ...e, name: trimmed } : e)),
        }));
      },

      deleteExercise: (id) => {
        set((state) => ({
          exercises: state.exercises.filter((e) => e.id !== id),
          plans: state.plans.map((p) => ({
            ...p,
            daySequence: p.daySequence.map((slot) =>
              slot
                .map((entry) => ({
                  ...entry,
                  exerciseIds: entry.exerciseIds.filter((eid) => eid !== id),
                }))
                .filter((entry) => entry.exerciseIds.length > 0)
            ),
          })),
        }));
      },

      createPlan: ({ name, startDate, durationWeeks, splitStyle, restDaysPerCycle, baseCycle }) => {
        const weeks = Math.min(Math.max(1, durationWeeks), CURRENT_PLAN_WEEKS_CAP);
        const daySequence = materializeDaySequence(baseCycle, weeks * 7);
        const schedule = buildScheduleFromDaySequence(daySequence, startDate);
        const plan: Plan = {
          id: makeId("plan"),
          name: name.trim() || "Untitled Plan",
          startDate,
          durationWeeks: weeks,
          splitStyle,
          restDaysPerCycle,
          daySequence,
          schedule,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          plans: [...state.plans, plan],
          activePlanId: plan.id,
        }));
      },

      deletePlan: (id) => {
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== id),
          activePlanId: state.activePlanId === id ? null : state.activePlanId,
        }));
      },

      setActivePlan: (id) => set({ activePlanId: id }),

      swapDayExercise: (planId, dateISO, muscleGroup, oldExerciseId, newExerciseId) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;

            const index = differenceInCalendarDays(parseISO(dateISO), parseISO(p.startDate));
            if (index < 0 || index >= p.daySequence.length) return p;

            const daySequence = p.daySequence.map((slot, i) => {
              if (i !== index) return slot;
              return slot.map((entry) => {
                if (entry.muscleGroup !== muscleGroup) return entry;
                if (entry.exerciseIds.includes(newExerciseId)) return entry;
                return {
                  ...entry,
                  exerciseIds: entry.exerciseIds.map((id) =>
                    id === oldExerciseId ? newExerciseId : id
                  ),
                };
              });
            });

            return { ...p, daySequence, schedule: buildScheduleFromDaySequence(daySequence, p.startDate) };
          }),
        }));
      },

      pushDay: (planId, dateISO) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;

            const index = differenceInCalendarDays(parseISO(dateISO), parseISO(p.startDate));
            const daySequence = pushDayInSequence(p.daySequence, index);
            const durationWeeks = Math.max(p.durationWeeks, Math.ceil(daySequence.length / 7));

            return {
              ...p,
              daySequence,
              durationWeeks,
              schedule: buildScheduleFromDaySequence(daySequence, p.startDate),
            };
          }),
        }));
      },

      toggleDayComplete: (dateISO) => {
        set((state) => {
          const has = state.completedDates.includes(dateISO);
          return {
            completedDates: has
              ? state.completedDates.filter((d) => d !== dateISO)
              : [...state.completedDates, dateISO],
          };
        });
      },

      logSet: (date, exerciseId, weight, reps, rpe) => {
        set((state) => {
          const existing = state.logs[date] ?? [];
          const setNumber =
            existing.filter((s) => s.exerciseId === exerciseId).length + 1;
          const newSet: LoggedSet = {
            id: makeId("set"),
            exerciseId,
            weight,
            reps,
            rpe,
            setNumber,
            loggedAt: new Date().toISOString(),
          };
          return {
            logs: { ...state.logs, [date]: [...existing, newSet] },
          };
        });
      },

      deleteSet: (date, setId) => {
        set((state) => {
          const existing = state.logs[date] ?? [];
          return {
            logs: { ...state.logs, [date]: existing.filter((s) => s.id !== setId) },
          };
        });
      },

      setWeightUnit: (unit) => set({ weightUnit: unit }),

      setProfile: (partial) => {
        set((state) => ({ profile: { ...state.profile, ...partial } }));
      },

      exportData: () => {
        const { exercises, plans, activePlanId, logs, weightUnit, profile, completedDates } = get();
        const payload = {
          version: 4,
          exportedAt: new Date().toISOString(),
          data: { exercises, plans, activePlanId, logs, weightUnit, profile, completedDates },
        };
        return JSON.stringify(payload, null, 2);
      },

      importData: (json) => {
        try {
          const parsed = JSON.parse(json);
          const data = parsed?.data ?? parsed;
          if (!data || !Array.isArray(data.exercises) || !Array.isArray(data.plans)) {
            return { ok: false, error: "This file doesn't look like an Amozzy Workouts backup." };
          }
          const plans: Plan[] = data.plans.map(normalizePlan);
          set({
            exercises: data.exercises,
            plans,
            activePlanId: data.activePlanId ?? null,
            logs: data.logs ?? {},
            weightUnit: data.weightUnit === "kg" ? "kg" : "lbs",
            profile: { ...emptyProfile, ...(data.profile ?? {}) },
            completedDates: Array.isArray(data.completedDates) ? data.completedDates : [],
          });
          return { ok: true };
        } catch {
          return { ok: false, error: "Couldn't read that file. Make sure it's a valid backup JSON." };
        }
      },

      clearAllData: () => {
        set({
          exercises: buildDefaultExercises(),
          plans: [],
          activePlanId: null,
          logs: {},
          weightUnit: "lbs",
          profile: emptyProfile,
          completedDates: [],
        });
      },
    }),
    {
      name: "amozzy-workouts-data",
      version: 4,
      migrate: (persisted) => {
        const state = persisted as Partial<StoreState> | undefined;
        if (!state) return state;

        const plans = (state.plans ?? []).map(normalizePlan);

        return {
          ...state,
          plans,
          profile: state.profile ?? emptyProfile,
          completedDates: state.completedDates ?? [],
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
