/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        sibsBlue: "#0D4676",
        sibsOrange: "#FF5C28",
        sibsSoft: "#F8FAFC",
      },
      boxShadow: {
        card: "0 14px 35px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
