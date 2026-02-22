/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./shared/**/*.{js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
