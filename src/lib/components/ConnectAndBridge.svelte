<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { useAuth } from '$lib/stores/auth/methods'
  import { clientFromChain, walletAccount, walletClient } from '$lib/stores/auth/store'
  import { Chains } from '$lib/stores/auth/types'
  import {
    feeManagerStructEncoded,
    bridgeAddress,
    amountToBridge,
    receiver,
    assetIn,
    inputBridgeAbi,
  } from '$lib/stores/bridge-settings'
  import { getContract, type Hex, type WalletClient } from 'viem'

  $: disabled = BigInt($walletAccount || 0n) === 0n || $amountToBridge === 0n

  const { connect } = useAuth()

  const initiateBridge = async () => {
    const bridge = getContract({
      address: $bridgeAddress,
      abi: inputBridgeAbi,
      client: $walletClient as WalletClient,
    })
    const txHash = await bridge.write.relayTokensAndCall(
      [$receiver, $assetIn.address, $amountToBridge, $feeManagerStructEncoded],
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

{#if $walletAccount}
  <div>
    <button
      class="p-2 bg-purple-600 text-white w-full rounded-lg hover:bg-purple-500 active:bg-purple-500"
      class:opacity-70={disabled}
      class:cursor-not-allowed={disabled}
      class:shadow-md={!disabled}
      on:click={initiateBridge}>Bridge</button>
  </div>
{:else}
  <div>
    <button
      class="p-2 bg-purple-600 text-white w-full rounded-lg hover:bg-purple-500 active:bg-purple-500"
      on:click={() => connect()}>Connect</button>
  </div>
{/if}
