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
        slate: {
          200: "#E2E8F0",
          400: "#94A3B8",
          700: "#33373E",
          800: "#25282C",
          950: "#1A1D20",
        },
        focus: {
          green: "#4F9D69",
        },
        streak: {
          fire: "#E27D5F",
        },
        socratic: {
          violet: "#6B7FD7",
        },
      },
    },
  },
  plugins: [],
};
export default config;
