<script lang="ts">
  import { page } from '../stores/app-page.svelte'
  const value = page.val.path.slice(0).replace('/delivery', '/bridge')
  const params = page.val.params
  page.pushState(value, params)
</script>
