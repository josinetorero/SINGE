/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores exatas do protótipo SINGE
        navy: '#102A43',
        brand: '#1D4ED8',
        light: '#F4F7FB',
        lblue: '#E8F1FC',
        ink: '#1E293B',
        muted: '#64748B',
        bd: '#DCE4EE',
        dbg: '#0B1220',
        dsidebar: '#0F172A',
        dcard: '#162235',
        dborder: '#29384D',
        dink: '#F1F5F9',
        dmuted: '#94A3B8',
        dblue: '#60A5FA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
