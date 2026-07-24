/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#1a1a1a",
        card: "#2a2a2a",
        border: "#3a3a3a",
        accent: "#b1ada1",
        cta: "#c15f3c",
        "cta-hover": "#a84d2e",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgb(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
