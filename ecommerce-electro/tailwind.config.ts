import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0a0a0a",
          foreground: "#ffffff",
          dark: "#000000",
        },
        accent: {
          DEFAULT: "#800020",
          foreground: "#ffffff",
        },
        burgundy: {
          DEFAULT: "#800020",
          50: "#fff1f5",
          100: "#ffe4ec",
          200: "#fecddc",
          600: "#800020",
          700: "#6f001c",
          800: "#5c0017",
        },
        surface: "#f4f5f7",
      },
    },
  },
};

export default config;
