<script lang="ts">
  import { onMount } from 'svelte'
  import classnames from 'classnames'

  type Props = {
    value: string
    placeholder?: string
    name?: string
    id?: string
    size?: 'sm' | 'md' | 'lg'
    border?: boolean
    autoFocus?: boolean
    class?: string
    onclick?: () => void
    onblur?: () => void
    onfocus?: () => void
    oninput?: (e: string) => void
    setref?: (el: HTMLInputElement) => void
  }
  const {
    value,
    placeholder,
    name,
    id,
    size,
    border,
    autoFocus,
    class: className,
    onclick,
    onblur,
    onfocus,
    oninput,
    setref,
  }: Props = $props()
  const defaultClassName =
    'block w-full rounded-md py-1 px-2 shadow-xs bg-transparent outline-hidden'
  let input!: HTMLInputElement
  export { className as class }
  onMount(() => {
    if (autoFocus) {
      input.focus()
    }
  })
  $effect(() => {
    if (setref) {
      setref(input)
    }
  })
</script>

<input
  bind:this={input}
  type="text"
  {value}
  {name}
  {id}
  {placeholder}
  {onclick}
  {onblur}
  {onfocus}
  oninput={oninput ? (e) => oninput(e.currentTarget.value) : null}
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
