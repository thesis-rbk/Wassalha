const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#008098',
          dark: '#00D6D5',
        },
        background: {
          light: '#FFFFFF',
          dark: '#121212',
        },
        text: {
          light: '#1A1A1A',
          dark: '#FFFFFF',
        },
        secondary: {
          light: '#F4F6F9',
          dark: '#242424',
        },
      },
    },
  },
  plugins: [],
}; 