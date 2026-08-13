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
        ocean: {
          900: '#061E3E',
          800: '#0A2D61',
          700: '#11448D',
          600: '#1A5FBC',
          500: '#257BEB', // More vibrant primary blue
          400: '#60A5FA',
          100: '#DBEAFE',
        },
        aqua: {
          900: '#042F2E',
          800: '#064E3B',
          700: '#047857',
          600: '#059669',
          500: '#10B981', // Vibrant emerald/teal
          400: '#34D399',
          100: '#D1FAE5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      }
    },
  },
  plugins: [],
}
