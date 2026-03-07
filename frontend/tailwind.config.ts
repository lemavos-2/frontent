import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      colors: {
        // SaaS Color System
        brand: {
          DEFAULT: "#3ecf8e", // Primary green
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          900: "#14532d",
        },
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        accent: {
          DEFAULT: "#3ecf8e", // same as brand
          secondary: "#4ec9b0", // teal
          error: "#ef4444",
        },
        background: {
          DEFAULT: "#0a0a0b",
          secondary: "#111111",
          tertiary: "#1a1a1a",
        },
        foreground: {
          DEFAULT: "#ffffff",
          secondary: "#a3a3a3",
          tertiary: "#737373",
        },
        border: "#262626",
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
      },
      spacing: {
        "safe-t": "max(1rem, env(safe-area-inset-top))",
        "safe-r": "max(1rem, env(safe-area-inset-right))",
        "safe-b": "max(1rem, env(safe-area-inset-bottom))",
        "safe-l": "max(1rem, env(safe-area-inset-left))",
      },
    },
  },
  plugins: [],
} satisfies Config;
