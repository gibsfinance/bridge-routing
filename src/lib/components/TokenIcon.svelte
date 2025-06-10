<script lang="ts">
  import Icon from '@iconify/svelte'
  import Image from './Image.svelte'
  import type { ClassValue } from 'svelte/elements'
  type Props = {
    src: string
    alt?: string
    sizeClasses?: ClassValue
    visible?: boolean
    class?: ClassValue
    containerClasses?: ClassValue
  }
  const {
    src,
    alt,
    sizeClasses = 'size-8',
    class: className = '',
    containerClasses,
  }: Props = $props()
  let loaded: boolean | null = $state(null)
  const markLoaded = (val: boolean) => () => {
    loaded = val
  }
  const onload = markLoaded(true)
  const onerror = markLoaded(false)
  const classes = $derived(['rounded-full', className, !loaded ? 'invisible' : ''])
  const iconClass = $derived(['absolute opacity-75', className, loaded && 'invisible', sizeClasses])
</script>

<div class="flex relative rounded-full" data-src={src ?? `${src}`}>
  {#if src}
    <Image {src} {alt} {onload} {onerror} class={classes} {sizeClasses} {containerClasses} />
  {:else}
    <Icon icon="nrk:media-404-notfound" class={iconClass} />
  {/if}
</div>
