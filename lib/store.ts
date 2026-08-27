"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AppData,
  Exercise,
  LoggedSet,
  MuscleGroupId,
  Plan,
  PlanTarget,
  UserProfile,
} from "./types";
import { buildDefaultExercises } from "./muscleGroups";
import { buildScheduleFromTemplate, buildWeeklyTemplate, generateSchedule } from "./schedule";
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
    targets: PlanTarget[];
  }) => void;
  deletePlan: (id: string) => void;
  setActivePlan: (id: string | null) => void;
  swapPlanExercise: (
    planId: string,
    dayOfWeek: number,
    muscleGroup: MuscleGroupId,
    oldExerciseId: string,
    newExerciseId: string
  ) => void;
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

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      exercises: buildDefaultExercises(),
      plans: [],
      activePlanId: null,
      logs: {},
      weightUnit: "lbs",
      profile: emptyProfile,
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
            targets: p.targets.map((t) => ({
              ...t,
              exerciseIds: t.exerciseIds.filter((eid) => eid !== id),
            })),
          })),
        }));
      },

      createPlan: ({ name, startDate, durationWeeks, targets }) => {
        const weeks = Math.min(Math.max(1, durationWeeks), CURRENT_PLAN_WEEKS_CAP);
        const { weeklyTemplate, schedule } = generateSchedule(targets, startDate, weeks);
        const plan: Plan = {
          id: makeId("plan"),
          name: name.trim() || "Untitled Plan",
          startDate,
          durationWeeks: weeks,
          targets,
          weeklyTemplate,
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

      swapPlanExercise: (planId, dayOfWeek, muscleGroup, oldExerciseId, newExerciseId) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;

            const dayEntries = p.weeklyTemplate[dayOfWeek] ?? [];
            const updatedDayEntries = dayEntries.map((entry) => {
              if (entry.muscleGroup !== muscleGroup) return entry;
              if (entry.exerciseIds.includes(newExerciseId)) return entry;
              return {
                ...entry,
                exerciseIds: entry.exerciseIds.map((id) =>
                  id === oldExerciseId ? newExerciseId : id
                ),
              };
            });

            const weeklyTemplate = { ...p.weeklyTemplate, [dayOfWeek]: updatedDayEntries };
            const schedule = buildScheduleFromTemplate(weeklyTemplate, p.startDate, p.durationWeeks);

            return { ...p, weeklyTemplate, schedule };
          }),
        }));
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
        const { exercises, plans, activePlanId, logs, weightUnit, profile } = get();
        const payload = {
          version: 2,
          exportedAt: new Date().toISOString(),
          data: { exercises, plans, activePlanId, logs, weightUnit, profile },
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
          const plans: Plan[] = data.plans.map((p: Plan) => ({
            ...p,
            targets: (p.targets ?? []).map((t: PlanTarget) => ({
              ...t,
              setsPerExercise: t.setsPerExercise ?? 3,
            })),
            weeklyTemplate: p.weeklyTemplate ?? buildWeeklyTemplate(p.targets ?? []),
          }));
          set({
            exercises: data.exercises,
            plans,
            activePlanId: data.activePlanId ?? null,
            logs: data.logs ?? {},
            weightUnit: data.weightUnit === "kg" ? "kg" : "lbs",
            profile: { ...emptyProfile, ...(data.profile ?? {}) },
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
        });
      },
    }),
    {
      name: "amozzy-workouts-data",
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<StoreState> | undefined;
        if (!state) return state;

        const plans = (state.plans ?? []).map((p) => {
          const targets = (p.targets ?? []).map((t: PlanTarget) => ({
            ...t,
            setsPerExercise: t.setsPerExercise ?? 3,
          }));
          return {
            ...p,
            targets,
            weeklyTemplate: p.weeklyTemplate ?? buildWeeklyTemplate(targets),
          };
        });

        return { ...state, plans, profile: state.profile ?? emptyProfile };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
