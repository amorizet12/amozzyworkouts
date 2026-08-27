"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppData, Exercise, LoggedSet, MuscleGroupId, Plan, PlanTarget } from "./types";
import { buildDefaultExercises } from "./muscleGroups";
import { generateSchedule } from "./schedule";
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
  logSet: (date: string, exerciseId: string, weight: number, reps: number) => void;
  deleteSet: (date: string, setId: string) => void;
  setWeightUnit: (unit: "lbs" | "kg") => void;
  exportData: () => string;
  importData: (json: string) => { ok: boolean; error?: string };
  clearAllData: () => void;
  setHydrated: () => void;
}

const CURRENT_PLAN_WEEKS_CAP = 52;

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      exercises: buildDefaultExercises(),
      plans: [],
      activePlanId: null,
      logs: {},
      weightUnit: "lbs",
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
        const schedule = generateSchedule(targets, startDate, weeks);
        const plan: Plan = {
          id: makeId("plan"),
          name: name.trim() || "Untitled Plan",
          startDate,
          durationWeeks: weeks,
          targets,
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

      logSet: (date, exerciseId, weight, reps) => {
        set((state) => {
          const existing = state.logs[date] ?? [];
          const setNumber =
            existing.filter((s) => s.exerciseId === exerciseId).length + 1;
          const newSet: LoggedSet = {
            id: makeId("set"),
            exerciseId,
            weight,
            reps,
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

      exportData: () => {
        const { exercises, plans, activePlanId, logs, weightUnit } = get();
        const payload = {
          version: 1,
          exportedAt: new Date().toISOString(),
          data: { exercises, plans, activePlanId, logs, weightUnit },
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
          set({
            exercises: data.exercises,
            plans: data.plans,
            activePlanId: data.activePlanId ?? null,
            logs: data.logs ?? {},
            weightUnit: data.weightUnit === "kg" ? "kg" : "lbs",
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
        });
      },
    }),
    {
      name: "amozzy-workouts-data",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
