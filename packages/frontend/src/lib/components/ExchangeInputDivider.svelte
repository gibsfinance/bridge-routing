<script lang="ts">
  import type { ClassValue } from 'svelte/elements'
  import Button from './Button.svelte'
  import type { Snippet } from 'svelte'
  import Icon from '@iconify/svelte'
  import { clsx } from 'clsx'

  type Props = {
    children?: Snippet
    verticalSizeClasses?: ClassValue
    verticalColorClasses?: ClassValue
    iconWrapperSizeClasses?: ClassValue
    iconWrapperColorClasses?: ClassValue
    positionClasses?: ClassValue
    zClasses?: ClassValue
    class?: ClassValue
    onclick?: null | (() => void)
    icon?: string
  }
  const {
    verticalSizeClasses = 'w-full',
    positionClasses = 'relative flex',
    iconWrapperSizeClasses = 'size-12',
    iconWrapperColorClasses = 'bg-white',
    zClasses = '',
    onclick: onClick,
    icon,
    class: className,
  }: Props = $props()
  const classes = $derived(clsx([verticalSizeClasses, positionClasses, zClasses, className]))
  const iconWrapperClasses = $derived(
    clsx([
      iconWrapperSizeClasses,
      iconWrapperColorClasses,
      'border-current text-white',
      onClick ? 'cursor-pointer' : 'cursor-auto',
    ]),
  )
  const onclick = $derived.by(() => onClick ?? (() => {}))
  const iconClasses = $derived(
    clsx([
      'rounded-full w-full h-full ring-4 text-surface-contrast-100 ring-inset ring-white p-1.5 bg-white border',
      onClick ? 'shadow hover:shadow-md transition-all duration-100' : '',
    ]),
  )
</script>

{#snippet children()}
  {#if icon}
    <Icon {icon} class={iconClasses} />
  {/if}
{/snippet}

<div class={classes}>
  <Button class={iconWrapperClasses} {onclick}>
    {@render children?.()}
  </Button>
</div>
