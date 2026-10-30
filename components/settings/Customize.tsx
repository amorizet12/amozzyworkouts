"use client";

import { useState } from "react";
import { Check, Moon, Sun } from "lucide-react";
import { useStore } from "@/lib/store";
import { ACCENT_PRESETS } from "@/lib/theme";

export default function Customize() {
  const appName = useStore((s) => s.appName);
  const setAppName = useStore((s) => s.setAppName);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const accentColor = useStore((s) => s.accentColor);
  const setAccentColor = useStore((s) => s.setAccentColor);

  const [nameDraft, setNameDraft] = useState(appName);

  const commitName = () => setAppName(nameDraft);

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-base-700/60 bg-base-900/40 p-4">
        <p className="text-[13.5px] font-semibold text-base-100">App name</p>
        <p className="mt-0.5 text-[12px] text-base-500">
          Shown in the top bar. This doesn't rename the app on your home screen — that comes from
          the icon you installed.
        </p>
        <input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          placeholder="PRISM"
          className="mt-3 w-full rounded-lg border border-base-700 bg-base-950 px-2.5 py-1.5 text-[13px] text-base-100 outline-none focus:border-accent-400/60"
        />
      </section>

      <section className="rounded-xl border border-base-700/60 bg-base-900/40 p-4">
        <p className="text-[13.5px] font-semibold text-base-100">Appearance</p>
        <p className="mt-0.5 text-[12px] text-base-500">Light or dark mode.</p>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setTheme("dark")}
            className={[
              "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-medium transition-colors",
              theme === "dark"
                ? "bg-accent-400 text-base-950"
                : "bg-base-800 text-base-400 hover:text-base-100",
            ].join(" ")}
          >
            <Moon size={14} />
            Dark
          </button>
          <button
            onClick={() => setTheme("light")}
            className={[
              "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-medium transition-colors",
              theme === "light"
                ? "bg-accent-400 text-base-950"
                : "bg-base-800 text-base-400 hover:text-base-100",
            ].join(" ")}
          >
            <Sun size={14} />
            Light
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-base-700/60 bg-base-900/40 p-4">
        <p className="text-[13.5px] font-semibold text-base-100">Accent color</p>
        <p className="mt-0.5 text-[12px] text-base-500">
          Used for buttons, highlights, and charts throughout the app.
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {ACCENT_PRESETS.map((preset) => {
            const selected = accentColor === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setAccentColor(preset.id)}
                className="flex flex-col items-center gap-1"
                aria-label={preset.label}
              >
                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-base-900 transition-shadow",
                    selected ? "ring-base-100" : "ring-transparent",
                  ].join(" ")}
                  style={{ backgroundColor: preset.swatch }}
                >
                  {selected && <Check size={15} strokeWidth={3} className="text-base-950" />}
                </span>
                <span className="text-[10.5px] text-base-500">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
