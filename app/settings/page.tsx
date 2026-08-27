"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import ExerciseLibrary from "@/components/settings/ExerciseLibrary";
import PlanBuilder from "@/components/settings/PlanBuilder";
import DataManagement from "@/components/settings/DataManagement";

const TABS = [
  { id: "exercises", label: "Exercises" },
  { id: "plan", label: "Workout Plan" },
  { id: "data", label: "Data" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>("exercises");
  const hydrated = useStore((s) => s.hydrated);

  if (!hydrated) {
    return <div className="pt-20 text-center text-[13px] text-base-500">Loading…</div>;
  }

  return (
    <div>
      <h1 className="mb-4 text-[17px] font-semibold text-base-100">Settings</h1>

      <div className="mb-4 flex gap-1 rounded-full bg-base-900 p-1 ring-1 ring-base-700/60">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "flex-1 rounded-full py-1.5 text-[12.5px] font-medium transition-colors",
              tab === t.id ? "bg-accent-400 text-base-950" : "text-base-400 hover:text-base-100",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "exercises" && <ExerciseLibrary />}
      {tab === "plan" && <PlanBuilder />}
      {tab === "data" && <DataManagement />}
    </div>
  );
}
