<!-- this component shows the bridges that have been triggered by the provided address, on the provided bridge pair -->

<!--
<script lang="ts">
  import Loader from './Loader.svelte'
  import { bridges } from '../stores/history'
  import { accountState } from '../stores/auth/AuthProvider.svelte'
  const walletAccount = $derived(accountState.address)
</script>
 -->

<!--
go to the bridge history api endpoint and get the bridges for the provided address and bridge pair
map out the progress of each bridge and display it to the user
-->
<!--
{#if !walletAccount}
  <div class="text-center w-full">Connect wallet to see history</div>
{:else if !bridges}
  <div class="flex flex-col w-full">
    <div class="flex w-full justify-center">
      <Loader class="size-6" />
    </div>
  </div>
{:else if bridges.length}{:else}
  <div class="flex w-full items-center justify-center">
    <h5 class="text-center">No bridges found. Try to bridge now or check a different address.</h5>
  </div>
{/if}
 -->
