<script lang="ts">
  import classNames from 'classnames'
  import type { ClassParam } from '$lib/types.svelte'
  import Button from './Button.svelte'
  import type { Snippet } from 'svelte'
  import Icon from '@iconify/svelte'
  type Props = {
    children?: Snippet
    verticalSizeClasses?: ClassParam
    verticalColorClasses?: ClassParam
    iconWrapperSizeClasses?: ClassParam
    iconWrapperColorClasses?: ClassParam
    positionClasses?: ClassParam
    zClasses?: ClassParam
    class?: ClassParam
    onclick?: null | (() => void)
    icon?: string
  }
  const {
    verticalSizeClasses = 'w-full',
    positionClasses = 'relative flex',
    iconWrapperSizeClasses = 'size-12',
    zClasses = '',
    onclick: onClick,
    icon,
  }: Props = $props()
  const classes = $derived(classNames(verticalSizeClasses, positionClasses, zClasses))
  const iconWrapperClasses = $derived(
    classNames(
      iconWrapperSizeClasses,
      'border-current text-white',
      onClick ? 'cursor-pointer' : 'cursor-auto',
    ),
  )
  const onclick = $derived.by(() => onClick ?? (() => {}))
  const iconClasses = `rounded-full w-full h-full ring-4 text-surface-contrast-100 ring-inset ring-white p-2 bg-white border ${
    !!onClick ? 'shadow hover:shadow-md transition-all duration-100' : ''
  }`
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
