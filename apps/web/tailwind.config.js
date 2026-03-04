/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Space Grotesk", "sans-serif"]
      },
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        panelDark: "rgb(var(--panel-dark) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        accentSoft: "rgb(var(--accent-soft) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
        emerald: "rgb(var(--emerald) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)"
      },
      boxShadow: {
        card: "0 20px 45px -30px rgba(7, 16, 12, 0.6)",
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 40px -30px rgba(0,0,0,0.6)"
      }
    }
  },
  plugins: []
};
