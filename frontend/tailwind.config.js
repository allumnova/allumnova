/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#F0F6FC',
          100: '#E1EDF9',
          200: '#BCD7F2',
          300: '#85B6EA',
          400: '#4791DE',
          500: '#1F6FCE',
          600: '#0B4D87', // Brand Deep Navy Blue
          700: '#093E6E',
          800: '#073259',
          900: '#062B4D',
          950: '#041B30',
        },
        orange: {
          50: '#FFF5F2',
          100: '#FFE6DF',
          200: '#FFCEBF',
          300: '#FFA58C',
          400: '#FF734D',
          500: '#F15A24', // Brand Vibrant Orange
          600: '#D64614',
          700: '#B0350B',
          800: '#8F2B09',
          900: '#75250A',
          950: '#421103',
        },
        amber: {
          50: '#FFF9F2',
          100: '#FFEEDD',
          200: '#FFDEB8',
          300: '#FFC585',
          400: '#FFA247',
          500: '#F15A24', // Brand Vibrant Orange mapping for warning alerts
          600: '#D64614',
          700: '#B0350B',
          800: '#8F2B09',
          900: '#75250A',
          950: '#421103',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
