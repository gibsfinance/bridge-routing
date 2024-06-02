<script lang="ts">
  import * as env from '$app/environment'
  const appVersion = __APP_VERSION__
</script>

<span class="block text-center w-full font-mono font-thin text-sm my-2">
  v{appVersion}@{env.version}
</span>
