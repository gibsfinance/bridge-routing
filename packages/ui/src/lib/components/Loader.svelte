<script lang="ts">
  import Icon from '@iconify/svelte'

  interface Props {
    class?: string
    loaded?: boolean
  }

  const { class: className = '', loaded = false }: Props = $props()
</script>

<span class="flex align-baseline">
  <Icon icon="svg-spinners:3-dots-bounce" class={className + (loaded ? ' invisible' : '')} />
</span>
