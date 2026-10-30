"use client";

import { useMemo, useState } from "react";
import { addDays, format, formatISO, subDays } from "date-fns";
import {
  Check,
  ChevronDown,
  Compass,
  Download,
  Dumbbell,
  Moon,
  PersonStanding,
  Pencil,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Sun,
  Trash2,
  Upload,
  Waves,
  Weight,
} from "lucide-react";
import {
  EQUIPMENT_LABELS,
  MUSCLE_GROUPS,
  buildDefaultExercises,
  muscleGroupColor,
  muscleGroupLabel,
} from "@/lib/muscleGroups";
import { EXERCISE_LIBRARY } from "@/lib/exerciseLibraryData";
import { SPLIT_PRESET_TYPES } from "@/lib/splitPresets";
import {
  buildScheduleFromDaySequence,
  evenlySpacedIndices,
  materializeDaySequence,
} from "@/lib/schedule";
import { computeCurrentStreak } from "@/lib/streak";
import { ACCENT_PRESETS, AccentColorId, ThemeMode, themeCssVars } from "@/lib/theme";
import { DaySlot, EquipmentType, LoggedSet, MuscleGroupId, Plan } from "@/lib/types";
import Calendar from "@/components/Calendar";
import ProgressChart from "@/components/ProgressChart";
import { LibraryExerciseCard } from "@/components/settings/DiscoverExercises";
import MuscleGroupExercisePicker from "@/components/settings/MuscleGroupExercisePicker";
import CustomSplitConfig from "@/components/settings/CustomSplitConfig";
import { GroupSelections } from "@/components/settings/planBuilderTypes";
import { PhoneFrame, Pin, Spot, TABS, TabId } from "./mock";

const INPUT =
  "rounded-lg border border-base-700 bg-base-950 px-2.5 py-1.5 text-[13px] text-base-100 outline-none focus:border-accent-400/60";

/* ------------------------------------------------------------------ */
/* Welcome: the four tabs                                              */
/* ------------------------------------------------------------------ */

const TAB_COPY: Record<TabId, { title: string; text: string }> = {
  home: {
    title: "Home",
    text: "Today's workout. Work down the list and log each set as you finish it.",
  },
  calendar: {
    title: "Calendar",
    text: "Your whole plan at a glance — colored dots for what's scheduled, checkmarks for finished days.",
  },
  progress: {
    title: "Progress",
    text: "Charts of every lift, your cardio sessions, and your bodyweight over time.",
  },
  settings: {
    title: "Settings",
    text: "Your exercises, workout plan, look & feel, and backups. You're here right now.",
  },
};

export function WelcomeScreen() {
  const [tab, setTab] = useState<TabId>("home");
  const info = TAB_COPY[tab];
  const Icon = TABS.find((t) => t.id === tab)!.icon;

  return (
    <PhoneFrame active={tab} onTab={setTab} tabPins>
      <div className="flex min-h-[210px] flex-col items-center justify-center rounded-2xl border border-base-700/60 bg-base-900/60 p-5 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-400/15 text-accent-400">
          <Icon size={24} />
        </div>
        <p className="mt-3 text-[16px] font-bold text-base-50">{info.title}</p>
        <p className="mt-1.5 max-w-[250px] text-[12.5px] leading-relaxed text-base-400">{info.text}</p>
      </div>
    </PhoneFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Exercises                                                           */
/* ------------------------------------------------------------------ */

const EQUIP_ICONS: Record<EquipmentType, typeof Weight> = {
  barbell: Weight,
  dumbbell: Dumbbell,
  bodyweight: PersonStanding,
  band: Waves,
  cardio: Weight,
};
const EQUIP_ORDER: EquipmentType[] = ["barbell", "dumbbell", "bodyweight", "band"];
const EQUIP_HELP: Partial<Record<EquipmentType, string>> = {
  barbell: "Log the total weight lifted.",
  dumbbell: "Log the weight of one dumbbell — PRISM assumes a matching pair.",
  bodyweight: "No weight to log — just reps.",
  band: "No measurable resistance — log reps, effort (RPE), and optionally which band you used.",
};

export function ExercisesScreen() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [equip, setEquip] = useState<EquipmentType>("barbell");
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<string[]>([]);
  const EquipIcon = EQUIP_ICONS[equip];

  const add = () => {
    if (!draft.trim()) return;
    setExtra((p) => [...p, draft.trim()]);
    setDraft("");
  };

  return (
    <PhoneFrame active="settings">
      <Spot n={1}>
        <div className="flex items-center justify-between rounded-xl border border-base-700/60 bg-base-900/40 px-3.5 py-3">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-accent-400" />
            <span className="text-[13.5px] font-medium text-base-100">Discover more exercises</span>
          </div>
          <ChevronDown size={16} className="text-base-500" />
        </div>
      </Spot>

      <Spot n={2}>
        <div className="flex items-center justify-between rounded-xl border border-base-700/60 bg-base-900/40 px-3.5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: muscleGroupColor("cardio") }} />
            <span className="text-[13.5px] font-medium text-base-100">Cardio</span>
            <span className="text-[11.5px] text-base-500">3</span>
          </div>
          <ChevronDown size={16} className="text-base-500" />
        </div>
      </Spot>

      <div className="rounded-xl border border-base-700/60 bg-base-900/40">
        <div className="flex items-center justify-between px-3.5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: muscleGroupColor("chest") }} />
            <span className="text-[13.5px] font-medium text-base-100">Chest</span>
            <span className="text-[11.5px] text-base-500">{2 + extra.length}</span>
          </div>
          <ChevronDown size={16} className="rotate-180 text-base-500" />
        </div>

        <div className="space-y-1.5 border-t border-base-700/60 px-3 py-3">
          <div className="rounded-lg bg-base-800/60 px-2.5 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] text-base-100">
                Bench Press
                <span className="ml-1.5 text-[10.5px] font-normal text-base-500">
                  {EQUIPMENT_LABELS[equip]}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <Spot n={3} pulse={!panelOpen} pos="top-left">
                  <button
                    onClick={() => setPanelOpen((v) => !v)}
                    className={[
                      "rounded-md p-1 hover:bg-base-700",
                      panelOpen ? "text-accent-400" : "text-base-500 hover:text-base-100",
                    ].join(" ")}
                    aria-label="Equipment type"
                  >
                    <EquipIcon size={13} />
                  </button>
                </Spot>
                <span className="rounded-md p-1 text-base-500">
                  <Pencil size={13} />
                </span>
                <span className="rounded-md p-1 text-base-500">
                  <Trash2 size={13} />
                </span>
              </div>
            </div>

            {panelOpen && (
              <div className="mt-1.5 rounded-md border border-base-700/60 bg-base-900/60 p-2">
                <p className="mb-1.5 flex items-center gap-1 text-[10.5px] font-medium uppercase tracking-wide text-base-500">
                  <SlidersHorizontal size={11} />
                  Equipment
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {EQUIP_ORDER.map((eq) => {
                    const I = EQUIP_ICONS[eq];
                    return (
                      <button
                        key={eq}
                        onClick={() => setEquip(eq)}
                        className={[
                          "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11.5px] font-medium transition-colors",
                          equip === eq
                            ? "bg-accent-400 text-base-950"
                            : "bg-base-800 text-base-400 hover:text-base-100",
                        ].join(" ")}
                      >
                        <I size={12} />
                        {EQUIPMENT_LABELS[eq]}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[10.5px] leading-snug text-base-500">{EQUIP_HELP[equip]}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-base-800/60 px-2.5 py-1.5">
            <span className="text-[13px] text-base-100">
              Push-Ups
              <span className="ml-1.5 text-[10.5px] font-normal text-base-500">Bodyweight</span>
            </span>
          </div>

          {extra.map((n, i) => (
            <div key={`${n}-${i}`} className="rounded-lg bg-base-800/60 px-2.5 py-1.5">
              <span className="text-[13px] text-base-100">
                {n}
                <span className="ml-1.5 text-[10.5px] font-normal text-base-500">Barbell</span>
              </span>
            </div>
          ))}

          <Spot n={4} pos="top-left" className="pt-1">
            <div className="flex items-center gap-1.5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add()}
                placeholder="Add exercise…"
                className={`flex-1 ${INPUT}`}
              />
              <button
                onClick={add}
                className="flex items-center gap-1 rounded-lg bg-accent-400 px-2.5 py-1.5 text-[12px] font-semibold text-base-950 hover:bg-accent-300"
              >
                <Plus size={13} strokeWidth={2.5} />
                Add
              </button>
            </div>
          </Spot>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Discover                                                            */
/* ------------------------------------------------------------------ */

export function DiscoverScreen() {
  const exercise = EXERCISE_LIBRARY.find((e) => e.id === "lib-bw-squat")!;
  const [fav, setFav] = useState(false);
  const [later, setLater] = useState(false);

  return (
    <PhoneFrame active="settings">
      <div className="rounded-xl border border-base-700/60 bg-base-900/40 p-3">
        <Spot n={1}>
          <div className="flex gap-1 rounded-full bg-base-800 p-1">
            {["Browse", `Favorites (${fav ? 1 : 0})`, `Try Later (${later ? 1 : 0})`].map((t, i) => (
              <span
                key={t}
                className={[
                  "flex-1 rounded-full py-1.5 text-center text-[11px] font-medium",
                  i === 0 ? "bg-accent-400 text-base-950" : "text-base-400",
                ].join(" ")}
              >
                {t}
              </span>
            ))}
          </div>
        </Spot>

        <Spot n={2} className="mt-3">
          <div className="flex flex-wrap gap-1">
            {MUSCLE_GROUPS.slice(0, 7).map((mg) => (
              <span
                key={mg.id}
                className={[
                  "rounded-full px-2.5 py-1 text-[11px] font-medium",
                  mg.id === "quads" ? "bg-accent-400 text-base-950" : "bg-base-800 text-base-400",
                ].join(" ")}
              >
                {mg.label}
              </span>
            ))}
            <span className="rounded-full bg-base-800 px-2.5 py-1 text-[11px] font-medium text-base-400">
              …
            </span>
          </div>
        </Spot>

        <div className="relative mt-3">
          <LibraryExerciseCard
            exercise={exercise}
            isFavorite={fav}
            isTryLater={later}
            onToggleFavorite={() => setFav((v) => !v)}
            onToggleTryLater={() => setLater((v) => !v)}
          />
          <div className="pointer-events-none absolute -top-2.5 right-2 z-10">
            <Pin n={3} />
          </div>
          <div className="pointer-events-none absolute -bottom-2.5 right-2 z-10">
            <Pin n={4} pulse />
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Plan builder                                                        */
/* ------------------------------------------------------------------ */

type SplitId = "ppl" | "upper_lower" | "custom";

const SPLITS: { id: SplitId; label: string; description: string }[] = [
  { id: "ppl", label: "Push / Pull / Legs", description: "Classic 3-way rotation" },
  { id: "upper_lower", label: "Upper / Lower", description: "2-way rotation" },
  { id: "custom", label: "Build your own", description: "Day-by-day, your call" },
];

export function PlanScreen() {
  const exercises = useMemo(() => buildDefaultExercises(), []);
  const [split, setSplit] = useState<SplitId>("ppl");
  const [rest, setRest] = useState(2);
  const [chest, setChest] = useState<GroupSelections["chest"]>({
    exerciseIds: [],
    setsPerExercise: 3,
    warmupSets: 1,
  });

  const presetTypes = split === "custom" ? null : SPLIT_PRESET_TYPES[split];
  const preview: string[] = [];
  if (presetTypes) {
    const cycleLength = presetTypes.length + rest;
    const restIdx = new Set(evenlySpacedIndices(rest, cycleLength));
    let cursor = 0;
    for (let i = 0; i < cycleLength; i++) {
      if (restIdx.has(i)) preview.push("Rest");
      else preview.push(presetTypes[cursor++].label);
    }
  }

  const c = chest ?? { exerciseIds: [], setsPerExercise: 3, warmupSets: 1 };

  return (
    <PhoneFrame active="settings">
      <div className="rounded-xl border border-base-700/60 bg-base-900/40 p-3">
        <Spot n={1} pos="right">
          <div className="grid grid-cols-2 gap-2">
            <label className="col-span-2 flex flex-col gap-1">
              <span className="text-[11px] font-medium text-base-400">Plan name</span>
              <input readOnly value="Fall Strength Block" className={INPUT} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-base-400">Start date</span>
              <input readOnly value={format(new Date(), "MM/dd/yyyy")} className={INPUT} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-base-400">Duration (weeks)</span>
              <input readOnly value="8" className={INPUT} />
            </label>
          </div>
        </Spot>

        <p className="mb-1.5 mt-3 text-[11px] font-medium text-base-400">Workout split</p>
        <Spot n={2} pulse pos="right">
          <div className="grid grid-cols-3 gap-1.5">
            {SPLITS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSplit(s.id)}
                className={[
                  "flex flex-col items-center gap-0.5 rounded-lg border p-2 text-center transition-colors",
                  split === s.id
                    ? "border-accent-400/60 bg-accent-400/10"
                    : "border-base-700/60 hover:border-base-600",
                ].join(" ")}
              >
                <span className="text-[11px] font-medium text-base-100">{s.label}</span>
                <span className="text-[9.5px] text-base-500">{s.description}</span>
              </button>
            ))}
          </div>
        </Spot>

        {presetTypes ? (
          <div className="mt-3 space-y-3">
            <Spot n={3} pos="right">
              <div className="rounded-lg border border-base-700/60 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-base-100">Rest days per cycle</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setRest((n) => Math.max(0, n - 1))}
                      className="rounded-md bg-base-800 px-2 py-0.5 text-[13px] text-base-300 hover:bg-base-700"
                    >
                      −
                    </button>
                    <span className="w-4 text-center text-[12.5px] text-base-200">{rest}</span>
                    <button
                      onClick={() => setRest((n) => Math.min(6, n + 1))}
                      className="rounded-md bg-base-800 px-2 py-0.5 text-[13px] text-base-300 hover:bg-base-700"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {preview.map((label, i) => (
                    <span
                      key={i}
                      className={[
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        label === "Rest"
                          ? "bg-base-800 text-base-500"
                          : "bg-accent-400/15 text-accent-400",
                      ].join(" ")}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-base-500">
                  This {preview.length}-day pattern repeats continuously — it doesn't reset every
                  Sunday.
                </p>
              </div>
            </Spot>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-base-500">
                {presetTypes[0].label}
              </p>
              <Spot n={4} pos="right">
                <MuscleGroupExercisePicker
                  muscleGroup="chest"
                  label="Chest"
                  color={muscleGroupColor("chest")}
                  exercises={exercises}
                  exerciseIds={c.exerciseIds}
                  setsPerExercise={c.setsPerExercise}
                  warmupSets={c.warmupSets}
                  onToggleExercise={(id) =>
                    setChest({
                      ...c,
                      exerciseIds: c.exerciseIds.includes(id)
                        ? c.exerciseIds.filter((x) => x !== id)
                        : [...c.exerciseIds, id],
                    })
                  }
                  onSetsChange={(d) =>
                    setChest({ ...c, setsPerExercise: Math.min(10, Math.max(1, c.setsPerExercise + d)) })
                  }
                  onWarmupChange={(d) =>
                    setChest({ ...c, warmupSets: Math.min(5, Math.max(0, c.warmupSets + d)) })
                  }
                />
              </Spot>
              <p className="text-center text-[11px] text-base-500">
                …and the same for every other muscle group in this day
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-base-700 p-3 text-center text-[12px] text-base-400">
            You design the cycle yourself, one day at a time — see the next step.
          </div>
        )}

        <Spot n={5} pos="right" className="mt-4">
          <div className="w-full rounded-lg bg-accent-400 py-2.5 text-center text-[13px] font-semibold text-base-950">
            Create &amp; activate plan
          </div>
        </Spot>
      </div>
    </PhoneFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Cardio in the plan builder (the real "Build your own" editor)        */
/* ------------------------------------------------------------------ */

export function CardioScreen() {
  const exercises = useMemo(() => buildDefaultExercises(), []);
  const [slots, setSlots] = useState<GroupSelections[]>(() => {
    const id = (name: string) => exercises.find((e) => e.name === name)!.id;
    return [
      { cardio: { exerciseIds: [id("Jogging")], setsPerExercise: 1, warmupSets: 0 } },
      {
        chest: { exerciseIds: [id("Bench Press")], setsPerExercise: 3, warmupSets: 1 },
        cardio: { exerciseIds: [id("Elliptical")], setsPerExercise: 1, warmupSets: 0 },
      },
    ];
  });

  return (
    <PhoneFrame active="settings">
      <CustomSplitConfig slots={slots} onChange={setSlots} exercises={exercises} />
    </PhoneFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Calendar (the real calendar component with demo data)                */
/* ------------------------------------------------------------------ */

export function CalendarScreen() {
  const today = useMemo(() => new Date(), []);
  const todayISO = formatISO(today, { representation: "date" });
  const [selected, setSelected] = useState(todayISO);

  const { plan, completed, logs } = useMemo(() => {
    const startDate = formatISO(subDays(today, 12), { representation: "date" });
    const slot = (groups: MuscleGroupId[]): DaySlot =>
      groups.map((mg) => ({ muscleGroup: mg, exerciseIds: [`demo-${mg}`], setsPerExercise: 3 }));
    const cycle: DaySlot[] = [
      slot(["chest", "shoulders", "triceps"]),
      slot(["back", "biceps"]),
      slot(["quads", "hamstrings", "glutes"]),
      [],
      slot(["cardio"]),
    ];
    const daySequence = materializeDaySequence(cycle, 90);
    const schedule = buildScheduleFromDaySequence(daySequence, startDate);
    const plan: Plan = {
      id: "demo",
      name: "Demo",
      startDate,
      durationWeeks: 13,
      splitStyle: "custom",
      restDaysPerCycle: 1,
      daySequence,
      schedule,
      createdAt: today.toISOString(),
    };

    const completed = new Set<string>();
    for (let i = 12; i >= 1; i--) {
      const d = formatISO(subDays(today, i), { representation: "date" });
      if (schedule[d] && i !== 6) completed.add(d);
    }

    const logs: Record<string, LoggedSet[]> = {};
    const restDay = formatISO(addDays(new Date(startDate + "T12:00:00"), 3), { representation: "date" });
    logs[restDay] = [
      {
        id: "demo-set",
        exerciseId: "demo",
        weight: 0,
        reps: 30,
        setNumber: 1,
        loggedAt: new Date().toISOString(),
      },
    ];
    return { plan, completed, logs };
  }, [today]);

  const streak = useMemo(
    () => computeCurrentStreak(plan.schedule, Array.from(completed), todayISO),
    [plan, completed, todayISO]
  );

  const day = plan.schedule[selected];

  return (
    <PhoneFrame active="calendar">
      <Calendar
        selectedDate={selected}
        onSelect={setSelected}
        activePlan={plan}
        logs={logs}
        completedDates={completed}
        streak={streak}
      />
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-base-100">
          {format(new Date(selected + "T12:00:00"), "EEEE, MMM d")}
        </h3>
        <div className="flex gap-1.5">
          {day ? (
            day.muscleGroups.map((mg) => (
              <span
                key={mg}
                className="rounded-full px-2 py-0.5 text-[10.5px] font-medium"
                style={{ backgroundColor: `${muscleGroupColor(mg)}22`, color: muscleGroupColor(mg) }}
              >
                {muscleGroupLabel(mg)}
              </span>
            ))
          ) : (
            <span className="text-[11.5px] text-base-500">Rest day</span>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Progress                                                            */
/* ------------------------------------------------------------------ */

interface DemoEx {
  name: string;
  kind: "weighted" | "reps" | "cardio";
  values: number[];
  volume?: number[];
}

const DEMO_PROGRESS: Partial<Record<MuscleGroupId, DemoEx[]>> = {
  cardio: [
    { name: "Jogging", kind: "cardio", values: [20, 25, 25, 30, 35, 40] },
    { name: "Walking", kind: "cardio", values: [30, 30, 40, 45, 45, 60] },
    { name: "Elliptical", kind: "cardio", values: [20, 20, 25, 30, 30, 30] },
  ],
  chest: [
    {
      name: "Bench Press",
      kind: "weighted",
      values: [165, 170, 172, 178, 183, 190],
      volume: [3600, 4000, 3900, 4400, 4600, 5000],
    },
    { name: "Push-Ups", kind: "reps", values: [18, 20, 20, 22, 24, 25] },
  ],
  back: [
    { name: "Pull-Ups", kind: "reps", values: [6, 7, 8, 8, 9, 10] },
    {
      name: "Barbell Row",
      kind: "weighted",
      values: [135, 140, 145, 150, 155, 160],
      volume: [3200, 3300, 3500, 3600, 3800, 3900],
    },
  ],
  quads: [
    {
      name: "Back Squat",
      kind: "weighted",
      values: [185, 190, 200, 205, 215, 225],
      volume: [4200, 4300, 4700, 4800, 5100, 5400],
    },
  ],
};

export function ProgressScreen() {
  const groups = Object.keys(DEMO_PROGRESS) as MuscleGroupId[];
  const [group, setGroup] = useState<MuscleGroupId>("chest");
  const [exName, setExName] = useState("Bench Press");
  const [metric, setMetric] = useState<"e1rm" | "volume">("e1rm");

  const list = DEMO_PROGRESS[group] ?? [];
  const ex = list.find((e) => e.name === exName) ?? list[0];

  const points = useMemo(() => {
    const offsets = [15, 12, 9, 6, 3, 0];
    const src = ex.kind === "weighted" && metric === "volume" ? ex.volume! : ex.values;
    return src.map((value, i) => ({
      date: formatISO(subDays(new Date(), offsets[i]), { representation: "date" }),
      value,
    }));
  }, [ex, metric]);

  const best = Math.max(...ex.values);
  const delta = best - ex.values[0];
  const firstDate = format(subDays(new Date(), 15), "MMM d");

  return (
    <PhoneFrame active="progress">
      <div>
        <p className="mb-1.5 text-[10.5px] font-medium uppercase tracking-wide text-base-500">
          Muscle group
        </p>
        <Spot n={1} pulse pos="right">
          <div className="flex flex-wrap gap-1 pr-4">
            {groups.map((mg) => (
              <button
                key={mg}
                onClick={() => {
                  setGroup(mg);
                  setExName(DEMO_PROGRESS[mg]![0].name);
                  setMetric("e1rm");
                }}
                className={[
                  "rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                  group === mg
                    ? "bg-accent-400 text-base-950"
                    : "bg-base-800 text-base-400 hover:text-base-100",
                ].join(" ")}
              >
                {muscleGroupLabel(mg)}
              </button>
            ))}
          </div>
        </Spot>
      </div>

      <div>
        <p className="mb-1.5 text-[10.5px] font-medium uppercase tracking-wide text-base-500">
          Exercise
        </p>
        <Spot n={2} pos="right">
          <div className="flex flex-wrap gap-1.5 pr-4">
            {list.map((e) => (
              <button
                key={e.name}
                onClick={() => {
                  setExName(e.name);
                  setMetric("e1rm");
                }}
                className={[
                  "rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                  ex.name === e.name
                    ? "bg-accent-400 text-base-950"
                    : "bg-base-800 text-base-400 hover:text-base-100",
                ].join(" ")}
              >
                {e.name}
              </button>
            ))}
          </div>
        </Spot>
      </div>

      <div className="rounded-2xl border border-base-700/60 bg-base-900/60 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-base-100">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: muscleGroupColor(group) }}
              />
              {ex.name}
            </p>
            <Spot n={3} pos="right" className="pr-5">
              {ex.kind === "weighted" && (
                <p className="mt-0.5 text-[11.5px] text-base-500">
                  Est. 1RM: {best}lbs{" "}
                  <span className="text-accent-400">
                    +{delta}lbs since {firstDate}
                  </span>
                </p>
              )}
              {ex.kind === "reps" && (
                <p className="mt-0.5 text-[11.5px] text-base-500">Best set: {best} reps</p>
              )}
              {ex.kind === "cardio" && (
                <p className="mt-0.5 text-[11.5px] text-base-500">Longest session: {best} min</p>
              )}
            </Spot>
          </div>
          {ex.kind === "weighted" && (
            <Spot n={4} pos="top-left">
              <div className="flex shrink-0 gap-1 rounded-full bg-base-800 p-0.5">
                {(["e1rm", "volume"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetric(m)}
                    className={[
                      "whitespace-nowrap rounded-full px-2 py-1 text-[10.5px] font-medium transition-colors",
                      metric === m ? "bg-accent-400 text-base-950" : "text-base-400",
                    ].join(" ")}
                  >
                    {m === "e1rm" ? "Est. 1RM" : "Volume"}
                  </button>
                ))}
              </div>
            </Spot>
          )}
        </div>
        <Spot n={5} pos="right" className="mt-3">
          <ProgressChart
            key={`${ex.name}-${metric}`}
            points={points}
            unit={ex.kind === "weighted" && metric === "e1rm" ? "lbs" : ""}
          />
        </Spot>
      </div>
    </PhoneFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Customize (live preview scoped to the phone — your real theme is     */
/* never touched)                                                       */
/* ------------------------------------------------------------------ */

export function CustomizeScreen() {
  const [name, setName] = useState("PRISM");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [accent, setAccent] = useState<AccentColorId>("green");

  const vars = useMemo(() => themeCssVars(theme, accent) as React.CSSProperties, [theme, accent]);

  return (
    <PhoneFrame active="settings" name={name || "PRISM"} style={vars}>
      <section className="rounded-xl border border-base-700/60 bg-base-900/40 p-3">
        <Spot n={1} pos="right">
          <p className="text-[13px] font-semibold text-base-100">App name</p>
        </Spot>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="PRISM"
          className={`mt-2 w-full ${INPUT}`}
        />
      </section>

      <section className="rounded-xl border border-base-700/60 bg-base-900/40 p-3">
        <Spot n={2} pos="right">
          <p className="text-[13px] font-semibold text-base-100">Appearance</p>
        </Spot>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {(
            [
              ["dark", "Dark", Moon],
              ["light", "Light", Sun],
            ] as const
          ).map(([id, label, I]) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={[
                "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-medium transition-colors",
                theme === id
                  ? "bg-accent-400 text-base-950"
                  : "bg-base-800 text-base-400 hover:text-base-100",
              ].join(" ")}
            >
              <I size={14} />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-base-700/60 bg-base-900/40 p-3">
        <Spot n={3} pos="right" pulse>
          <p className="text-[13px] font-semibold text-base-100">Accent color</p>
        </Spot>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {ACCENT_PRESETS.map((preset) => {
            const selected = accent === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setAccent(preset.id)}
                className="flex flex-col items-center gap-1"
                aria-label={preset.label}
              >
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-base-900 transition-shadow",
                    selected ? "ring-base-100" : "ring-transparent",
                  ].join(" ")}
                  style={{ backgroundColor: preset.swatch }}
                >
                  {selected && <Check size={14} strokeWidth={3} className="text-base-950" />}
                </span>
                <span className="text-[10px] text-base-500">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <p className="text-center text-[11px] text-base-500">
        Preview only — your real theme isn't changed here.
      </p>
    </PhoneFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

export function DataScreen() {
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");
  const [msg, setMsg] = useState("");
  const [spin, setSpin] = useState(false);

  const demo = (text: string) => {
    setMsg(text);
    window.setTimeout(() => setMsg(""), 2200);
  };

  return (
    <PhoneFrame active="settings">
      <section className="rounded-xl border border-base-700/60 bg-base-900/40 p-3">
        <Spot n={1} pos="right">
          <p className="text-[13px] font-semibold text-base-100">Weight unit</p>
        </Spot>
        <div className="mt-2 flex gap-1.5">
          {(["lbs", "kg"] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={[
                "rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                unit === u ? "bg-accent-400 text-base-950" : "bg-base-800 text-base-400 hover:text-base-100",
              ].join(" ")}
            >
              {u}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-base-700/60 bg-base-900/40 p-3">
        <Spot n={2} pos="right">
          <p className="text-[13px] font-semibold text-base-100">Your stats</p>
        </Spot>
        <p className="mt-0.5 text-[11.5px] text-base-500">
          Bodyweight and sex power your DOTS strength score on the Progress tab.
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input readOnly value="Male" className={INPUT} />
          <input readOnly value={`168 ${unit}`} className={INPUT} />
        </div>
      </section>

      <section className="rounded-xl border border-base-700/60 bg-base-900/40 p-3">
        <Spot n={3} pos="right">
          <p className="text-[13px] font-semibold text-base-100">Backup your log</p>
        </Spot>
        <p className="mt-0.5 text-[11.5px] text-base-500">
          Everything lives only in this browser's storage — export a backup now and then.
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <button
            onClick={() => demo("Demo only — in the real app this downloads a backup file.")}
            className="flex items-center gap-1.5 rounded-lg bg-accent-400 px-3 py-2 text-[12.5px] font-semibold text-base-950 hover:bg-accent-300"
          >
            <Download size={14} strokeWidth={2.5} />
            Export backup
          </button>
          <button
            onClick={() => demo("Demo only — in the real app this restores from a backup file.")}
            className="flex items-center gap-1.5 rounded-lg bg-base-800 px-3 py-2 text-[12.5px] font-medium text-base-100 hover:bg-base-700"
          >
            <Upload size={14} />
            Import backup
          </button>
        </div>
        {msg && <p className="mt-2 text-[11.5px] text-accent-400">{msg}</p>}
      </section>

      <section className="rounded-xl border border-base-700/60 bg-base-900/40 p-3">
        <Spot n={4} pos="right">
          <p className="text-[13px] font-semibold text-base-100">App updates</p>
        </Spot>
        <button
          onClick={() => {
            setSpin(true);
            window.setTimeout(() => setSpin(false), 1200);
          }}
          className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-base-800 px-3 py-2 text-[12.5px] font-medium text-base-100 hover:bg-base-700"
        >
          <RefreshCw size={14} className={spin ? "animate-spin" : ""} />
          {spin ? "Refreshing…" : "Refresh app data"}
        </button>
      </section>
    </PhoneFrame>
  );
}
