<script lang="ts">
  import { showTooltips } from '$lib/stores/storage.svelte'
  import classNames from 'classnames'

  type Props = {
    show: boolean
    class?: string
    sizeClasses?: string
    positionClasses?: string
    backgroundClasses?: string
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
  const classes = $derived(classNames(positionClasses, sizeClasses, backgroundClasses, className))
</script>

<div class={classes} class:hidden={!show} {onclick} role="presentation"></div>
