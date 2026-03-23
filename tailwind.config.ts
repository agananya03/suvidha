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
        irs: {
          navy: {
            DEFAULT: '#1a3a6b',
            dark: '#122a52',
            light: '#2c5099',
          },
          blue: {
            mid: '#005ea2',
            light: '#d9e8f6',
            pale: '#edf3fb',
          },
          white: '#ffffff',
          gray: {
            100: '#f5f5f5',
            200: '#e8e8e8',
            400: '#adadad',
            600: '#5c5c5c',
            900: '#1b1b1b',
          },
          success: '#00a91c',
          warning: '#ffbe2e',
          error: '#d54309',
          info: '#00bde3',
          gold: '#c9850c',
        },
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
