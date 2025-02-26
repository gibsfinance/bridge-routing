import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import { skeleton, contentPath } from '@skeletonlabs/skeleton/plugin'
import * as themes from '@skeletonlabs/skeleton/themes'

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
  plugins: [
    forms,
    skeleton({
      // NOTE: each theme included will increase the size of your CSS bundle
      themes: [themes.nouveau],
    }),
  ],
} satisfies Config
