<script lang="ts">
  import { goto } from '$app/navigation'
  import { defaultBridgeKey, toPath } from '$lib/stores/input'
  import { zeroAddress } from 'viem'
  goto(`/delivery/${toPath(defaultBridgeKey)}/${zeroAddress}`)
</script>
