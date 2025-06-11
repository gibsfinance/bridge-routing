<script lang="ts">
  import { onMount } from 'svelte'
  import type { ClassValue } from 'svelte/elements'

  type Props = {
    value: string | null
    placeholder?: string
    name?: string
    id?: string
    size?: 'sm' | 'md' | 'lg'
    autoFocus?: boolean
    class?: ClassValue
    roundedClass?: ClassValue
    backgroundClass?: ClassValue
    onclick?: () => void
    onblur?: () => void
    onfocus?: () => void
    oninput?: (e: string) => void
    onsubmit?: () => void
    setref?: (el: HTMLInputElement) => void
  }
  const {
    value,
    placeholder,
    name,
    id,
    size,
    autoFocus,
    class: className,
    roundedClass,
    backgroundClass,
    onclick,
    onblur,
    onfocus,
    oninput,
    setref,
  }: Props = $props()
  const defaultClassName = 'flex w-full outline-hidden'
  let input!: HTMLInputElement
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
  class={[defaultClassName, className, roundedClass, backgroundClass]} />
