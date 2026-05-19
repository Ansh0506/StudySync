/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Define the primary blue from your reference image
        'sync-blue': '#007bff', 
        'sync-blue-dark': '#0056b3',
        'sync-border': '#e2e8f0',
        'sync-text': '#718096',
      }
    },
  },
  plugins: [],
}