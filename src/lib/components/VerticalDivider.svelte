<script lang="ts">
  import classNames from 'classnames'
  import type { ClassParam } from '$lib/types.svelte'

  type Props = {
    children?: () => any
    verticalSizeClasses?: ClassParam
    verticalColorClasses?: ClassParam
    iconWrapperSizeClasses?: ClassParam
    iconWrapperColorClasses?: ClassParam
    class?: ClassParam
  }
  const {
    children,
    verticalSizeClasses = 'w-0.5',
    verticalColorClasses = 'bg-surface-500',
    iconWrapperSizeClasses = 'size-8',
    iconWrapperColorClasses = 'text-surface-950-50',
    class: className = 'absolute top-0 bottom-0 left-1/2 -translate-x-1/2',
  }: Props = $props()
  const classes = $derived(
    classNames(`${verticalSizeClasses} ${verticalColorClasses} ${className}`),
  )
  const iconWrapperClasses = $derived(
    classNames(
      `${iconWrapperSizeClasses} ${iconWrapperColorClasses} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-current`,
    ),
  )
</script>

<div class={classes}>
  <div class={iconWrapperClasses}>
    {@render children?.()}
  </div>
</div>
