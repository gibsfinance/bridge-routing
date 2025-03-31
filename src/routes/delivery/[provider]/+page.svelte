<script lang="ts">
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import { zeroAddress } from 'viem'
  goto(`#/delivery/${page.params.provider}/ETH/PLS/${zeroAddress}`)
</script>
