<script lang="ts">
  const { locked }: { locked: boolean } = $props()
</script>

{#if locked}🔒{:else}🔓{/if}
