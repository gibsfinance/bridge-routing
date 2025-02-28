import { defineConfig } from 'vitest/config'
import { sveltekit } from '@sveltejs/kit/vite'
import { ssp } from 'sveltekit-search-params/plugin'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    ssp(),
    sveltekit(),
    // paraglide({
    //   project: './project.inlang',
    //   outdir: './src/lib/paraglide',
    // }),
  ],
  preview: {
    allowedHosts: [
      'gibsfinance.com',
      'bridge-routing-staging.up.railway.app',
      'healthcheck.railway.app',
    ],
  },

  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
