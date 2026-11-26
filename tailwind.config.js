/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Neutrale Graustufen (statt bläulichem Slate) für ein ruhiges, schwarzes Design
      colors: {
        slate: {
          50: '#f5f5f7',
          100: '#e5e5ea',
          200: '#d1d1d6',
          300: '#c7c7cc',
          400: '#a1a1a6',
          500: '#8e8e93',
          600: '#636366',
          700: '#3a3a3c',
          800: '#2c2c2e',
          900: '#1c1c1e',
          950: '#0b0b0c',
        },
        best: '#ffd60a',
      },
      borderRadius: { card: '1.5rem' },
    },
  },
  plugins: [],
};
