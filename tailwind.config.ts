import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clinical command-center palette — light, high-contrast.
        graphite: {
          DEFAULT: "#1c2230",
          muted: "#5b6472",
          faint: "#8a93a3",
        },
        surface: {
          DEFAULT: "#ffffff",
          sunken: "#f4f6fa",
          line: "#e3e8f0",
        },
        teal: {
          DEFAULT: "#0d8d8d",
          soft: "#e3f4f3",
          ink: "#075c5c",
        },
        amber: {
          DEFAULT: "#c97a14",
          soft: "#fbf0dd",
          ink: "#8a5408",
        },
        coral: {
          DEFAULT: "#d6463f",
          soft: "#fbe5e3",
          ink: "#9c2c27",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        card: "8px",
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
