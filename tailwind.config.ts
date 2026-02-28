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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#003087",
        },
        accent: {
          DEFAULT: "#FF6600",
        },
        success: {
          DEFAULT: "#2E7D32",
        },
        dark: {
          DEFAULT: "#1A1A1A",
        },
      },
    },
  },
  plugins: [],
};
export default config;
