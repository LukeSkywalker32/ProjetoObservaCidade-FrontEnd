/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        oscillate: {
          "0%, 100%": { width: "60%" },
          "50%": { width: "85%" },
        },
        oscillate2: {
          "0%, 100%": { width: "40%" },
          "50%": { width: "75%" },
        },
        oscillate3: {
          "0%, 100%": { width: "50%" },
          "50%": { width: "90%" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },

      animation: {
        oscillate: "oscillate 3s ease-in-out infinite",
        oscillate2: "oscillate2 4s ease-in-out infinite",
        oscillate3: "oscillate3 2.5s ease-in-out infinite",
        fadeIn: "fadeIn 0.8s ease-out",
      },

      /**
       * Cores do app — use SEMPRE estes tokens em vez de hex hardcoded.
       *
       * Map de migração:
       *   bg-[#1e3a8a]   → bg-primary
       *   bg-[#f59e0b]   → bg-accent
       *   bg-[#2563eb]   → bg-secondary
       *   text-[#6b7280] → text-dark-gray
       *   bg-[#e5e7eb]   → bg-light-gray
       *   bg-[#ef4444]   → bg-danger
       *   bg-[#16a34a]   → bg-success
       */
      colors: {
        // Cores principais (vinculadas a CSS vars no index.css)
        primary: "var(--primary-blue)",
        secondary: "var(--secondary-blue)",
        "light-gray": "var(--light-gray)",
        "dark-gray": "var(--dark-gray)",
        accent: "var(--accent-orange)",
        success: "var(--success-green)",

        // Variações do accent (laranja)
        "accent-hover": "#d97706",
        "accent-light": "#fef3c7",
        "accent-bg": "#fef3c7",
        "accent-border": "#fcd34d",
        "accent-text": "#92400e",

        // Variações do primary (azul escuro)
        "primary-hover": "#1e40af",

        // Backgrounds suaves
        "info-bg": "#eff6ff",
        "info-border": "#bfdbfe",
        "info-text": "#1e3a8a",
        "info-light": "#dbeafe",

        // Estados
        "danger": "#ef4444",
        "danger-bg": "#fee2e2",
        "danger-hover": "#dc2626",
        "success-bg": "#dcfce7",
        "success-hover": "#15803d",
        "warning": "#f59e0b",
        "warning-bg": "#fef3c7",

        // Tipografia padrão
        "text-primary": "#1e3a8a",
        "text-secondary": "#2563eb",
        "text-muted": "#6b7280",
        "text-light": "#9ca3af",
        "text-disabled": "#d1d5db",
      },
    },
  },
  plugins: [require("tailwindcss-animated")],
};
