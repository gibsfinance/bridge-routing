import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter var', 'Inter', 'sans-serif'],
        italiana: ['Italiana', 'sans-serif'],
      },
    },
  },
  plugins: [forms],
} satisfies Config
