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
        luxury: {
          black: "#080A0A",
          surface: "#0E1212",
          elevated: "#141A19",
          card: "#111716",
        },
        turquoise: {
          DEFAULT: "#66D9C5",
          hover: "#54C4B1",
          light: "#82E2D1",
        },
        teal: {
          deep: "#0B665D",
          darker: "#084942",
        },
        ivory: {
          DEFAULT: "#F5F2EB",
          muted: "#D5D1C7",
          subtle: "#8A9491",
        },
        gold: {
          champagne: "#C6A66B",
          subtle: "rgba(198, 166, 107, 0.2)",
        },
      },
      fontFamily: {
        serif: ["var(--font-amiri)", "var(--font-bodoni-moda)", "Bodoni Moda", "Georgia", "serif"],
        sans: ["var(--font-cairo)", "var(--font-jost)", "Jost", "system-ui", "sans-serif"],
      },
      screens: {
        xs: "475px",
      },
    },
  },
  plugins: [],
};

export default config;
