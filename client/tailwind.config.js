/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3AB795",
        secondary: "#16342F",
        light: "#FCFBFA",
        // light: "#F6F6EB #FCFBFA",
      },
    },
  },
  plugins: [],
};
