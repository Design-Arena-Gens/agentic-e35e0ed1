/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hud: {
          bg: "#0b1020",
          ring: "#44e0ff",
          pulse: "#9b5cff",
        },
      },
      boxShadow: {
        hud: "0 0 40px rgba(68, 224, 255, 0.25)",
      },
      keyframes: {
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(68,224,255,0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(68,224,255,0.4)" },
        },
      },
      animation: {
        glow: "glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
