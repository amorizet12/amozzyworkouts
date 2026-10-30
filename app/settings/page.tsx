"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Database,
  Dumbbell,
  Palette,
  SquareCheckBig,
} from "lucide-react";
import { useStore } from "@/lib/store";
import ExerciseLibrary from "@/components/settings/ExerciseLibrary";
import PlanBuilder from "@/components/settings/PlanBuilder";
import DataManagement from "@/components/settings/DataManagement";
import Customize from "@/components/settings/Customize";
import Tutorial from "@/components/settings/Tutorial";

const SECTIONS = [
  {
    id: "tutorial",
    label: "How to use PRISM",
    description: "A step-by-step walkthrough of every feature",
    icon: BookOpen,
  },
  {
    id: "exercises",
    label: "Exercises",
    description: "Your exercise library and equipment types",
    icon: Dumbbell,
  },
  {
    id: "plan",
    label: "Workout Plan",
    description: "Build and edit your rolling training split",
    icon: SquareCheckBig,
  },
  {
    id: "customize",
    label: "Customize",
    description: "App name, theme, and accent color",
    icon: Palette,
  },
  {
    id: "data",
    label: "Data",
    description: "Units, stats, backup, and app updates",
    icon: Database,
  },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function SettingsPage() {
  const [section, setSection] = useState<SectionId | null>(null);
  const hydrated = useStore((s) => s.hydrated);

  if (!hydrated) {
    return <div className="pt-20 text-center text-[13px] text-base-500">Loading…</div>;
  }

  const active = SECTIONS.find((s) => s.id === section) ?? null;

  if (active) {
    return (
      <div>
        <button
          onClick={() => setSection(null)}
          className="mb-4 flex items-center gap-1 text-[13px] font-medium text-base-400 hover:text-base-100"
        >
          <ChevronLeft size={16} />
          Settings
        </button>
        <h1 className="mb-4 text-[17px] font-semibold text-base-100">{active.label}</h1>

        {active.id === "tutorial" && <Tutorial />}
        {active.id === "exercises" && <ExerciseLibrary />}
        {active.id === "plan" && <PlanBuilder />}
        {active.id === "customize" && <Customize />}
        {active.id === "data" && <DataManagement />}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-[17px] font-semibold text-base-100">Settings</h1>

      <div className="overflow-hidden rounded-xl border border-base-700/60 bg-base-900/40">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={[
              "flex w-full items-center gap-3 px-3.5 py-3 text-left hover:bg-base-800/60",
              i > 0 ? "border-t border-base-700/60" : "",
            ].join(" ")}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-400/15 text-accent-400">
              <s.icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium text-base-100">{s.label}</p>
              <p className="truncate text-[11.5px] text-base-500">{s.description}</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-base-600" />
          </button>
        ))}
      </div>
    </div>
  );
}
