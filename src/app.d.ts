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
  export const PUBLIC_NODE_ENV: string
}

export {}
