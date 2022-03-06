const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
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
        100: 'rgba(209,200,215,0.55)',
        200: '#EFE4F5C6',
        300: '#ffffffe5',
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
  plugins: [
    require('./plugins/image-rendering')()
  ],
};