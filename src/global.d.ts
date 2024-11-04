declare const __APP_VERSION__: string

declare namespace svelteHTML {
  interface HTMLAttributes {
    'on:visible'?: (event: CustomEvent<boolean>) => void | boolean
  }
}
