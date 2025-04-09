<script lang="ts">
  import { showTooltips } from '../stores/storage.svelte'
  import type { ClassValue } from 'svelte/elements'
  type Props = {
    show: boolean
    class?: ClassValue
    sizeClasses?: ClassValue
    positionClasses?: ClassValue
    backgroundClasses?: ClassValue
    onclick?: () => void
  }
  const {
    show,
    class: className,
    sizeClasses = 'h-full w-full',
    positionClasses = 'absolute',
    backgroundClasses = 'bg-black/50',
    onclick = () => {
      showTooltips.value = false
    },
  }: Props = $props()
  const classes = $derived([positionClasses, sizeClasses, backgroundClasses, className])
</script>

<div class={classes} class:hidden={!show} {onclick} role="presentation"></div>
