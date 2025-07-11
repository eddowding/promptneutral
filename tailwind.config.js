/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003e6d',
          50: '#e6eef4',
          100: '#ccdde9',
          200: '#99bbd3',
          300: '#6699bd',
          400: '#3377a7',
          500: '#005591',
          600: '#003e6d',
          700: '#002d4f',
          800: '#001c31',
          900: '#000b13',
        },
        neutral: {
          light: '#a3abbd',
          DEFAULT: '#6f7788',
          dark: '#4a505e',
        },
        accent: {
          wine: '#68253a',
          mauve: '#9e5569',
          'wine-light': '#7d3048',
          'mauve-light': '#b56b7f',
        }
      }
    },
  },
  plugins: [],
}