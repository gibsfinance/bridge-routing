<script lang="ts">
  import type { Snippet } from 'svelte'
  import Button from './Button.svelte'
  import type { EventHandler } from 'svelte/elements'
  import type { ClassValue } from 'svelte/elements'
  type Props = {
    title: string
    children?: Snippet
    onclick: EventHandler
    checked: boolean
    transitionClass?: ClassValue
    toggleClass?: ClassValue
    contentClass?: ClassValue
    activeClass?: ClassValue
    inactiveClass?: ClassValue
  }
  const {
    title,
    children,
    onclick,
    checked,
    contentClass = 'leading-6',
    transitionClass = 'transition duration-100',
    toggleClass = 'border-r-2 pr-2 rounded-2xl',
    activeClass = 'border-surface-500',
    inactiveClass = 'border-surface-300',
  }: Props = $props()
  const classes = $derived([
    contentClass,
    checked ? activeClass : inactiveClass,
    transitionClass,
    toggleClass,
  ])
</script>

<Button {title} class={classes} {onclick}>{@render children?.()}</Button>
