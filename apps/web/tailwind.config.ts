import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#06080a",
        elevated: "#0e1216",
        hover: "#161c22",
        border: "#1f2830",
        muted: "#8b9aab",
        accent: {
          DEFAULT: "#00e676",
          dim: "rgba(0, 230, 118, 0.2)",
        },
        warning: "#ffb020",
        danger: "#ff4757",
        info: "#3d8bfd",
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(0, 230, 118, 0.15)",
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "pulse-live": "pulse-live 2s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
