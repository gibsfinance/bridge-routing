<script lang="ts">
  import Icon from '@iconify/svelte'
  import Image from './Image.svelte'
  import classNames from 'classnames'
  type Props = {
    src: string
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
  const classes = $derived(classNames(`${className} ${!loaded ? 'invisible' : ''}`))
  const iconClass = $derived(
    classNames(`absolute opacity-70 ${className} ${sizeClasses} ${!loaded ? '' : 'invisible'}`),
  )
</script>

<div class="flex relative">
  <Icon icon="nrk:media-404-notfound" class={iconClass} data-src={src} />
  <Image {src} {alt} {onload} {onerror} class={classes} {sizeClasses} {containerClasses} />
</div>
