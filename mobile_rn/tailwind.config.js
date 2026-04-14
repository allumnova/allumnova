/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./App.tsx"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6", // Institutional Blue
        secondary: "#6366f1", // Indigo Accent
        background: "#020617", // Obsidian Slate-950
        surface: "rgba(15, 23, 42, 0.6)", // Glassmorphism Slate-900/60
        textSecondary: "#94a3b8", // Slate-400
      },
      borderRadius: {
        'luxury': '2.5rem',
        'soft': '1.8rem',
      }
    },
  },
  plugins: [],
};
