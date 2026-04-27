/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FDB913',
        lightPrimary: 'rgba(253, 185, 19, 0.2)',
        gray: '#AAAAAA',
        whiteTransparent: 'rgba(255, 255, 255, 0.3)',
        error: '#FD1E1E',
        warning: '#FB3333',
      },
      fontFamily: {
        sans: ['Montserrat', 'Franklin Gothic Medium', 'Arial Narrow', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        '48': '48px',
      },
      backdropBlur: {
        '9': '9px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}