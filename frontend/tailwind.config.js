/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soft-blue': '#E0F2FE', // sky-100
        'soft-green': '#DCFCE7', // green-100
        'soft-yellow': '#FEF9C3', // yellow-100
        'soft-purple': '#F3E8FF', // purple-100
        'calm-primary': '#BAE6FD', // sky-200
        'calm-secondary': '#BBF7D0', // green-200
        'text-main': '#334155', // slate-700
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
