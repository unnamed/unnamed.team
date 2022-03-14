const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    colors: {
      white: colors.white,
      black: colors.black,
      gray: colors.gray,
      primary: '#ff8df8',
      secondary: '#c86bef',
      pink: {
        200: '#ff8df8',
        500: '#ef64e5'
      },
      wine: {
        700: '#4b1349',
        800: '#340c31',
        900: '#1c0f1b'
      },
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
      }
    },
    maxWidth: {
      '8xl': '90rem'
    },
    fontFamily: {
      sans: [ 'Rubik', ...defaultTheme.fontFamily.sans ],
    },
  },
  plugins: [
    require('./plugins/image-rendering')()
  ],
};