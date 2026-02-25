import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'packages/common/src/**/*.ts',
        'packages/bridge-sdk/src/**/*.ts',
        'packages/ui/src/lib/**/*.ts',
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.config.ts',
        '**/*.d.ts',
        '.svelte-kit/**',
        '**/build/**',
        '**/coverage/**',
        '**/*.test.ts',
        '**/abis/**',
        '**/pulsex/types/**',
        '**/gql/**',
      ],
    },
    projects: [
      {
        test: {
          name: 'common',
          root: './packages/common',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'bridge-sdk',
          root: './packages/bridge-sdk',
          include: ['src/**/*.test.ts'],
        },
      },
      './packages/ui/vitest.config.ts',
    ],
  },
})
