module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F28F79', // Main, button,
        secondary: '#58A690', // sub button
        tertiary: '#F2BF91',
        dark: '#59280B', //text, outline
        light: '#F2E8E4', // background
      },
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
