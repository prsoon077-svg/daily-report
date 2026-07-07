/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171B21",
        paper: "#F6F5F1",
        slate: {
          850: "#1C222B",
        },
        signal: "#1E7A6E",
        amber: "#C77D2E",
        line: "#DEDAD0",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
