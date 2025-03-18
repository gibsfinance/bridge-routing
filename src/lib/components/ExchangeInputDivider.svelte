<script lang="ts">
  import classNames from 'classnames'
  import type { ClassParam } from '$lib/types.svelte'
  import Button from './Button.svelte'
  type Props = {
    children?: () => any
    verticalSizeClasses?: ClassParam
    verticalColorClasses?: ClassParam
    iconWrapperSizeClasses?: ClassParam
    iconWrapperColorClasses?: ClassParam
    positionClasses?: ClassParam
    zClasses?: ClassParam
    class?: ClassParam
    onclick?: null | (() => void)
  }
  const {
    verticalSizeClasses = 'w-full',
    positionClasses = 'relative',
    iconWrapperSizeClasses = 'size-12',
    zClasses = '',
    children,
    onclick: onClick,
  }: Props = $props()
  const classes = $derived(classNames(verticalSizeClasses, positionClasses, zClasses))
  const iconWrapperClasses = $derived(
    classNames(
      iconWrapperSizeClasses,
      'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-current text-white',
      onClick ? 'cursor-pointer' : 'cursor-auto',
    ),
  )
  const onclick = $derived.by(() => onClick ?? (() => {}))
</script>

<div class={classes}>
  <Button class={iconWrapperClasses} {onclick}>
    {@render children?.()}
  </Button>
</div>
