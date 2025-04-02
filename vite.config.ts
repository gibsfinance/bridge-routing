import { defineConfig } from 'vitest/config'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
export default defineConfig({
  plugins: [
    tailwindcss(),
    enhancedImages(),
    sveltekit(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
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
})
