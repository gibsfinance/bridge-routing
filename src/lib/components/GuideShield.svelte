<script lang="ts">
  import { page } from '../stores/app-page.svelte'
  import type { ClassValue } from 'svelte/elements'
  type Props = {
    show: boolean
    class?: ClassValue
    sizeClasses?: ClassValue
    positionClasses?: ClassValue
    backgroundClasses?: ClassValue
    zClasses?: ClassValue
    onclick?: () => void
  }
  const {
    show,
    class: className,
    sizeClasses = 'h-full w-full',
    positionClasses = 'absolute',
    backgroundClasses = 'bg-black/50',
    zClasses = '',
    onclick = () => {
      page.setParam('guide', null)
    },
  }: Props = $props()
  const classes = $derived([positionClasses, sizeClasses, backgroundClasses, className, zClasses])
</script>

<div class={classes} class:hidden={!show} {onclick} role="presentation"></div>
