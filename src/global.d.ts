declare const __APP_VERSION__: string

declare namespace svelteHTML {
  interface HTMLAttributes<T> {
    'on:visible'?: (event: any) => any
  }
}
