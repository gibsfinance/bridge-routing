<script lang="ts">
  import lifi from '$lib/images/providers/lifi.svg?raw'
  import classNames from 'classnames'
  import Icon from '@iconify/svelte'
  type Props = {
    textColor?: string
    size?: string
    position?: string
  }
  const {
    textColor = '[&>svg]:stroke-white [&>svg>path]:fill-white',
    size = 'h-full w-16',
    position = 'inline-flex translate-y-2.5 -mt-2.5',
  }: Props = $props()
  const classes = $derived(classNames(position, textColor, size))
</script>

<a href="https://li.fi/" target="_blank" class="inline-flex items-center gap-2">
  <!-- eslint-disable-next-line -->
  <span class={classes}>{@html lifi}</span>
  <Icon icon="gis:direct" class="size-6 {position}" />
</a>
