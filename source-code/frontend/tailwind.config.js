/** @type {import('tailwindcss').Config} */
const colors = require("./src/constants/palette.json");

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      borderRadius: {
        "2xl": "18px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0, 0, 0, 0.06)",
        elevated: "0 4px 24px rgba(0, 0, 0, 0.08)",
        button: "0 4px 16px rgba(0, 121, 107, 0.25)",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};