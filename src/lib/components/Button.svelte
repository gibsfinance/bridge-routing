<script lang="ts">
  import classNames from 'classnames'

  export let type: 'button' | 'submit' | 'reset' = 'button'
  let className = ''
  export { className as class }
  $: allClasses = classNames(
    'rounded-md bg-neutral-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 grow transition-all',
    className,
  )
</script>

<button {type} class={allClasses} on:click>
  <slot />
</button>
