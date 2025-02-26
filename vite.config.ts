import { defineConfig } from 'vitest/config'
import { sveltekit } from '@sveltejs/kit/vite'
import { ssp } from 'sveltekit-search-params/plugin'

export default defineConfig({
  plugins: [
    ssp(),
    sveltekit(),
    // paraglide({
    //   project: './project.inlang',
    //   outdir: './src/lib/paraglide',
    // }),
  ],

  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
