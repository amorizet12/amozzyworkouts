"use client";

import { ReactNode } from "react";
import { CalendarDays, House, LineChart, Settings } from "lucide-react";
import { useStore } from "@/lib/store";

export const TABS = [
  { id: "home", label: "Home", icon: House },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "progress", label: "Progress", icon: LineChart },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export type TabId = (typeof TABS)[number]["id"];

/** Numbered hotspot badge that matches the numbered notes under each screen. */
export function Pin({ n, pulse }: { n: number; pulse?: boolean }) {
  return (
    <span className="relative inline-flex h-[18px] w-[18px] shrink-0">
      {pulse && (
        <span className="absolute inset-0 animate-ping rounded-full bg-accent-400 opacity-50" />
      )}
      <span className="relative flex h-full w-full items-center justify-center rounded-full bg-accent-400 text-[10px] font-bold text-base-950 ring-2 ring-base-950">
        {n}
      </span>
    </span>
  );
}

type Pos = "top-right" | "top-left" | "bottom-right" | "right";

const POS: Record<Pos, string> = {
  "top-right": "-top-3 right-2",
  "top-left": "-top-3 left-2",
  "bottom-right": "-bottom-3 right-2",
  right: "top-1/2 -right-3 -translate-y-1/2",
};

/** Wraps an element and pins a numbered badge to it. */
export function Spot({
  n,
  pos = "top-right",
  pulse,
  className = "",
  children,
}: {
  n: number;
  pos?: Pos;
  pulse?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <div className={`pointer-events-none absolute z-10 ${POS[pos]}`}>
        <Pin n={n} pulse={pulse} />
      </div>
    </div>
  );
}

/** A phone-shaped frame with the app's real top bar and bottom tab bar. */
export function PhoneFrame({
  children,
  active,
  onTab,
  tabPins,
  style,
  name,
}: {
  children: ReactNode;
  active: TabId;
  onTab?: (tab: TabId) => void;
  tabPins?: boolean;
  style?: React.CSSProperties;
  name?: string;
}) {
  const storeName = useStore((s) => s.appName);
  const appName = name ?? storeName;

  return (
    <div
      style={style}
      className="mx-auto w-full max-w-[380px] overflow-hidden rounded-[28px] border-2 border-base-700 bg-base-950 shadow-xl"
    >
      <div className="flex items-center gap-2.5 border-b border-base-700/60 bg-base-950 px-3.5 py-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" className="h-7 w-7 rounded-lg" />
        <span className="truncate text-[14px] font-semibold tracking-tight text-base-50">
          {appName}
        </span>
      </div>

      <div className="space-y-3 bg-base-950 px-3 pb-4 pt-4 text-base-100">{children}</div>

      <div className="flex items-center justify-around border-t border-base-700/60 bg-base-950 px-1 py-1.5">
        {TABS.map(({ id, label, icon: Icon }, i) => {
          const isActive = active === id;
          const inner = (
            <>
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </>
          );
          const cls = [
            "relative flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
            isActive ? "text-accent-400" : "text-base-500",
          ].join(" ");
          return (
            <div key={id} className="relative flex flex-1">
              {onTab ? (
                <button onClick={() => onTab(id)} className={`${cls} hover:text-base-100`}>
                  {inner}
                </button>
              ) : (
                <div className={cls}>{inner}</div>
              )}
              {tabPins && (
                <div className="pointer-events-none absolute -top-1.5 right-2">
                  <Pin n={i + 1} pulse />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
