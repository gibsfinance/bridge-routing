import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import { contentPath } from '@skeletonlabs/skeleton/plugin'

export default {
  content: ['./src/**/*.{html,js,svelte,ts}', contentPath(import.meta.url, 'svelte')],
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
