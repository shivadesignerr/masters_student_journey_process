import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // GVK Official Brand Colors
        gvk: {
          navy: {
            DEFAULT: "#253775", // Primary Brand
            hover: "#1c2b5e",
            dark: "#141f45",
            light: "#344994",
            50: "#EEF2FF",
            100: "#E0E7FE",
            200: "#C7D2FE",
            900: "#0F172A",
          },
          red: {
            DEFAULT: "#FF0008", // Accent Red
            hover: "#D90007",
            light: "#FFF0F0",
            border: "#FFC2C4",
            50: "#FEF2F2",
          },
          // Master Neutral Palette
          bg: "#F7F8FA",              // Application background
          surface: {
            DEFAULT: "#FFFFFF",        // Cards and panels
            secondary: "#F3F5F8",      // Secondary surfaces
            hover: "#F8FAFC",
            muted: "#EEF2F6",
          },
          text: {
            primary: "#172033",        // Main text
            secondary: "#596579",      // Supporting text
            muted: "#8490A3",          // Secondary metadata
            inverse: "#FFFFFF",
          },
          border: {
            DEFAULT: "#E4E8EF",        // Dividers and outlines
            input: "#D7DDE7",          // Form controls
            subtle: "#F1F4F9",
            focus: "#253775",
          },
          // Semantic Colors
          success: {
            DEFAULT: "#059669",
            light: "#ECFDF5",
            border: "#A7F3D0",
            text: "#065F46",
          },
          warning: {
            DEFAULT: "#D97706",
            light: "#FFFBEB",
            border: "#FDE68A",
            text: "#92400E",
          },
          error: {
            DEFAULT: "#DC2626",
            light: "#FEF2F2",
            border: "#FECACA",
            text: "#991B1B",
          },
          info: {
            DEFAULT: "#2563EB",
            light: "#EFF6FF",
            border: "#BFDBFE",
            text: "#1E40AF",
          },
          neutral: {
            DEFAULT: "#6B7280",
            light: "#F9FAFB",
            border: "#E5E7EB",
            text: "#374151",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      fontSize: {
        display: ["36px", { lineHeight: "44px", fontWeight: "700" }],
        h1: ["30px", { lineHeight: "38px", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "32px", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "28px", fontWeight: "600" }],
        h4: ["18px", { lineHeight: "26px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        body: ["14px", { lineHeight: "22px", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "20px", fontWeight: "400" }],
        label: ["13px", { lineHeight: "18px", fontWeight: "500" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
        micro: ["11px", { lineHeight: "14px", fontWeight: "500" }],
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
        "20": "80px",
        sidebar: "248px",
        "sidebar-collapsed": "72px",
        header: "64px",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        full: "9999px",
      },
      boxShadow: {
        "level-0": "none",
        "level-1": "0 1px 3px 0 rgba(23, 32, 51, 0.05), 0 1px 2px -1px rgba(23, 32, 51, 0.03)",
        "level-2": "0 4px 6px -1px rgba(23, 32, 51, 0.07), 0 2px 4px -2px rgba(23, 32, 51, 0.04)",
        "level-3": "0 10px 15px -3px rgba(23, 32, 51, 0.08), 0 4px 6px -4px rgba(23, 32, 51, 0.03)",
        card: "0 1px 3px 0 rgba(23, 32, 51, 0.05), 0 1px 2px -1px rgba(23, 32, 51, 0.03)",
        elevated: "0 10px 25px -5px rgba(37, 55, 117, 0.08), 0 8px 10px -6px rgba(37, 55, 117, 0.04)",
        dropdown: "0 12px 30px rgba(23, 32, 51, 0.12)",
      },
      transitionDuration: {
        micro: "140ms",
        standard: "200ms",
        panel: "260ms",
      },
    },
  },
  plugins: [],
};

export default config;
