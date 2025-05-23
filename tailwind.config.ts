// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // Add more paths as needed
  ],
  theme: {
    extend: {
      colors: {
        primary: "#126ed3",
        secondary: "#04609E",
        third: "#60AFfA",
      },
    },
  },
  plugins: [],
};
