<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  $: if (!$page.params.route && $page.route.id === '/bridge') {
    goto(`${$page.route.id}/ETH`, {
      // replaceState: true,
    })
  }
</script>
