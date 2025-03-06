<script lang="ts">
  import classNames from 'classnames'

  type Props = {
    show: boolean
    class?: string
    sizeClasses?: string
    positionClasses?: string
    backgroundClasses?: string
  }
  const {
    show,
    class: className,
    sizeClasses = 'h-full w-full',
    positionClasses = 'absolute',
    backgroundClasses = 'bg-black/50',
  }: Props = $props()
  const classes = $derived(classNames(positionClasses, sizeClasses, backgroundClasses, className))
</script>

<div class={classes} class:hidden={!show}></div>
