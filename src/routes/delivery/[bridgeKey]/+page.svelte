<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { zeroAddress } from 'viem'
  goto(`/delivery/${$page.params.bridgeKey}/${zeroAddress}`)
</script>
