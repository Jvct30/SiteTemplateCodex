import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        template: {
          bg: "#0f172a",
          surface: "#111827",
          "surface-light": "#241a40",
          pink: { 300: "#f9a8d4", 400: "#f472b6", 500: "#ec4899" },
          purple: { 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9" },
          accent: "#38bdf8",
          highlight: "#fde68a",
          cloud: "#bae6fd",
          white: "#f8fafc",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-outfit)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      backgroundImage: {
        "template-gradient": "linear-gradient(135deg, #faf5ff 0%, #f9a8d4 35%, #c4b5fd 65%, #8b5cf6 100%)",
        "template-dark": "linear-gradient(180deg, #0f0a1a 0%, #1a1230 50%, #241a40 100%)",
        "hero-gradient": "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6d28d9 100%)",
      },
      animation: {
        "twinkle": "twinkle 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        twinkle: { "0%, 100%": { opacity: "0.3" }, "50%": { opacity: "1" } },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};

export default config;
