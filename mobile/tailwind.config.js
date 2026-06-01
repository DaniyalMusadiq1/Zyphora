/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './App.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        zy: {
          bg: '#0D0D1A',
          card: '#1A1A2E',
          purple: '#6C63FF',
          teal: '#00D4AA',
          orange: '#FF9040',
          yellow: '#FFD93D',
          red: '#FF6B6B',
          grey: '#9090B0',
          light: '#C0C0E0',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'System'],
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
