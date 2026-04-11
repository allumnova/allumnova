/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./App.tsx"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1", // Indigo
        background: "#0f172a", // Indigo-950
        surface: "rgba(30, 41, 59, 0.5)", // Slate-800 with opacity
        textSecondary: "#94a3b8", // Slate-400
      },
    },
  },
  plugins: [],
};
