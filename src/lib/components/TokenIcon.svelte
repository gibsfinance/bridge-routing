<script lang="ts" context="module">
  const cached = new Map<string, string>()
</script>

<script lang="ts">
  import Icon from '@iconify/svelte'
  export let src = ''
  export let alt = ''
  export let size = 32
  export let visible = false
</script>

{#if !src || !visible}
  <Icon icon="ph:question" height={size} width={size} />
{:else}
  <img {src} {alt} height={size} width={size} />
{/if}
