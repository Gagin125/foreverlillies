/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cherry: "#C1121F",
        gold: "#D4AF37",
        ink: "#111111",
        snow: "#FFFFFF",
        cream: "#F7F2EA"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 50px rgba(17, 17, 17, 0.12)",
        glow: "0 0 30px rgba(212, 175, 55, 0.35)"
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(120deg, rgba(20, 0, 0, 0.78), rgba(0, 0, 0, 0.2))"
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)"
      }
    }
  },
  plugins: []
};
