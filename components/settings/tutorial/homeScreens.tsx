"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeftRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  Flame,
  Pencil,
  Plus,
  StickyNote,
  Timer,
  Trash2,
  Undo2,
  Wind,
  X,
} from "lucide-react";
import { buildDefaultExercises } from "@/lib/muscleGroups";
import { RPE_SCALE } from "@/lib/strength";
import { AddExtraExercise } from "@/components/DayPanel";
import { PhoneFrame, Spot } from "./mock";

const SUMMARY = "Chest, Shoulders & Triceps";

function DateCard({
  summary = SUMMARY,
  streak = 0,
}: {
  summary?: string;
  streak?: number;
}) {
  const now = new Date();
  return (
    <div className="rounded-2xl border border-base-700/60 bg-base-900/60 p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-base-500">
        {format(now, "EEEE")}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <h3 className="text-[19px] font-bold text-base-50">{format(now, "MMMM d, yyyy")}</h3>
        {streak > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-accent-400/15 px-2 py-0.5 text-[11px] font-semibold text-accent-400">
            <Flame size={11} />
            {streak}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[13.5px] font-medium text-accent-400">{summary}</p>
    </div>
  );
}

function CompleteButton({
  done,
  time,
  onClick,
}: {
  done: boolean;
  time?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-semibold transition-colors",
        done
          ? "bg-accent-400 text-base-950 hover:bg-accent-300"
          : "border border-base-700 text-base-400 hover:border-accent-400/40 hover:text-accent-400",
      ].join(" ")}
    >
      {done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
      {done ? `Workout complete${time ? ` · ${time}` : ""}` : "Mark as complete"}
    </button>
  );
}

function PushButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-base-700 py-2 text-[12.5px] font-medium text-base-400 hover:border-accent-400/40 hover:text-accent-400"
    >
      <CalendarClock size={14} />
      Push today — I can't work out, use a rest day instead
    </button>
  );
}

function CheckCard({
  icon: Icon,
  title,
  sub,
  done,
  onClick,
}: {
  icon: typeof Flame;
  title: string;
  sub: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors duration-300",
        done ? "border-accent-400/60 bg-accent-400/10" : "border-base-700/60 bg-base-900/40",
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={16} className={done ? "text-accent-400" : "text-base-500"} />
        <div>
          <p className="text-[13px] font-medium text-base-100">{title}</p>
          <p className="text-[11px] text-base-500">{sub}</p>
        </div>
      </div>
      {done ? (
        <CheckCircle2 size={17} className="shrink-0 text-accent-400" />
      ) : (
        <Circle size={17} className="shrink-0 text-base-500" />
      )}
    </button>
  );
}

const INPUT =
  "rounded-lg border border-base-700 bg-base-950 px-2 py-1.5 text-[13px] text-base-100 outline-none focus:border-accent-400/60";

function formatRest(total: number): string {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

interface DemoSet {
  id: number;
  weight: string;
  reps: string;
  rpe: string;
  at: number;
}

/** Log-a-set walkthrough: the Home screen's exercise card, fully interactive. */
export function HomeScreen() {
  const [weight, setWeight] = useState("155");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("8");
  const [sets, setSets] = useState<DemoSet[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (sets.length === 0) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [sets.length]);

  const add = () => {
    const r = parseInt(reps, 10);
    const w = parseFloat(weight);
    if (Number.isNaN(r) || r <= 0 || Number.isNaN(w)) return;
    setSets((prev) => [...prev, { id: Date.now(), weight, reps, rpe, at: Date.now() }]);
    setNow(Date.now());
    setReps("");
  };

  const last = sets[sets.length - 1];
  const restSeconds = last ? Math.max(0, Math.floor((now - last.at) / 1000)) : null;

  return (
    <PhoneFrame active="home">
      <Spot n={1}>
        <DateCard streak={3} />
      </Spot>

      <div className="relative rounded-xl border border-base-700/60 bg-base-900/40 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Spot n={2} pos="right">
              <p className="flex items-center gap-1 text-[13.5px] font-medium text-base-100">
                <span className="text-base-500">1. </span>
                Bench Press
              </p>
              <p className="text-[11px] text-base-500">target: 1 warmup + 3 working sets</p>
            </Spot>
            <Spot n={3} pos="right" className="mt-0.5 pr-5">
              <p className="text-[11.5px] text-base-500">Last: 135lbs×12 (8), 135lbs×10 (9)</p>
            </Spot>
          </div>
          {restSeconds != null && (
            <span className="flex shrink-0 items-center gap-1 text-[11px] text-base-500">
              <Timer size={11} />
              {formatRest(restSeconds)}
            </span>
          )}
        </div>

        {sets.length > 0 && (
          <Spot n={7} pos="top-right" className="mt-2.5">
            <div className="flex flex-wrap gap-1.5">
              {sets.map((s) => (
                <span
                  key={s.id}
                  className="flex items-center gap-1 rounded-full bg-accent-400/12 px-2 py-0.5 text-[11.5px] font-medium text-accent-400"
                >
                  {s.weight}lbs×{s.reps}
                  <span className="opacity-70">RPE {s.rpe}</span>
                  <span className="opacity-50">{format(new Date(s.at), "h:mm:ss a")}</span>
                  <button
                    onClick={() => setSets((prev) => prev.filter((x) => x.id !== s.id))}
                    className="opacity-50 hover:opacity-100"
                    aria-label="Delete set"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          </Spot>
        )}

        <div className="mt-4 flex items-center gap-1.5">
          <Spot n={4} className="flex items-center gap-1.5" pos="top-left">
            <input
              type="number"
              inputMode="decimal"
              placeholder="lbs"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={`w-[68px] ${INPUT}`}
            />
            <span className="text-base-600">×</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              className={`w-14 ${INPUT}`}
            />
          </Spot>
          <Spot n={6} pos="right" className="ml-auto mr-2" pulse={sets.length === 0}>
            <button
              onClick={add}
              className="flex items-center gap-1 rounded-lg bg-accent-400 px-2.5 py-1.5 text-[12px] font-semibold text-base-950 hover:bg-accent-300"
            >
              <Plus size={13} strokeWidth={2.5} />
              Set
            </button>
          </Spot>
        </div>

        <Spot n={5} pos="right" className="mr-2 mt-2">
          <select
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            className={`w-full text-[12px] ${INPUT}`}
          >
            <option value="">Effort (RPE) — not recorded</option>
            {RPE_SCALE.map(({ value, label }) => (
              <option key={value} value={value}>
                {value} - {label}
              </option>
            ))}
          </select>
        </Spot>
      </div>
    </PhoneFrame>
  );
}

const CHEST_ALTS = ["Bench Press", "Push-Ups", "Cable Fly", "Dips"];

/** Notes, Substitute, and Log an exercise. */
export function ExtrasScreen() {
  const exercises = useMemo(() => buildDefaultExercises(), []);
  const [name, setName] = useState("Incline Dumbbell Press");
  const [subOpen, setSubOpen] = useState(false);
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [extraIds, setExtraIds] = useState<string[]>([]);

  const extras = exercises.filter((e) => extraIds.includes(e.id));

  const saveNote = () => {
    setNote(draft.trim());
    setEditing(false);
  };

  return (
    <PhoneFrame active="home">
      <div className="relative rounded-xl border border-base-700/60 bg-base-900/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-[13.5px] font-medium text-base-100">
            <span className="text-base-500">1. </span>
            {name}
          </p>
          <div className="relative">
            <Spot n={2} pos="right" className="pr-1" pulse={!subOpen && name === "Incline Dumbbell Press"}>
              <button
                onClick={() => setSubOpen((v) => !v)}
                className="flex items-center gap-1 text-[10.5px] font-medium text-base-500 hover:text-accent-400"
              >
                <ArrowLeftRight size={11} />
                Substitute
              </button>
            </Spot>
            {subOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-base-700 bg-base-900 p-1.5 shadow-lg">
                <div className="mb-1 flex items-center justify-between px-1">
                  <p className="text-[10.5px] font-medium uppercase tracking-wide text-base-500">
                    Swap for today
                  </p>
                  <button onClick={() => setSubOpen(false)} className="text-base-500">
                    <X size={12} />
                  </button>
                </div>
                {CHEST_ALTS.filter((n) => n !== name).map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setName(n);
                      setSubOpen(false);
                    }}
                    className="block w-full rounded-md px-2 py-1 text-left text-[12px] text-base-100 hover:bg-accent-400/10 hover:text-accent-400"
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2">
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveNote();
                if (e.key === "Escape") setEditing(false);
              }}
              onBlur={saveNote}
              placeholder="Note about this exercise…"
              className="w-full rounded-lg border border-accent-400/50 bg-base-950 px-2 py-1 text-[12px] text-base-100 outline-none"
            />
          ) : note ? (
            <Spot n={1} pos="right">
              <div className="flex items-start gap-1.5 rounded-lg bg-base-800/40 px-2 py-1.5 pr-5">
                <StickyNote size={11} className="mt-0.5 shrink-0 text-base-500" />
                <span className="flex-1 text-[11.5px] italic text-base-400">{note}</span>
                <button
                  onClick={() => {
                    setDraft(note);
                    setEditing(true);
                  }}
                  className="shrink-0 text-base-500 hover:text-accent-400"
                  aria-label="Edit note"
                >
                  <Pencil size={11} />
                </button>
              </div>
            </Spot>
          ) : (
            <Spot n={1} pos="right" className="w-fit pr-5" pulse>
              <button
                onClick={() => {
                  setDraft("");
                  setEditing(true);
                }}
                className="flex items-center gap-1 text-[10.5px] font-medium text-base-500 hover:text-accent-400"
              >
                <StickyNote size={11} />
                Add note
              </button>
            </Spot>
          )}
        </div>
      </div>

      {extras.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-base-500">
            Also logged today
          </p>
          {extras.map((ex, i) => {
            const row = (
              <div className="rounded-xl border border-base-700/60 bg-base-900/40 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13.5px] font-medium text-base-100">
                    <span className="text-base-500">{i + 2}. </span>
                    {ex.name}
                  </p>
                  <button
                    onClick={() => setExtraIds((prev) => prev.filter((id) => id !== ex.id))}
                    className="text-base-500 hover:text-red-400"
                    title="Remove this exercise from today"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
            return i === 0 ? (
              <Spot key={ex.id} n={4} pos="top-left">
                {row}
              </Spot>
            ) : (
              <div key={ex.id}>{row}</div>
            );
          })}
        </div>
      )}

      <Spot n={3} pos="top-left" pulse={extras.length === 0}>
        <AddExtraExercise
          exercises={exercises}
          excludeIds={new Set()}
          onAdd={(id) => setExtraIds((prev) => (prev.includes(id) ? prev : [...prev, id]))}
        />
      </Spot>
    </PhoneFrame>
  );
}

/** Push today → rest day → still log something → reset. */
export function PushScreen() {
  const [pushed, setPushed] = useState(false);

  const strip = pushed
    ? ["Rest", "Push", "Pull", "Legs"]
    : ["Push", "Pull", "Legs", "Rest"];
  const days = ["Today", "Tomorrow", "Day 3", "Day 4"];

  return (
    <PhoneFrame active="home">
      <DateCard summary={pushed ? "Rest day" : SUMMARY} />

      <div className="grid grid-cols-4 gap-1.5">
        {strip.map((label, i) => (
          <div
            key={`${label}-${i}`}
            className={[
              "rounded-lg border px-1 py-1.5 text-center transition-colors",
              label === "Rest"
                ? "border-base-700/60 bg-base-900/40 text-base-500"
                : "border-accent-400/30 bg-accent-400/10 text-accent-400",
              i === 0 ? "ring-1 ring-accent-400/50" : "",
            ].join(" ")}
          >
            <p className="text-[9.5px] text-base-500">{days[i]}</p>
            <p className="text-[11.5px] font-semibold">{label}</p>
          </div>
        ))}
      </div>

      {!pushed ? (
        <>
          <CompleteButton done={false} />
          <Spot n={1} pulse pos="top-left">
            <PushButton onClick={() => setPushed(true)} />
          </Spot>
          <div className="rounded-xl border border-base-700/60 bg-base-900/40 p-3">
            <p className="text-[13.5px] font-medium text-base-100">
              <span className="text-base-500">1. </span>Bench Press
              <span className="ml-1 text-[11px] font-normal text-base-500">
                target: 3 working sets
              </span>
            </p>
          </div>
        </>
      ) : (
        <>
          <Spot n={2} pulse pos="top-left">
            <button
              onClick={() => setPushed(false)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-accent-400/40 py-2 text-[12.5px] font-medium text-accent-400 hover:border-accent-400/70"
            >
              <Undo2 size={14} />
              I plan on working out today — reset push day
            </button>
          </Spot>
          <Spot n={3} pos="top-left">
            <div className="rounded-xl border border-dashed border-base-700 px-4 py-5 text-center text-[13px] text-base-400">
              Rest day. No scheduled muscle groups — but you can still log an exercise below.
            </div>
          </Spot>
          <Spot n={4} pos="top-left">
            <div className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-base-700 py-2.5 text-[13px] font-medium text-base-400">
              <Plus size={14} />
              Log an exercise
            </div>
          </Spot>
        </>
      )}
    </PhoneFrame>
  );
}

/** Mark as complete (timestamp + streak), warm-up and cool-down. */
export function CompleteScreen() {
  const [done, setDone] = useState(false);
  const [time, setTime] = useState("");
  const [warm, setWarm] = useState(false);
  const [cool, setCool] = useState(false);

  const toggle = () => {
    if (!done) setTime(format(new Date(), "h:mm:ss a"));
    setDone((d) => !d);
  };

  return (
    <PhoneFrame active="home">
      <Spot n={1}>
        <DateCard streak={done ? 4 : 3} />
      </Spot>
      <Spot n={2} pulse={!done} pos="top-left">
        <CompleteButton done={done} time={time} onClick={toggle} />
      </Spot>
      <Spot n={3} pos="top-right">
        <CheckCard
          icon={Flame}
          title="Warm-up"
          sub="5–10 min general + dynamic stretching"
          done={warm}
          onClick={() => setWarm((v) => !v)}
        />
      </Spot>
      <div className="rounded-xl border border-base-700/60 bg-base-900/40 p-3 text-[12px] text-base-500">
        …your exercises go here…
      </div>
      <Spot n={3} pos="top-right">
        <CheckCard
          icon={Wind}
          title="Cool-down & stretching"
          sub="5–10 min static stretching to wind down"
          done={cool}
          onClick={() => setCool((v) => !v)}
        />
      </Spot>
    </PhoneFrame>
  );
}

