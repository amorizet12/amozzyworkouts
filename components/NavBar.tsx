"use client";

import { useStore } from "@/lib/store";

export default function NavBar() {
  const appName = useStore((s) => s.appName);

  return (
    <header
      className="sticky top-0 z-20 border-b border-base-700/60 bg-base-950/85 backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center gap-2.5 px-4 py-3 sm:px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
        <span className="truncate text-[15px] font-semibold tracking-tight text-base-50">
          {appName}
        </span>
      </div>
    </header>
  );
}
