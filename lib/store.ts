"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addDays, differenceInCalendarDays, formatISO, parseISO } from "date-fns";
import {
  AppData,
  DaySlot,
  EquipmentType,
  Exercise,
  LoggedSet,
  MuscleGroupId,
  Plan,
  SplitStyle,
  UserProfile,
} from "./types";
import { buildDefaultExercises } from "./muscleGroups";
import {
  buildScheduleFromDaySequence,
  materializeDaySequence,
  pushDayInSequence,
  undoPushDayInSequence,
} from "./schedule";
import { makeId } from "./id";
import { AccentColorId, ThemeMode } from "./theme";

interface StoreState extends AppData {
  hydrated: boolean;
  addExercise: (name: string, muscleGroup: MuscleGroupId, equipment: EquipmentType) => void;
  updateExercise: (id: string, name: string) => void;
  updateExerciseEquipment: (id: string, equipment: EquipmentType) => void;
  updateExercisePerLeg: (id: string, perLeg: boolean) => void;
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
  undoPushDay: (planId: string, dateISO: string) => void;
  toggleDayComplete: (dateISO: string) => void;
  toggleWarmupComplete: (dateISO: string) => void;
  toggleCooldownComplete: (dateISO: string) => void;
  logBodyweight: (dateISO: string, weight: number) => void;
  deleteBodyweightLog: (dateISO: string) => void;
  setExerciseNote: (dateISO: string, exerciseId: string, note: string) => void;
  toggleFavoriteLibrary: (id: string) => void;
  toggleTryLaterLibrary: (id: string) => void;
  logSet: (
    date: string,
    exerciseId: string,
    weight: number,
    reps: number,
    rpe?: number,
    bandColor?: string,
    isWarmup?: boolean
  ) => void;
  deleteSet: (date: string, setId: string) => void;
  setWeightUnit: (unit: "lbs" | "kg") => void;
  setProfile: (profile: Partial<UserProfile>) => void;
  setAppName: (name: string) => void;
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (color: AccentColorId) => void;
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

const DEFAULT_APP_NAME = "PRISM";

function normalizeExercise(raw: any): Exercise {
  return {
    id: raw.id,
    name: raw.name,
    muscleGroup: raw.muscleGroup,
    equipment: raw.equipment ?? "barbell",
    perLeg: raw.perLeg ?? false,
  };
}

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
      pendingPush: raw.pendingPush ?? null,
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
      completedAt: {},
      warmupCompletedDates: [],
      cooldownCompletedDates: [],
      favoriteLibraryIds: [],
      tryLaterLibraryIds: [],
      bodyweightLogs: {},
      exerciseNotes: {},
      appName: DEFAULT_APP_NAME,
      theme: "dark",
      accentColor: "green",
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      addExercise: (name, muscleGroup, equipment) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          exercises: [...state.exercises, { id: makeId("ex"), name: trimmed, muscleGroup, equipment }],
        }));
      },

      updateExercise: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          exercises: state.exercises.map((e) => (e.id === id ? { ...e, name: trimmed } : e)),
        }));
      },

      updateExerciseEquipment: (id, equipment) => {
        set((state) => ({
          exercises: state.exercises.map((e) => (e.id === id ? { ...e, equipment } : e)),
        }));
      },

      updateExercisePerLeg: (id, perLeg) => {
        set((state) => ({
          exercises: state.exercises.map((e) => (e.id === id ? { ...e, perLeg } : e)),
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
            const { daySequence, length } = pushDayInSequence(p.daySequence, index);
            if (length === 0) return p;
            const durationWeeks = Math.max(p.durationWeeks, Math.ceil(daySequence.length / 7));

            return {
              ...p,
              daySequence,
              durationWeeks,
              schedule: buildScheduleFromDaySequence(daySequence, p.startDate),
              pendingPush: { dateISO, index, length },
            };
          }),
        }));
      },

      undoPushDay: (planId, dateISO) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;
            if (!p.pendingPush || p.pendingPush.dateISO !== dateISO) return p;

            const daySequence = undoPushDayInSequence(
              p.daySequence,
              p.pendingPush.index,
              p.pendingPush.length
            );

            return {
              ...p,
              daySequence,
              durationWeeks: Math.ceil(daySequence.length / 7),
              schedule: buildScheduleFromDaySequence(daySequence, p.startDate),
              pendingPush: null,
            };
          }),
        }));
      },

      toggleDayComplete: (dateISO) => {
        set((state) => {
          const has = state.completedDates.includes(dateISO);
          const completedAt = { ...state.completedAt };
          if (has) {
            delete completedAt[dateISO];
          } else {
            completedAt[dateISO] = new Date().toISOString();
          }
          return {
            completedDates: has
              ? state.completedDates.filter((d) => d !== dateISO)
              : [...state.completedDates, dateISO],
            completedAt,
          };
        });
      },

      toggleWarmupComplete: (dateISO) => {
        set((state) => {
          const has = state.warmupCompletedDates.includes(dateISO);
          return {
            warmupCompletedDates: has
              ? state.warmupCompletedDates.filter((d) => d !== dateISO)
              : [...state.warmupCompletedDates, dateISO],
          };
        });
      },

      toggleCooldownComplete: (dateISO) => {
        set((state) => {
          const has = state.cooldownCompletedDates.includes(dateISO);
          return {
            cooldownCompletedDates: has
              ? state.cooldownCompletedDates.filter((d) => d !== dateISO)
              : [...state.cooldownCompletedDates, dateISO],
          };
        });
      },

      logBodyweight: (dateISO, weight) => {
        set((state) => {
          const bodyweightLogs = { ...state.bodyweightLogs, [dateISO]: weight };
          const latestDate = Object.keys(bodyweightLogs).sort().pop();
          return {
            bodyweightLogs,
            profile: latestDate === dateISO ? { ...state.profile, bodyweight: weight } : state.profile,
          };
        });
      },

      deleteBodyweightLog: (dateISO) => {
        set((state) => {
          const bodyweightLogs = { ...state.bodyweightLogs };
          delete bodyweightLogs[dateISO];
          return { bodyweightLogs };
        });
      },

      setExerciseNote: (dateISO, exerciseId, note) => {
        set((state) => {
          const dayNotes = { ...(state.exerciseNotes[dateISO] ?? {}) };
          const trimmed = note.trim();
          if (trimmed) {
            dayNotes[exerciseId] = trimmed;
          } else {
            delete dayNotes[exerciseId];
          }
          const exerciseNotes = { ...state.exerciseNotes, [dateISO]: dayNotes };
          if (Object.keys(dayNotes).length === 0) delete exerciseNotes[dateISO];
          return { exerciseNotes };
        });
      },

      toggleFavoriteLibrary: (id) => {
        set((state) => {
          const has = state.favoriteLibraryIds.includes(id);
          return {
            favoriteLibraryIds: has
              ? state.favoriteLibraryIds.filter((i) => i !== id)
              : [...state.favoriteLibraryIds, id],
          };
        });
      },

      toggleTryLaterLibrary: (id) => {
        set((state) => {
          const has = state.tryLaterLibraryIds.includes(id);
          return {
            tryLaterLibraryIds: has
              ? state.tryLaterLibraryIds.filter((i) => i !== id)
              : [...state.tryLaterLibraryIds, id],
          };
        });
      },

      logSet: (date, exerciseId, weight, reps, rpe, bandColor, isWarmup) => {
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
            bandColor,
            isWarmup,
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

      setAppName: (name) => set({ appName: name.trim() || DEFAULT_APP_NAME }),
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),

      exportData: () => {
        const {
          exercises,
          plans,
          activePlanId,
          logs,
          weightUnit,
          profile,
          completedDates,
          completedAt,
          warmupCompletedDates,
          cooldownCompletedDates,
          favoriteLibraryIds,
          tryLaterLibraryIds,
          bodyweightLogs,
          exerciseNotes,
          appName,
          theme,
          accentColor,
        } = get();
        const payload = {
          version: 10,
          exportedAt: new Date().toISOString(),
          data: {
            exercises,
            plans,
            activePlanId,
            logs,
            weightUnit,
            profile,
            completedDates,
            completedAt,
            warmupCompletedDates,
            cooldownCompletedDates,
            favoriteLibraryIds,
            tryLaterLibraryIds,
            bodyweightLogs,
            exerciseNotes,
            appName,
            theme,
            accentColor,
          },
        };
        return JSON.stringify(payload, null, 2);
      },

      importData: (json) => {
        try {
          const parsed = JSON.parse(json);
          const data = parsed?.data ?? parsed;
          if (!data || !Array.isArray(data.exercises) || !Array.isArray(data.plans)) {
            return { ok: false, error: "This file doesn't look like a PRISM backup." };
          }
          const plans: Plan[] = data.plans.map(normalizePlan);
          let exercises: Exercise[] = data.exercises.map(normalizeExercise);
          if (!exercises.some((e) => e.muscleGroup === "cardio")) {
            exercises = [...buildDefaultExercises().filter((e) => e.muscleGroup === "cardio"), ...exercises];
          }
          set({
            exercises,
            plans,
            activePlanId: data.activePlanId ?? null,
            logs: data.logs ?? {},
            weightUnit: data.weightUnit === "kg" ? "kg" : "lbs",
            profile: { ...emptyProfile, ...(data.profile ?? {}) },
            completedDates: Array.isArray(data.completedDates) ? data.completedDates : [],
            completedAt: data.completedAt ?? {},
            warmupCompletedDates: Array.isArray(data.warmupCompletedDates)
              ? data.warmupCompletedDates
              : [],
            cooldownCompletedDates: Array.isArray(data.cooldownCompletedDates)
              ? data.cooldownCompletedDates
              : [],
            favoriteLibraryIds: Array.isArray(data.favoriteLibraryIds) ? data.favoriteLibraryIds : [],
            tryLaterLibraryIds: Array.isArray(data.tryLaterLibraryIds) ? data.tryLaterLibraryIds : [],
            bodyweightLogs: data.bodyweightLogs ?? {},
            exerciseNotes: data.exerciseNotes ?? {},
            appName: data.appName ?? DEFAULT_APP_NAME,
            theme: data.theme === "light" ? "light" : "dark",
            accentColor: data.accentColor ?? "green",
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
          completedAt: {},
          warmupCompletedDates: [],
          cooldownCompletedDates: [],
          favoriteLibraryIds: [],
          tryLaterLibraryIds: [],
          bodyweightLogs: {},
          exerciseNotes: {},
          appName: DEFAULT_APP_NAME,
          theme: "dark",
          accentColor: "green",
        });
      },
    }),
    {
      name: "amozzy-workouts-data",
      version: 10,
      migrate: (persisted) => {
        const state = persisted as Partial<StoreState> | undefined;
        if (!state) return state;

        const plans = (state.plans ?? []).map(normalizePlan);
        let exercises = (state.exercises ?? []).map(normalizeExercise);
        if (!exercises.some((e) => e.muscleGroup === "cardio")) {
          exercises = [...buildDefaultExercises().filter((e) => e.muscleGroup === "cardio"), ...exercises];
        }

        return {
          ...state,
          plans,
          exercises,
          profile: state.profile ?? emptyProfile,
          completedDates: state.completedDates ?? [],
          completedAt: state.completedAt ?? {},
          warmupCompletedDates: state.warmupCompletedDates ?? [],
          cooldownCompletedDates: state.cooldownCompletedDates ?? [],
          favoriteLibraryIds: state.favoriteLibraryIds ?? [],
          tryLaterLibraryIds: state.tryLaterLibraryIds ?? [],
          bodyweightLogs: state.bodyweightLogs ?? {},
          exerciseNotes: state.exerciseNotes ?? {},
          appName: state.appName ?? DEFAULT_APP_NAME,
          theme: state.theme ?? "dark",
          accentColor: state.accentColor ?? "green",
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
