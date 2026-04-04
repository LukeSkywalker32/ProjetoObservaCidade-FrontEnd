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
          '0%, 100%': { width: '60%' },
          '50%': { width: '85%' },
        },
        oscillate2: {
          '0%, 100%': { width: '40%' },
          '50%': { width: '75%' },
        },
        oscillate3: {
          '0%, 100%': { width: '50%' },
          '50%': { width: '90%' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      
      animation: {
        oscillate: 'oscillate 3s ease-in-out infinite',
        oscillate2: 'oscillate2 4s ease-in-out infinite',
        oscillate3: 'oscillate3 2.5s ease-in-out infinite',
        fadeIn: 'fadeIn 0.8s ease-out',
      },
      
      colors: {
        "primary": 'var(--primary-blue)',
        "secondary": 'var(--secondary-blue)',
        "light-gray": 'var(--light-gray)',
        "dark-gray": 'var(--dark-gray)',
        "accent": 'var(--accent-orange)',
        "success": 'var(--success-green)', 
      }, 
    },
  },
  plugins: [require('tailwindcss-animated')],
}