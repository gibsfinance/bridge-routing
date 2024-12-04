import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import pkg from './package.json'
import { ssp } from 'sveltekit-search-params/plugin'
import commonjs from '@rollup/plugin-commonjs'
import inject from '@rollup/plugin-inject'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

const MODE = process.env.NODE_ENV
const development = MODE === 'development'

export default defineConfig({
  plugins: [
    ssp(),
    sveltekit(),
    commonjs({
      include: /node_modules/,
    }),
    development &&
      nodePolyfills({
        include: [
          'node_modules/**/*.js',
          new RegExp('node_modules/.vite/.*js'),
          'http',
          'crypto',
          'buffer',
        ],
      }),
  ],
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      assert: 'assert',
      zlib: 'browserify-zlib',
    },
  },
  build: {
    rollupOptions: {
      external: ['@web3-onboard/*', 'Buffer'],
      plugins: [
        nodePolyfills({ include: ['crypto', 'http'] }),
        inject({ Buffer: ['Buffer', 'Buffer'] }),
      ],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
  optimizeDeps: {
    exclude: [
      '@ethersproject/hash',
      'wrtc',
      'http',
      // causes ox and event emitter to fail to import
      // 'viem',
    ],
    include: [
      '@web3-onboard/core',
      '@web3-onboard/gas',
      '@web3-onboard/sequence',
      'js-sha3',
      '@ethersproject/bignumber',
    ],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  define: {
    global: 'window',
    __APP_VERSION__: JSON.stringify(pkg.version),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  },
})
