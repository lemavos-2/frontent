import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        // Design System - Obsidian-inspired dark theme
        background: {
          DEFAULT: "#1e1e1e", // Main background
          secondary: "#252526", // Secondary backgrounds
          tertiary: "#2d2d30", // Cards, modals
        },
        foreground: {
          DEFAULT: "#cccccc", // Primary text
          secondary: "#aaaaaa", // Secondary text
          tertiary: "#888888", // Muted text
        },
        border: {
          DEFAULT: "#3e3e42", // Subtle borders
          secondary: "#454545", // Stronger borders
        },
        accent: {
          DEFAULT: "#007acc", // Primary accent (blue)
          secondary: "#4ec9b0", // Secondary accent (teal)
          success: "#4ec9b0", // Success color
          warning: "#d7ba7d", // Warning color
          error: "#f44747", // Error color
        },
        brand: {
          DEFAULT: "#4ec9b0", // Continuum brand color
          dark: "#3a9b8a",
        },
      },
      spacing: {
        "safe-t": "max(1rem, env(safe-area-inset-top))",
        "safe-r": "max(1rem, env(safe-area-inset-right))",
        "safe-b": "max(1rem, env(safe-area-inset-bottom))",
        "safe-l": "max(1rem, env(safe-area-inset-left))",
        // Spacing scale: 4px multiples
        1: "0.25rem", // 4px
        2: "0.5rem",  // 8px
        3: "0.75rem", // 12px
        4: "1rem",    // 16px
        5: "1.25rem", // 20px
        6: "1.5rem",  // 24px
        8: "2rem",    // 32px
        10: "2.5rem", // 40px
        12: "3rem",   // 48px
        16: "4rem",   // 64px
      },
      fontSize: {
        // Typography scale
        xs: ["0.75rem", { lineHeight: "1rem" }],     // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        base: ["1rem", { lineHeight: "1.5rem" }],    // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }],  // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],   // 24px
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "6px",
        lg: "8px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0, 0, 0, 0.3)",
        medium: "0 2px 8px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          "0%": { transform: "translateY(-4px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
