/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        italiana: ['Italiana', 'sans-serif'],
      },
      // fontSize: {
      //   fontSize: [],
      // },
    },
  },
  plugins: [require('daisyui')],
}
