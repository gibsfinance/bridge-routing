// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
}

declare module '$env/static/public' {
  export const PUBLIC_WALLET_CONNECT_ID: string
  export const PUBLIC_IMAGE_ROOT: string
  export const PUBLIC_INDEXER_URL: string
  export const PUBLIC_RPC_1: string
  export const PUBLIC_RPC_56: string
  export const PUBLIC_RPC_369: string
  export const PUBLIC_RPC_943: string
  export const PUBLIC_RPC_11155111: string
  export const PUBLIC_NODE_ENV: string
}

export {}
