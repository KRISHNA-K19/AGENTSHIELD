/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0f19",
        surface: "#111827",
        surfaceBorder: "#1f2937",
        brand: {
          50: '#f0f9ff',
          500: '#0284c7',
          600: '#0284c7',
          900: '#0c4a6e',
        },
        shieldAllow: "#10b981",
        shieldAsk: "#f59e0b",
        shieldBlock: "#ef4444",
      }
    },
  },
  plugins: [],
}
