/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        bg: '#0a0a0f',
        surface: '#13131a',
        'surface-light': '#1c1c27',
        border: '#2a2a3a',
        primary: '#6c5ce7',
        'primary-glow': '#a29bfe',
        accent: '#fd79a8',
        'accent-glow': '#fab1d0',
        'text-main': '#e8e8f0',
        'text-muted': '#8a8a9a',
        success: '#00cec9',
      },
    },
  },
  plugins: [],
}
