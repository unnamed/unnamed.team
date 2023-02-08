const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    colors: {
      white: colors.white,
      black: colors.black,
      gray: colors.gray,
      red: colors.red,
      green: colors.green,
      primary: '#ff8df8',
      secondary: '#c86bef',
      pink: {
        100: '#ffa8f9',
        200: '#ff8df8',
        500: '#ef64e5'
      },
      wine: {
        700: '#4b1349',
        800: '#340c31',
        900: '#110521'
      },
      ghost: {
        100: '#0000004c',
        200: '#00000066',
      },
      lightghost: {
        100: '#E4DBEAB2',
        200: '#EFE4F5C6',
        300: '#ffffffe5',
      },
      night: {
        100: '#171923',
        200: '#13151D',
        300: '#0a0b10',
      }
    },
    fontFamily: {
      sans: [ 'Rubik', ...defaultTheme.fontFamily.sans ],
    },
  },
  plugins: [
    require('./plugins/image-rendering')()
  ],
};