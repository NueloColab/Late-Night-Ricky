import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
      },
      colors: {
        steel: {
          dark: "#1B3A4C",
          mid: "#6B8FAB",
          light: "#8FA8BE",
          cream: "#E3E8ED",
        },
      },
    },
  },
  plugins: [],
};

export default config;
