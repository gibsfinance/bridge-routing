<script lang="ts">
  import Icon from '@iconify/svelte'
  import Image from './Image.svelte'
  import classNames from 'classnames'
  type Props = {
    src: string | null
    alt?: string
    sizeClasses?: string
    visible?: boolean
    class?: string
    containerClasses?: string
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
  const classes = $derived(classNames('rounded-full', className, !loaded ? 'invisible' : ''))
  const iconClass = $derived(
    classNames('absolute opacity-70', className, !loaded ? '' : 'invisible', sizeClasses),
  )
</script>

<div class="flex relative rounded-full">
  <Icon icon="nrk:media-404-notfound" class={iconClass} data-src={src ?? `${src}`} />
  {#if src}
    <Image {src} {alt} {onload} {onerror} class={classes} {sizeClasses} {containerClasses} />
  {/if}
</div>
