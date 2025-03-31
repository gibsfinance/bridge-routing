import { defineConfig } from 'vitest/config'
import { sveltekit } from '@sveltejs/kit/vite'
import { ssp } from 'sveltekit-search-params/plugin'
import tailwindcss from '@tailwindcss/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
export default defineConfig({
  plugins: [
    tailwindcss(),
    ssp(),
    enhancedImages(),
    sveltekit(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
    // paraglide({
    //   project: './project.inlang',
    //   outdir: './src/lib/paraglide',
    // }),
  ],
  preview: {
    allowedHosts: [
      'gibs.finance',
      'bridge-routing-staging.up.railway.app',
      'healthcheck.railway.app',
    ],
  },

  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // classnames: ['classnames'],
          // viem: ['viem'],
        },
      },
    },
  },
})
