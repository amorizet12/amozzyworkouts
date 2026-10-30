"use client";

import { useState } from "react";
import {
  ChevronDown,
  Dumbbell,
  HeartPulse,
  HelpCircle,
  PersonStanding,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
  Waves,
  Weight,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { EQUIPMENT_LABELS, MUSCLE_GROUPS } from "@/lib/muscleGroups";
import { EquipmentType, MuscleGroupId } from "@/lib/types";
import {
  DOTS_EXPLANATION,
  bestEstimatedOneRepMax,
  dotsApplicable,
  dotsLiftWeight,
  dotsScore,
  toKg,
} from "@/lib/strength";
import DiscoverExercises from "./DiscoverExercises";

const EQUIPMENT_ICONS: Record<EquipmentType, typeof Weight> = {
  barbell: Weight,
  dumbbell: Dumbbell,
  bodyweight: PersonStanding,
  band: Waves,
  cardio: HeartPulse,
};

const EQUIPMENT_ORDER: EquipmentType[] = ["barbell", "dumbbell", "bodyweight", "band"];

export default function ExerciseLibrary() {
  const exercises = useStore((s) => s.exercises);
  const [openGroup, setOpenGroup] = useState<MuscleGroupId | null>(MUSCLE_GROUPS[0].id);

  return (
    <div className="space-y-2">
      <DiscoverExercises />
      {MUSCLE_GROUPS.map((mg) => {
        const groupExercises = exercises.filter((e) => e.muscleGroup === mg.id);
        const open = openGroup === mg.id;
        return (
          <div key={mg.id} className="rounded-xl border border-base-700/60 bg-base-900/40">
            <button
              onClick={() => setOpenGroup(open ? null : mg.id)}
              className="flex w-full items-center justify-between px-3.5 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: mg.color }} />
                <span className="text-[13.5px] font-medium text-base-100">{mg.label}</span>
                <span className="text-[11.5px] text-base-500">{groupExercises.length}</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-base-500 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div className="border-t border-base-700/60 px-3.5 py-3">
                <ExerciseList muscleGroup={mg.id} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ExerciseList({ muscleGroup }: { muscleGroup: MuscleGroupId }) {
  const exercises = useStore((s) => s.exercises.filter((e) => e.muscleGroup === muscleGroup));
  const addExercise = useStore((s) => s.addExercise);
  const updateExercise = useStore((s) => s.updateExercise);
  const updateExerciseEquipment = useStore((s) => s.updateExerciseEquipment);
  const updateExercisePerLeg = useStore((s) => s.updateExercisePerLeg);
  const deleteExercise = useStore((s) => s.deleteExercise);
  const logs = useStore((s) => s.logs);
  const weightUnit = useStore((s) => s.weightUnit);
  const profile = useStore((s) => s.profile);

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [equipmentPanelId, setEquipmentPanelId] = useState<string | null>(null);
  const [dotsInfoId, setDotsInfoId] = useState<string | null>(null);

  const isCardioGroup = muscleGroup === "cardio";

  const handleAdd = () => {
    if (!newName.trim()) return;
    addExercise(newName, muscleGroup, isCardioGroup ? "cardio" : "barbell");
    setNewName("");
  };

  return (
    <div className="space-y-1.5">
      {exercises.map((ex) => {
        const e1rm = bestEstimatedOneRepMax(logs, ex.id);
        const dots =
          e1rm != null && dotsApplicable(ex.equipment) && profile.sex && profile.bodyweight
            ? dotsScore(
                toKg(dotsLiftWeight(e1rm, ex.equipment), weightUnit),
                toKg(profile.bodyweight, weightUnit),
                profile.sex
              )
            : null;
        const showWeight = ex.equipment === "barbell" || ex.equipment === "dumbbell";
        const EquipmentIcon = EQUIPMENT_ICONS[ex.equipment];

        return (
          <div key={ex.id} className="rounded-lg bg-base-800/60 px-2.5 py-1.5">
            <div className="flex items-center justify-between gap-2">
              {editingId === ex.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateExercise(ex.id, editValue);
                      setEditingId(null);
                    }
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  onBlur={() => {
                    updateExercise(ex.id, editValue);
                    setEditingId(null);
                  }}
                  className="flex-1 rounded-md border border-accent-400/50 bg-base-950 px-2 py-1 text-[13px] text-base-100 outline-none"
                />
              ) : (
                <span className="text-[13px] text-base-100">
                  {ex.name}
                  <span className="ml-1.5 text-[10.5px] font-normal text-base-500">
                    {EQUIPMENT_LABELS[ex.equipment]}
                  </span>
                </span>
              )}
              <div className="flex items-center gap-1">
                {!isCardioGroup && (
                  <button
                    onClick={() =>
                      setEquipmentPanelId(equipmentPanelId === ex.id ? null : ex.id)
                    }
                    className={[
                      "rounded-md p-1 hover:bg-base-700",
                      equipmentPanelId === ex.id
                        ? "text-accent-400"
                        : "text-base-500 hover:text-base-100",
                    ].join(" ")}
                    aria-label="Equipment type"
                  >
                    <EquipmentIcon size={13} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingId(ex.id);
                    setEditValue(ex.name);
                  }}
                  className="rounded-md p-1 text-base-500 hover:bg-base-700 hover:text-base-100"
                  aria-label="Rename"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => deleteExercise(ex.id)}
                  className="rounded-md p-1 text-base-500 hover:bg-red-500/15 hover:text-red-400"
                  aria-label="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {equipmentPanelId === ex.id && (
              <div className="mt-1.5 rounded-md border border-base-700/60 bg-base-900/60 p-2">
                <p className="mb-1.5 flex items-center gap-1 text-[10.5px] font-medium uppercase tracking-wide text-base-500">
                  <SlidersHorizontal size={11} />
                  Equipment
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {EQUIPMENT_ORDER.map((eq) => {
                    const Icon = EQUIPMENT_ICONS[eq];
                    return (
                      <button
                        key={eq}
                        onClick={() => updateExerciseEquipment(ex.id, eq)}
                        className={[
                          "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11.5px] font-medium transition-colors",
                          ex.equipment === eq
                            ? "bg-accent-400 text-base-950"
                            : "bg-base-800 text-base-400 hover:text-base-100",
                        ].join(" ")}
                      >
                        <Icon size={12} />
                        {EQUIPMENT_LABELS[eq]}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[10.5px] leading-snug text-base-500">
                  {ex.equipment === "dumbbell" &&
                    "Log the weight of one dumbbell — PRISM assumes a matching pair."}
                  {ex.equipment === "barbell" && "Log the total weight lifted."}
                  {ex.equipment === "bodyweight" && "No weight to log — just reps."}
                  {ex.equipment === "band" &&
                    "No measurable resistance — log reps, effort (RPE), and optionally which band you used."}
                </p>
                {ex.equipment === "band" && (
                  <button
                    onClick={() => updateExercisePerLeg(ex.id, !ex.perLeg)}
                    className={[
                      "mt-1.5 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11.5px] font-medium transition-colors",
                      ex.perLeg
                        ? "bg-accent-400/15 text-accent-400"
                        : "bg-base-800 text-base-400 hover:text-base-100",
                    ].join(" ")}
                  >
                    Count reps per leg
                    <span
                      className={[
                        "flex h-4 w-7 items-center rounded-full px-0.5 transition-colors",
                        ex.perLeg ? "justify-end bg-accent-400" : "justify-start bg-base-600",
                      ].join(" ")}
                    >
                      <span className="h-3 w-3 rounded-full bg-base-950" />
                    </span>
                  </button>
                )}
              </div>
            )}

            {(e1rm != null || dots != null) && showWeight && (
              <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-accent-400/80">
                <TrendingUp size={11} />
                Est. 1RM: {e1rm != null ? Math.round(e1rm) : "—"}
                {weightUnit}
                {ex.equipment === "dumbbell" && <span className="text-base-500">/arm</span>}
                {dots != null && (
                  <span className="flex items-center gap-0.5 text-base-500">
                    · DOTS {dots.toFixed(1)}
                    <button
                      onClick={() => setDotsInfoId(dotsInfoId === ex.id ? null : ex.id)}
                      className="text-base-600 hover:text-accent-400"
                      aria-label="What is DOTS?"
                    >
                      <HelpCircle size={11} />
                    </button>
                  </span>
                )}
              </p>
            )}
            {dotsInfoId === ex.id && dots != null && (
              <p className="mt-1 text-[10.5px] leading-snug text-base-500">{DOTS_EXPLANATION}</p>
            )}
          </div>
        );
      })}

      <div className="flex items-center gap-1.5 pt-1">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add exercise…"
          className="flex-1 rounded-lg border border-base-700 bg-base-950 px-2.5 py-1.5 text-[13px] text-base-100 outline-none focus:border-accent-400/60"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 rounded-lg bg-accent-400 px-2.5 py-1.5 text-[12px] font-semibold text-base-950 hover:bg-accent-300"
        >
          <Plus size={13} strokeWidth={2.5} />
          Add
        </button>
      </div>
      <p className="text-[10.5px] text-base-600">
        {isCardioGroup
          ? "Cardio is logged by duration, not weight or sets."
          : "New exercises default to barbell — tap the slider icon on any exercise to change it."}
      </p>
    </div>
  );
}
