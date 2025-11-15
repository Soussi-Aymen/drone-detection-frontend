/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Define custom tactical colors here if needed
      colors: {
        'tactical-blue': '#5D9CEC',
        'tactical-red': '#FF0000',
      },
    },
  },
  plugins: [],
}