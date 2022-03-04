const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'media',
  theme: {
    colors: {
      white: colors.white,
      black: colors.black,
      primary: '#ff8df8',
      secondary: '#c86bef',
      ghost: {
        100: '#0000004c',
        200: '#00000066',
      },
      lightghost: {
        100: '#ffffffe5'
      },
      night: {
        100: '#171923',
        200: '#13151D',
        300: '#0a0b10',
      },
    },
    fontFamily: {
      sans: [ 'Rubik' ],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};