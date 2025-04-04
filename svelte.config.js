import { mdsvex } from 'mdsvex'
import pkg from './package.json' with { type: 'json' }
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import * as child_process from 'node:child_process'

let githash = process.env.RAILWAY_GIT_COMMIT_SHA
if (!githash) {
  try {
    githash = child_process.execSync('git rev-parse HEAD').toString().trim()
  } catch (err) {
    console.error(err)
  }
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: [vitePreprocess(), mdsvex()],

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter(),
    router: {
      type: 'hash',
    },
    paths: {
      relative: true,
    },
    version: {
      name: [pkg.version, githash, new Date().toISOString()].join('_'),
    },
  },

  extensions: ['.svelte', '.svx'],
}

export default config
