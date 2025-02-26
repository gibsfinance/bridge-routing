<script lang="ts">
  import Icon from '@iconify/svelte'
  import Lazy from './Lazy.svelte'
  import Image from './Image.svelte'
  type Props = {
    src: string
    alt?: string
    sizeClasses?: string
    visible?: boolean
    class?: string
  }
  const { src, alt, sizeClasses = 'size-8', class: className }: Props = $props()
  let loaded: boolean | null = $state(null)
  const markLoaded = (val: boolean) => () => {
    loaded = val
  }
  const onload = markLoaded(true)
  const onerror = markLoaded(false)
  const classes = $derived(`${className}`)
  const iconClass = $derived(`${className} ${sizeClasses} ${!loaded ? '' : 'invisible'}`)
</script>

<Lazy tag="div" class="grid grid-cols-1 grid-rows-1 relative h-full w-full">
  {#snippet visible(isVisible)}
    <span class="contents" data-url={src}>
      {#if loaded === false}
        <Icon icon="ph:question" class={iconClass} />
      {:else if isVisible}
        <Image {src} {alt} {onload} {onerror} class={classes} {sizeClasses} />
      {/if}
    </span>
  {/snippet}
</Lazy>
