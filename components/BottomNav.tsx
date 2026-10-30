"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, House, LineChart, Settings } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: House },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-base-700/60 bg-base-950/90 backdrop-blur"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)" }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-1.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10.5px] font-medium transition-colors",
                active ? "text-accent-400" : "text-base-500 hover:text-base-100",
              ].join(" ")}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
