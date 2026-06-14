import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Graphite Cockpit — dark premium. Semantic names preserved:
        // graphite = text, surface = panels, teal = accent, amber = warn, coral = bad.
        canvas: "#0A0D13",
        graphite: {
          DEFAULT: "#E7EBF3", // primary text
          muted: "#A2AABB", // ~6.5:1 on panel
          faint: "#828DA1", // ~5.5:1 on panel — AA for small text
        },
        surface: {
          DEFAULT: "#11161F", // panel
          sunken: "#0E131B",
          raised: "#161C27",
          line: "rgba(255,255,255,0.07)",
          lineFaint: "rgba(255,255,255,0.045)",
        },
        teal: {
          DEFAULT: "#2DD4BF", // accent / good
          ink: "#7FF0E2", // light accent text on dark soft
          soft: "rgba(45,212,191,0.12)",
        },
        amber: {
          DEFAULT: "#E3A53C", // warn
          ink: "#F0C36B",
          soft: "rgba(227,165,60,0.14)",
        },
        coral: {
          DEFAULT: "#F2685E", // bad
          ink: "#F8A39B",
          soft: "rgba(242,104,94,0.14)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        card: "11px",
        sm: "7px",
      },
      boxShadow: {
        panel: "0 1px 0 rgba(255,255,255,.03), 0 8px 30px -12px rgba(0,0,0,.7)",
      },
      backgroundImage: {
        accent: "linear-gradient(135deg, #34E0CC 0%, #16A697 100%)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.32s ease-out both",
        "pulse-dot": "pulse-dot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
