module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bgDark: "#050b1e",
        panel: "#0b122a",
        panelSoft: "#101a3a",
        neon: "#22d3ee",
        neonSoft: "#67e8f9",
        success: "#22c55e",
        warning: "#facc15",
        danger: "#ef4444",
      },
      boxShadow: {
        glow: "0 0 25px rgba(34,211,238,0.35)",
        soft: "0 10px 40px rgba(0,0,0,0.4)",
        "glow-lg": "0 0 40px rgba(34,211,238,0.5)",
        "glow-sm": "0 0 15px rgba(34,211,238,0.25)",
      },
      backdropBlur: {
        glass: "12px",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(34,211,238,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(34,211,238,0.6)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};