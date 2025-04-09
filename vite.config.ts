import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import replace from '@rollup/plugin-replace'
import pkg from './package.json' with { type: 'json' }
import child_process from 'child_process'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

let githash = process.env.RAILWAY_GIT_COMMIT_SHA
if (!githash) {
  try {
    githash = child_process.execSync('git rev-parse HEAD').toString().trim()
  } catch (err) {
    // console.error(err)
  }
}
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    enhancedImages(),
    replace({
      preventAssignment: true,
      values: {
        'process.env.PUBLIC_IMAGE_ROOT': JSON.stringify(process.env.PUBLIC_IMAGE_ROOT),
        'process.env.PUBLIC_WALLET_CONNECT_ID': JSON.stringify(
          process.env.PUBLIC_WALLET_CONNECT_ID,
        ),
        'process.env.PUBLIC_NODE_ENV': JSON.stringify(process.env.PUBLIC_NODE_ENV),
        'process.env.PUBLIC_VERSION': JSON.stringify(
          [pkg.version, githash, new Date().toISOString()].join('_'),
        ),
      },
    }),
    svelte(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
  ],
  base: './',
})
