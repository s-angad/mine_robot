import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          900: "#0b0f17",
          800: "#131a26",
          700: "#1e293b",
          600: "#334155",
          500: "#475569",
        },
        hazard: {
          warning: "#f59e0b",
          critical: "#ef4444",
          safe: "#10b981",
          thermal: "#ec4899",
        },
        cyan: {
          glow: "#06b6d4",
        }
      },
      fontFamily: {
        mono: ["Consolas", "Monaco", "Courier New", "monospace"],
      }
    },
  },
  plugins: [],
};
export default config;
