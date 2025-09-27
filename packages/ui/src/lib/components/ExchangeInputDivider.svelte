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
      onClick ? 'cursor-pointer' : 'cursor-auto',
    ]),
  )
  const onclick = $derived.by(() => onClick ?? (() => {}))
  const iconClasses = $derived(
    clsx([
      'rounded-full w-full h-full ring ring-surface-500 text-surface-800 bg-white hover:bg-surface-50 dark:bg-slate-950 hover:dark:bg-surface-800 dark:text-surface-200 ring-inset p-1.5',
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
