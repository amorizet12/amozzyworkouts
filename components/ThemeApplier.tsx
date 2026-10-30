"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { applyTheme } from "@/lib/theme";

export default function ThemeApplier() {
  const theme = useStore((s) => s.theme);
  const accentColor = useStore((s) => s.accentColor);

  useEffect(() => {
    applyTheme(theme, accentColor);
  }, [theme, accentColor]);

  return null;
}
