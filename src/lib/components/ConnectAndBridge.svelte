<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { useAuth } from '$lib/stores/auth/methods'
  import { clientFromChain, walletClient, walletAccount } from '$lib/stores/auth/store'
  import { Chains } from '$lib/stores/auth/types'
  import {
    erc677abi,
    bridgeAddress,
    amountToBridge,
    assets,
    foreignData,
  } from '$lib/stores/bridge-settings'
  import { getContract, type Hex } from 'viem'

  $: disabled = BigInt($walletAccount || 0n) === 0n || $amountToBridge === 0n

  const { connect } = useAuth()

  const initiateBridge = async () => {
    const token = getContract({
      abi: erc677abi,
      address: assets.ETH.input.address,
      client: $walletClient!,
    })
    const txHash = await token.write.transferAndCall(
      [$bridgeAddress, $amountToBridge, $foreignData],
      {
        account: $walletAccount as Hex,
        type: 'eip1559',
        chain: chainsMetadata[Chains.PLS],
      },
    )
    console.log(txHash)
    const receipt = await clientFromChain(Chains.PLS).waitForTransactionReceipt({
      hash: txHash,
    })
    console.log(receipt)
  }
</script>

<div>
  {#if $walletAccount}
    <button
      class="p-2 bg-purple-600 text-white w-full rounded-lg hover:bg-purple-500 active:bg-purple-500"
      class:opacity-70={disabled}
      class:cursor-not-allowed={disabled}
      class:shadow-md={!disabled}
      on:click={initiateBridge}>Bridge</button>
  {:else}
    <button
      class="p-2 bg-purple-600 text-white w-full rounded-lg hover:bg-purple-500 active:bg-purple-500"
      on:click={() => connect()}>Connect</button>
  {/if}
</div>
