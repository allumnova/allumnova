/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1A237E",
        accent: "#4FC3F7",
        background: "#000000",
        surface: "#121212",
        glass: "rgba(255, 255, 255, 0.1)",
      },
    },
  },
  plugins: [],
};
