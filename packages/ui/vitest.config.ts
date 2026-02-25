import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte({ hot: false })],
  resolve: {
    alias: {
      $lib: './src/lib',
    },
  },
  test: {
    name: 'ui',
    include: ['src/**/*.test.ts'],
    globals: true,
    environment: 'jsdom',
  },
})
