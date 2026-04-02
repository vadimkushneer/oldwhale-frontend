/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: {
    extend: {
      colors: {
        ow: {
          bg: "#1a1b2e",
          surf: "#1f2040",
          t1: "#e4e1f5",
          t2: "#9896b8",
          t3: "#5a587a",
          accent: "#7c6af7",
        },
      },
      fontFamily: {
        mono: ["'Courier New'", "monospace"],
      },
      boxShadow: {
        "ow-out": "8px 8px 22px rgba(0,0,0,0.5), -4px -4px 12px rgba(255,255,255,0.038)",
        "ow-in":
          "inset 3px 3px 10px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.035)",
        "ow-sm": "4px 4px 12px rgba(0,0,0,0.4), -2px -2px 7px rgba(255,255,255,0.032)",
      },
    },
  },
  plugins: [],
};
