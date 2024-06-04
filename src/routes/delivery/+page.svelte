<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  $: if ($page.route.id?.includes('bridge')) {
    goto(`/delivery/ETH`, {
      // replaceState: true,
    })
  }
</script>
