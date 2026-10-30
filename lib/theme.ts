export type ThemeMode = "dark" | "light";

export type AccentColorId =
  | "green"
  | "teal"
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "orange"
  | "amber";

export const ACCENT_PRESETS: { id: AccentColorId; label: string; swatch: string }[] = [
  { id: "green", label: "Green", swatch: "#39e991" },
  { id: "teal", label: "Teal", swatch: "#39dae9" },
  { id: "blue", label: "Blue", swatch: "#398be9" },
  { id: "purple", label: "Purple", swatch: "#8239e9" },
  { id: "pink", label: "Pink", swatch: "#e93991" },
  { id: "red", label: "Red", swatch: "#e93948" },
  { id: "orange", label: "Orange", swatch: "#e98239" },
  { id: "amber", label: "Amber", swatch: "#e9bd39" },
];

const ACCENT_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
type AccentStep = (typeof ACCENT_STEPS)[number];

// RGB triplets ("r g b"), same lightness/saturation ladder as the original
// green ramp, rotated to a different hue per preset.
const ACCENT_RAMPS_RGB: Record<AccentColorId, Record<AccentStep, string>> = {
  green: {
    50: "234 255 245", 100: "200 255 227", 200: "147 255 201", 300: "92 247 170", 400: "57 233 145",
    500: "31 201 116", 600: "21 159 90", 700: "18 124 71", 800: "18 97 57", 900: "17 79 48",
  },
  teal: {
    50: "234 253 255", 100: "200 250 255", 200: "147 246 255", 300: "92 234 247", 400: "57 218 233",
    500: "31 187 201", 600: "21 148 159", 700: "18 115 124", 800: "18 90 97", 900: "17 74 79",
  },
  blue: {
    50: "234 244 255", 100: "200 226 255", 200: "147 197 255", 300: "92 164 247", 400: "57 139 233",
    500: "31 110 201", 600: "21 85 159", 700: "18 67 124", 800: "18 55 97", 900: "17 46 79",
  },
  purple: {
    50: "243 234 255", 100: "223 200 255", 200: "192 147 255", 300: "157 92 247", 400: "130 57 233",
    500: "102 31 201", 600: "79 21 159", 700: "62 18 124", 800: "51 18 97", 900: "43 17 79",
  },
  pink: {
    50: "255 234 245", 100: "255 200 227", 200: "255 147 201", 300: "247 92 170", 400: "233 57 145",
    500: "201 31 116", 600: "159 21 90", 700: "124 18 71", 800: "97 18 57", 900: "79 17 48",
  },
  red: {
    50: "255 234 236", 100: "255 200 205", 200: "255 147 156", 300: "247 92 105", 400: "233 57 72",
    500: "201 31 45", 600: "159 21 32", 700: "124 18 27", 800: "97 18 25", 900: "79 17 22",
  },
  orange: {
    50: "255 243 234", 100: "255 223 200", 200: "255 192 147", 300: "247 157 92", 400: "233 130 57",
    500: "201 102 31", 600: "159 79 21", 700: "124 62 18", 800: "97 51 18", 900: "79 43 17",
  },
  amber: {
    50: "255 250 234", 100: "255 241 200", 200: "255 228 147", 300: "247 208 92", 400: "233 189 57",
    500: "201 159 31", 600: "159 125 21", 700: "124 97 18", 800: "97 77 18", 900: "79 63 17",
  },
};

const BASE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
type BaseStep = (typeof BASE_STEPS)[number];

const BASE_RAMP_DARK: Record<BaseStep, string> = {
  50: "244 247 245", 100: "231 242 236", 200: "201 214 208", 300: "167 184 176", 400: "124 144 136",
  500: "95 116 107", 600: "60 74 66", 700: "29 38 33", 800: "21 27 24", 900: "15 20 18", 950: "10 13 12",
};

// Same token names, physically inverted: base-950 becomes a near-white
// background and base-50 becomes near-black text, so every existing
// bg-base-950 / text-base-50 usage in components "just works" in light mode.
const BASE_RAMP_LIGHT: Record<BaseStep, string> = {
  50: "33 44 39", 100: "46 61 55", 200: "75 99 89", 300: "96 128 115", 400: "118 152 138",
  500: "142 169 158", 600: "179 198 190", 700: "214 224 220", 800: "232 237 235", 900: "243 246 245", 950: "252 253 253",
};

function rgbToHex(rgb: string): string {
  const [r, g, b] = rgb.split(" ").map(Number);
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function accentHex(accentColor: AccentColorId, step: AccentStep): string {
  return rgbToHex(ACCENT_RAMPS_RGB[accentColor][step]);
}

export function baseHex(theme: ThemeMode, step: BaseStep): string {
  return rgbToHex((theme === "light" ? BASE_RAMP_LIGHT : BASE_RAMP_DARK)[step]);
}

/** The same CSS custom properties applyTheme sets on the root, as an object —
 * lets a single element be previewed in another theme/accent without touching
 * the real app (used by the in-app tutorial). */
export function themeCssVars(theme: ThemeMode, accentColor: AccentColorId): Record<string, string> {
  const baseRamp = theme === "light" ? BASE_RAMP_LIGHT : BASE_RAMP_DARK;
  const accentRamp = ACCENT_RAMPS_RGB[accentColor] ?? ACCENT_RAMPS_RGB.green;
  const vars: Record<string, string> = {};
  BASE_STEPS.forEach((step) => (vars[`--base-${step}`] = baseRamp[step]));
  ACCENT_STEPS.forEach((step) => (vars[`--accent-${step}`] = accentRamp[step]));
  return vars;
}

/** Applies the chosen theme + accent color as CSS custom properties on the
 * document root, which the Tailwind config reads via rgb(var(--x) / alpha). */
export function applyTheme(theme: ThemeMode, accentColor: AccentColorId) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const baseRamp = theme === "light" ? BASE_RAMP_LIGHT : BASE_RAMP_DARK;
  const accentRamp = ACCENT_RAMPS_RGB[accentColor] ?? ACCENT_RAMPS_RGB.green;

  BASE_STEPS.forEach((step) => root.style.setProperty(`--base-${step}`, baseRamp[step]));
  ACCENT_STEPS.forEach((step) => root.style.setProperty(`--accent-${step}`, accentRamp[step]));
  root.dataset.theme = theme;
}
