<script lang="ts">
  import * as env from '$app/environment'
  import { page } from '$app/stores'
  const appVersion = __APP_VERSION__
  const isLocal = $page.url.host.includes('localhost')
</script>

<span class="block text-center w-full font-mono font-thin text-sm my-2">
  v{appVersion}@{isLocal ? 'local' : env.version}
</span>
