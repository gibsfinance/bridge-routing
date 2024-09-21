<script lang="ts">
  export let type: 'button' | 'submit' | 'reset' = 'button'
  let className =
    'rounded-md bg-neutral-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 grow transition-all'
  export { className as class }
  // <button type="button" class="rounded-md bg-neutral-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600">Button text</button>
</script>

<button {type} class={className} on:click>
  <slot />
</button>
