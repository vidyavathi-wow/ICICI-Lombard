/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003366', // Wow Vision Blue
          light: '#004a8f',
          dark: '#001d3d',
        },
        secondary: {
          DEFAULT: '#e31e24', // Wow Vision Red
          light: '#f74046',
          dark: '#b3151a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
