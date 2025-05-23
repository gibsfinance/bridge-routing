<script lang="ts">
  import { showGuide } from '../stores/storage.svelte'
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
      showGuide.value = false
    },
  }: Props = $props()
  const classes = $derived([positionClasses, sizeClasses, backgroundClasses, className, zClasses])
</script>

<div class={classes} class:hidden={!show} {onclick} role="presentation"></div>
