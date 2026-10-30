"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  BarChart3,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  Database,
  Dumbbell,
  HeartPulse,
  Home,
  ListChecks,
  MousePointerClick,
  Palette,
  Rocket,
  SquareCheckBig,
  StickyNote,
} from "lucide-react";
import { Pin } from "./tutorial/mock";
import {
  CalendarScreen,
  CardioScreen,
  CustomizeScreen,
  DataScreen,
  DiscoverScreen,
  ExercisesScreen,
  PlanScreen,
  ProgressScreen,
  WelcomeScreen,
} from "./tutorial/screens";
import { CompleteScreen, ExtrasScreen, HomeScreen, PushScreen } from "./tutorial/homeScreens";

interface TutorialStep {
  id: string;
  title: string;
  icon: typeof Dumbbell;
  where?: string;
  intro: string;
  /** What to try in the interactive screen below. */
  tryIt?: string;
  Screen: () => JSX.Element;
  /** Notes under the screen. Numbered notes match the numbered pins on it. */
  notes: string[];
  numbered?: boolean;
  link?: { href: string; label: string };
}

function DoneScreen() {
  const items = [
    "Add your exercises (or grab some from Discover)",
    "Build a plan in Settings → Workout Plan",
    "Open Home and log your first set",
    "Mark the day complete and watch your streak grow",
    "Check Progress after a few sessions",
  ];
  return (
    <div className="mx-auto w-full max-w-[380px] rounded-2xl border border-accent-400/30 bg-accent-400/[0.06] p-5">
      <p className="text-[15px] font-bold text-base-50">Your first week</p>
      <ul className="mt-3 space-y-2.5">
        {items.map((t, i) => (
          <li key={t} className="flex items-start gap-2.5">
            <Pin n={i + 1} />
            <span className="text-[13px] leading-snug text-base-200">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to PRISM",
    icon: Rocket,
    where: "The bottom bar",
    intro:
      "PRISM is a simple workout tracker: build a plan, log every set, and watch your strength climb. Everything is saved on this device — no account needed. The phone below is a live demo, not your real data.",
    tryIt: "Tap the tabs along the bottom of the phone.",
    Screen: WelcomeScreen,
    numbered: true,
    notes: [
      "Home — today's workout. This is where you log your sets.",
      "Calendar — your whole plan at a glance, plus past workouts.",
      "Progress — charts of your lifts, cardio, and bodyweight.",
      "Settings — exercises, your plan, look & feel, and backups.",
    ],
  },
  {
    id: "exercises",
    title: "Set up your exercises",
    icon: Dumbbell,
    where: "Settings → Exercises",
    intro: "PRISM starts with a library of exercises grouped by muscle group — and you can add your own.",
    tryIt: "Tap the pulsing ③ icon, then try each equipment type.",
    Screen: ExercisesScreen,
    numbered: true,
    notes: [
      "Discover more exercises opens a library of starter picks with form cues (next step).",
      "Exercises are grouped by muscle group. Cardio comes first, then Chest, Back, and so on — tap a group to open it.",
      "The small icon on each exercise sets its equipment: barbell, dumbbell, bodyweight, or resistance band. That decides what you log — weight × reps, reps only, or reps plus band color. (For dumbbells, log ONE dumbbell's weight.)",
      "Type a name and tap Add to create your own. The pencil renames an exercise; the trash can deletes it.",
    ],
  },
  {
    id: "discover",
    title: "Discover more exercises",
    icon: Compass,
    where: "Settings → Exercises → Discover more exercises",
    intro: "Not sure what to add? Browse starter picks for every muscle group.",
    tryIt: "Tap Favorite and Try later — watch the tab counts.",
    Screen: DiscoverScreen,
    numbered: true,
    notes: [
      "Browse everything, or jump to your Favorites and Try Later lists.",
      "Tap a muscle group to filter the list.",
      "Every exercise has a short description and a few form cues.",
      "Star the ones you love, or bookmark ones you want to test later — they collect under their own tabs.",
    ],
  },
  {
    id: "plan",
    title: "Build your workout plan",
    icon: SquareCheckBig,
    where: "Settings → Workout Plan",
    intro:
      "Your plan is a repeating cycle of days. It keeps rolling — it does NOT reset every Sunday.",
    tryIt: "Switch between the splits and change the rest days.",
    Screen: PlanScreen,
    numbered: true,
    notes: [
      "Name your plan, choose a start date, and set how many weeks it runs.",
      "Pick a split: Push / Pull / Legs, Upper / Lower, or Build your own (day by day).",
      "Choose how many rest days per cycle. The preview shows the order your days will repeat in.",
      "Pick the exercises for each muscle group, plus how many warm-up and working sets per exercise. Chest is shown here — every other muscle group works the same way.",
      "Tap Create & activate plan and it goes live on Home and the Calendar.",
    ],
  },
  {
    id: "cardio",
    title: "Add cardio to your plan",
    icon: HeartPulse,
    where: "Settings → Workout Plan → Build your own",
    intro:
      "Cardio works like any muscle group. This is the real day-by-day editor — try it.",
    tryIt: "Toggle the Cardio chip on and off, and pick different cardio.",
    Screen: CardioScreen,
    notes: [
      "Each card is one day of your cycle. Tap the muscle-group chips to add or remove them from that day.",
      "Cardio is the first chip. Pick the forms you enjoy — it's logged in minutes, not sets.",
      "Day 1 here is a cardio-only day. Day 2 is a chest lift with a cardio finisher afterward.",
      "Leave a day with no groups to make it a rest day. Use the arrows to reorder days and the trash can to remove one.",
      "The Push / Pull / Legs and Upper / Lower presets have an optional Cardio picker under every day too.",
    ],
  },
  {
    id: "home",
    title: "Log today's workout",
    icon: Home,
    where: "Home tab",
    intro: "Home shows today's plan. Work down the list and log each set as you finish it.",
    tryIt: "Type some reps next to the weight and tap + Set. Then log another.",
    Screen: HomeScreen,
    numbered: true,
    notes: [
      "Today's date, your streak flame, and which muscle groups are scheduled.",
      "Each exercise shows its target — warm-up and working sets.",
      "Last time: weight × reps with the effort in parentheses, so you know what to beat.",
      "Enter the weight and the reps you did.",
      "Choose how hard it felt (RPE: 6 = very easy, 10 = maximum effort). It sharpens your strength estimates.",
      "Tap + Set to log it. A rest timer starts counting from your most recent set.",
      "Logged sets show up as chips with the time. Tap the × to delete one.",
    ],
    link: { href: "/", label: "Open the real Home" },
  },
  {
    id: "extras",
    title: "Notes, substitutes & extras",
    icon: StickyNote,
    where: "Home tab",
    intro: "Real workouts rarely go exactly to plan — PRISM bends with you.",
    tryIt: "Add a note, substitute the exercise, then log an extra exercise.",
    Screen: ExtrasScreen,
    numbered: true,
    notes: [
      "Add note — jot down how an exercise felt. Tap the pencil to edit it later.",
      "Substitute — machine taken? Swap in another exercise from the same muscle group, for today only.",
      "Log an exercise — add anything that wasn't planned: pick a muscle group, then the exercise.",
      "Added one by mistake? The trash icon removes it (and any sets you logged for it).",
    ],
  },
  {
    id: "push",
    title: "Missed a day? Push it",
    icon: CalendarClock,
    where: "Home tab",
    intro: "If you can't work out today, don't wreck your plan — push it.",
    tryIt: "Tap Push today, look at the strip, then tap reset.",
    Screen: PushScreen,
    numbered: true,
    notes: [
      "Push today turns today into a rest day and shifts your remaining workouts forward by one — only up to your next rest day, so a single missed day doesn't cascade through everything.",
      "Changed your mind? This button stays put (it isn't a timer) until you tap it, which undoes the push exactly.",
      "Today is now a rest day with nothing scheduled…",
      "…but you can still log whatever you actually did — like a cardio session — with Log an exercise.",
    ],
  },
  {
    id: "complete",
    title: "Finish the day",
    icon: ListChecks,
    where: "Home tab",
    intro: "Wrap up each workout to keep your streak alive.",
    tryIt: "Tap Mark as complete.",
    Screen: CompleteScreen,
    numbered: true,
    notes: [
      "The flame counts your consecutive completed workout days. Rest days don't break it.",
      "Mark as complete when you're done — it stamps the time. Tap again to undo.",
      "Check off the Warm-up and Cool-down cards as you do them.",
    ],
  },
  {
    id: "calendar",
    title: "The Calendar",
    icon: CalendarDays,
    where: "Calendar tab",
    intro: "This is the real calendar component, filled with demo data.",
    tryIt: "Tap different days to see their plan.",
    Screen: CalendarScreen,
    notes: [
      "Colored dots show which muscle groups are scheduled each day (rose is Cardio, green is Chest, and so on).",
      "A badge with a check means you marked that day complete. The flame is your current streak.",
      "A hollow dot means you logged something on a day with nothing scheduled.",
      "The ringed day is today. Tap any day to see its plan and logged sets underneath the calendar.",
      "Forgot to log something? Open a past day and add it. Today stays read-only here (log on Home) unless it's a rest day.",
    ],
    link: { href: "/calendar", label: "Open the real Calendar" },
  },
  {
    id: "progress",
    title: "Track your progress",
    icon: BarChart3,
    where: "Progress tab",
    intro: "Pick a muscle group and the first exercise in it opens automatically.",
    tryIt: "Tap Cardio, Back, then Quads — then try the Volume toggle.",
    Screen: ProgressScreen,
    numbered: true,
    notes: [
      "Pick a muscle group — its first exercise opens right away.",
      "Or tap any other exercise in the group.",
      "The headline stat: estimated 1RM for weighted lifts, best reps for bodyweight and band moves, longest session for cardio.",
      "For weighted lifts, switch between Est. 1RM and total Volume.",
      "The chart plots every session. Hover or drag across it to read a point. (There's also a Bodyweight view of your weigh-ins, and a DOTS strength score once you add your stats.)",
    ],
    link: { href: "/progress", label: "Open the real Progress" },
  },
  {
    id: "customize",
    title: "Make it yours",
    icon: Palette,
    where: "Settings → Customize",
    intro: "Give PRISM your own look. This preview only recolors the phone below.",
    tryIt: "Pick an accent color and flip between Dark and Light.",
    Screen: CustomizeScreen,
    numbered: true,
    notes: [
      "App name — shown in the top bar.",
      "Appearance — dark or light mode.",
      "Accent color — used for buttons, highlights, and charts across the app.",
    ],
  },
  {
    id: "data",
    title: "Your data & backups",
    icon: Database,
    where: "Settings → Data",
    intro:
      "Everything lives in this browser's storage, so back it up now and then. Tip: use your browser's “Add to Home Screen” to install PRISM like a regular app.",
    tryIt: "Tap the buttons — they're demos and won't touch your data.",
    Screen: DataScreen,
    numbered: true,
    notes: [
      "Choose lbs or kg.",
      "Add your sex and bodyweight to unlock a DOTS strength score on the Progress tab.",
      "Export backup downloads a file of everything; Import backup restores it or moves you to another device.",
      "Installed as an app and it looks out of date after an update? Tap Refresh app data.",
    ],
  },
  {
    id: "done",
    title: "You're all set",
    icon: ArrowLeftRight,
    intro:
      "That's the whole app. Here's a good first week — and you can come back to this walkthrough anytime from Settings.",
    Screen: DoneScreen,
    numbered: false,
    notes: [],
    link: { href: "/", label: "Go to Home" },
  },
];

export default function Tutorial() {
  const [index, setIndex] = useState(0);
  const [showList, setShowList] = useState(false);

  const step = STEPS[index];
  const isFirst = index === 0;
  const isLast = index === STEPS.length - 1;
  const Icon = step.icon;
  const Screen = step.Screen;

  const go = (i: number) => {
    setIndex(i);
    setShowList(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11.5px] text-base-500">
        <span>
          Step {index + 1} of {STEPS.length}
        </span>
        <button
          onClick={() => setShowList((v) => !v)}
          className="font-medium text-accent-400 hover:text-accent-300"
        >
          {showList ? "Hide topics" : "All topics"}
        </button>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-base-800">
        <div
          className="h-full rounded-full bg-accent-400 transition-all duration-300"
          style={{ width: `${((index + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {showList && (
        <div className="overflow-hidden rounded-xl border border-base-700/60 bg-base-900/40">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              className={[
                "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[12.5px] hover:bg-base-800/60",
                i > 0 ? "border-t border-base-700/60" : "",
                i === index ? "text-accent-400" : "text-base-200",
              ].join(" ")}
            >
              <s.icon size={14} className="shrink-0" />
              <span className="truncate">{s.title}</span>
            </button>
          ))}
        </div>
      )}

      <div key={step.id} className="animate-fade-in space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-400/15 text-accent-400">
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-base-50">{step.title}</h2>
            {step.where && (
              <p className="text-[11.5px] font-medium text-accent-400">{step.where}</p>
            )}
          </div>
        </div>

        <p className="text-[13px] leading-relaxed text-base-300">{step.intro}</p>

        {step.tryIt && (
          <div className="flex items-start gap-2 rounded-lg border border-accent-400/30 bg-accent-400/[0.07] px-3 py-2 text-[12px] text-accent-400">
            <MousePointerClick size={14} className="mt-0.5 shrink-0" />
            <span>
              <span className="font-semibold">Try it:</span> {step.tryIt}
            </span>
          </div>
        )}

        <div className="py-1">
          <Screen />
        </div>

        {step.notes.length > 0 && (
          <ul className="space-y-2.5 rounded-2xl border border-base-700/60 bg-base-900/60 p-4">
            {step.notes.map((text, i) => (
              <li key={i} className="flex items-start gap-2.5">
                {step.numbered ? (
                  <span className="mt-0.5">
                    <Pin n={i + 1} />
                  </span>
                ) : (
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                )}
                <p className="text-[12.5px] leading-relaxed text-base-300">{text}</p>
              </li>
            ))}
          </ul>
        )}

        {step.link && (
          <Link
            href={step.link.href}
            className="inline-flex items-center gap-1 rounded-lg bg-accent-400/15 px-3 py-1.5 text-[12px] font-semibold text-accent-400 hover:bg-accent-400/25"
          >
            {step.link.label}
            <ChevronRight size={13} />
          </Link>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={() => go(Math.max(0, index - 1))}
          disabled={isFirst}
          className="flex items-center gap-1 rounded-lg border border-base-700 px-3 py-2 text-[12.5px] font-medium text-base-300 hover:border-accent-400/40 hover:text-accent-400 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={14} />
          Back
        </button>

        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              aria-label={`Go to step ${i + 1}`}
              className={[
                "h-1.5 rounded-full transition-all",
                i === index ? "w-4 bg-accent-400" : "w-1.5 bg-base-700 hover:bg-base-600",
              ].join(" ")}
            />
          ))}
        </div>

        {isLast ? (
          <button
            onClick={() => go(0)}
            className="flex items-center gap-1 rounded-lg bg-accent-400 px-3 py-2 text-[12.5px] font-semibold text-base-950 hover:bg-accent-300"
          >
            Restart
          </button>
        ) : (
          <button
            onClick={() => go(Math.min(STEPS.length - 1, index + 1))}
            className="flex items-center gap-1 rounded-lg bg-accent-400 px-3 py-2 text-[12.5px] font-semibold text-base-950 hover:bg-accent-300"
          >
            Next
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
