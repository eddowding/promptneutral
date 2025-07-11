/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Deep blue for headlines, buttons, etc
        primary: {
          DEFAULT: '#003E6D',
          50: '#e6eef5',
          100: '#b3cce0',
          200: '#80aacb',
          300: '#4d88b6',
          400: '#1a66a1',
          500: '#00508a',
          600: '#003E6D',
          700: '#002d4f',
          800: '#001c31',
          900: '#000b13',
        },
        // Secondary - Mint green for accents
        secondary: {
          DEFAULT: '#65ECBA',
          50: '#f0fdf9',
          100: '#d1fae9',
          200: '#a3f5d3',
          300: '#65ECBA',
          400: '#2ed89e',
          500: '#10c584',
          600: '#0ea968',
          700: '#0c8552',
          800: '#0a6640',
          900: '#084c30',
        },
        // Tertiary colors
        teal: {
          DEFAULT: '#18B385',
          light: '#4fc9a4',
          dark: '#0e7a5a',
        },
        forest: {
          DEFAULT: '#007D54',
          light: '#339975',
          dark: '#004d33',
        },
        // Background and text colors
        background: '#fefefe',
        neutral: {
          light: '#f5f5f5',
          DEFAULT: '#6f7788',
          dark: '#2d3748',
        }
      }
    },
  },
  plugins: [],
}