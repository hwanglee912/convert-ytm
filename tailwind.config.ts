import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ytm: {
          bg: "#030303",
          surface: "#0f0f0f",
          elevated: "#181818",
          card: "#212121",
          hover: "#2a2a2a",
          border: "#333333",
          primary: "#ff0000",
          secondary: "#ff4e45",
          text: "#ffffff",
          muted: "#aaaaaa",
          subtext: "#717171",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Roboto", "sans-serif"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
