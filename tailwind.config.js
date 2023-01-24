/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        main: "#333"
      }
    }
  },
  safelist: [
    {
      pattern: /(bg|text)-(.*)-(100|800)/
    }
  ],
  plugins: []
}
