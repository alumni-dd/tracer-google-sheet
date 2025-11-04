/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: { 
        brand: "#069D4E" 
      },
      boxShadow: { 
        card: "0 4px 18px rgba(34,197,94,.07)" 
      }
    }
  },
  plugins: []
}