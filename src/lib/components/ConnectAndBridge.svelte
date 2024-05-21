<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { useAuth } from '$lib/stores/auth/methods'
  import { walletAccount, walletClient } from '$lib/stores/auth/store'
  import { Chains } from '$lib/stores/auth/types'
  import { calldata, to } from '$lib/stores/bridge-settings'

  $: disabled = BigInt($walletAccount || 0n) === 0n

  const { connect } = useAuth()

  const initiateBridge = async () => {
    const tx = await $walletClient?.sendTransaction({
      to: $to,
      data: $calldata,
      account: $walletAccount as `0x${string}`,
      chain: chainsMetadata[Chains.PLS],
    })
  }
</script>

{#if $walletAccount}
  <div>
    <button
      class="p-2 bg-purple-600 text-white w-full rounded-lg hover:bg-purple-500 active:bg-purple-500"
      class:opacity-70={disabled}
      class:cursor-not-allowed={disabled}
      on:click={initiateBridge}>Bridge</button
    >
  </div>
{:else}
  <div>
    <button
      class="p-2 bg-purple-600 text-white w-full rounded-lg hover:bg-purple-500 active:bg-purple-500"
      on:click={() => connect()}>Connect</button
    >
  </div>
{/if}
