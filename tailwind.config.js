/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/flowbite-vue/**/*.{js,jsx,ts,tsx}", // <– WICHTIG
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin'), // <– Flowbite als Tailwind-Plugin
  ],
  darkMode: ['class'],
}
