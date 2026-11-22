import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#101214",
          secondary: "#171A1D",
          card: "#1D2226",
          elevated: "#252B30",
        },
        text: {
          primary: "#F4F5F6",
          secondary: "#A0A8AE",
          muted: "#727B83",
        },
        accent: {
          amber: "#F0A83A",
          emerald: "#35B779",
          red: "#E45B5B",
        },
        brand: {
          steam: "#66C0F4",
          epic: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
