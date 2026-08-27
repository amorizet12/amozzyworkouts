import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          50: "#f4f7f5",
          100: "#e7f2ec",
          200: "#c9d6d0",
          300: "#a7b8b0",
          400: "#7c9088",
          500: "#5f746b",
          600: "#3c4a42",
          700: "#1d2621",
          800: "#151b18",
          900: "#0f1412",
          950: "#0a0d0c",
        },
        accent: {
          DEFAULT: "#39e991",
          50: "#eafff5",
          100: "#c8ffe6",
          200: "#93ffd0",
          300: "#5cf7b8",
          400: "#39e991",
          500: "#1fc975",
          600: "#159f5d",
          700: "#127c4a",
          800: "#12613c",
          900: "#114f33",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(57,233,145,0.15), 0 8px 24px -8px rgba(57,233,145,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
