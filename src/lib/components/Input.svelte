<script lang="ts">
  import classnames from 'classnames'
  import { onMount } from 'svelte'
  export let placeholder = ''
  export let name = ''
  export let id = ''
  export let value = ''
  export let size: 'sm' | 'md' | 'lg' = 'sm'
  export let border = true
  export let autoFocus = false
  const defaultClassName = 'block w-full rounded-md py-1 px-2 shadow-sm bg-transparent outline-none'
  let className = defaultClassName
  let input!: HTMLInputElement
  export { className as class }
  onMount(() => {
    if (autoFocus) {
      input.focus()
    }
  })
</script>

<input
  bind:this={input}
  type="text"
  bind:value
  {name}
  {id}
  {placeholder}
  on:click
  on:blur
  on:focus
  on:input
  autocomplete="off"
  autocorrect="off"
  autocapitalize="off"
  spellcheck="false"
  class:text-sm={size === 'sm'}
  class:leading-6={size === 'sm'}
  class:text-md={size === 'md'}
  class:leading-8={size === 'md'}
  class:border-0={!border}
  class={classnames(defaultClassName, className)} />
