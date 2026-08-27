"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Dumbbell, Settings } from "lucide-react";

const links = [
  { href: "/", label: "Calendar", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-base-700/60 bg-base-950/85 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-400/15 text-accent-400 ring-1 ring-accent-400/30">
            <Dumbbell size={17} strokeWidth={2.25} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-base-50">
            Amozzy
          </span>
        </div>

        <nav className="flex items-center gap-1 rounded-full bg-base-900 p-1 ring-1 ring-base-700/60">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-accent-400 text-base-950"
                    : "text-base-500 hover:text-base-50",
                ].join(" ")}
              >
                <Icon size={15} strokeWidth={2.25} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
