/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3AB795",
        secondary: "#16342F",
        light: "#F6F6EB",
        // light: "#F6F6EB #FCFBFA",
      },
      fontFamily: {
        sans: ["Poppins", "Noto Sans TC", "sans-serif"],
      },
    },
  },
  plugins: [],
};
