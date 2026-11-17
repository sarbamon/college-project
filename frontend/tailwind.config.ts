import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0f172a",
          dark: "#1e293b",
          primary: "#1e3a8a",
          accent: "#2563eb",
          purple: "#7c3aed",
          lightPurple: "#f3e8ff",
          surface: "#f8fafc",
        },
        sleep: {
          wake: "#f59e0b",
          rem: "#8b5cf6",
          light: "#0284c7",
          deep: "#1e3a8a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

