<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  goto(`/delivery/${$page.params.page}`, {
    // replaceState: true,
  })
</script>
