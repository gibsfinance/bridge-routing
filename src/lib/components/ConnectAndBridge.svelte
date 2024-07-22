<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { useAuth } from '$lib/stores/auth/methods'
  import { walletAccount } from '$lib/stores/auth/store'
  import { Chains } from '$lib/stores/auth/types'
  import {
    bridgeAddress,
    amountToBridge,
    foreignData,
    // clientFromChain,
    // walletClient,
    // assetIn,
  } from '$lib/stores/bridge-settings'
  import { destinationChains } from '$lib/stores/config'
  import * as abis from '$lib/stores/abis'
  import { getContract, type Hex } from 'viem'
  import Loading from './Loading.svelte'
  import * as input from '$lib/stores/input'

  const { walletClient, assetIn, clientFromChain, bridgeKey } = input

  $: disabled = BigInt($walletAccount || 0n) === 0n || $amountToBridge === 0n

  const { connect } = useAuth()
  let txHash: Hex | undefined
  // txHash = zeroHash

  const initiateBridge = async () => {
    // const foreignClient = clientFromChain(Chains.ETH).extend((client) => ({
    //   async traceCall(args: viem.CallParameters) {
    //     return client.request({
    //       method: 'debug_traceCall' as unknown as any,
    //       params: [
    //         {
    //           ...viem.formatTransactionRequest(args),
    //           from: $foreignBridgeAddress,
    //         },
    //         'latest',
    //         {
    //           tracer: 'callTracer',
    //         },
    //       ],
    //     })
    //   },
    // }))
    // try {
    //   const trace = await foreignClient.traceCall({
    //     // abi: outputRouterAbi,
    //     to: $router,
    //     data: $foreignCalldata,
    //     // functionName: 'onTokenBridged',
    //     // args: [assets.ETH.output.address, $amountAfterBridgeFee, $foreignData],
    //     // from: $foreignBridgeAddress,
    //     stateOverride: [
    //       {
    //         address: $foreignBridgeAddress,
    //         balance: 100n * 10n ** 18n,
    //       },
    //       {
    //         address: assets[$bridgeKey].output.address,
    //         stateDiff: [
    //           {
    //             slot: viem.keccak256(
    //               viem.encodeAbiParameters(
    //                 viem.parseAbiParameters('address, uint256'),
    //                 [$router, 3n], // balance of is at 3rd storage slot on weth canonical
    //               ),
    //             ),
    //             value: viem.numberToHex($amountAfterBridgeFee),
    //           },
    //         ],
    //       },
    //     ],
    //   })
    //   console.log(trace)
    //   await foreignClient.simulateContract({
    //     abi: outputRouterAbi,
    //     address: $router,
    //     functionName: 'onTokenBridged',
    //     args: [assets.ETH.output.address, $amountAfterBridgeFee, $foreignData],
    //     account: $foreignBridgeAddress,
    //     stateOverride: [
    //       {
    //         address: $foreignBridgeAddress,
    //         balance: 100n * 10n ** 18n,
    //       },
    //       {
    //         address: assets.ETH.output.address,
    //         stateDiff: [
    //           {
    //             slot: viem.keccak256(
    //               viem.encodeAbiParameters(
    //                 viem.parseAbiParameters('address, uint256'),
    //                 [$router, 3n], // balance of is at 3rd storage slot on weth canonical
    //               ),
    //             ),
    //             value: viem.numberToHex(viem.maxUint256),
    //             // viem.numberToHex($amountAfterBridgeFee, {
    //             //   size: 32,
    //             // }),
    //           },
    //         ],
    //       },
    //     ],
    //   })
    // } catch (err) {
    //   console.log(err)
    //   throw err
    // }
    // const to = assets[$bridgeKey].input.address
    console.log('inside send transaction')
    txHash = await ($bridgeKey === Chains.BNB
      ? getContract({
          abi: abis.erc677BNB,
          address: $assetIn.address,
          client: $walletClient!,
        }).write.transferAndCall([$bridgeAddress, $amountToBridge, $foreignData, $walletAccount as Hex], {
          account: $walletAccount as Hex,
          type: 'eip1559',
          chain: chainsMetadata[Chains.PLS],
        })
      : getContract({
          abi: abis.erc677,
          address: $assetIn.address,
          client: $walletClient!,
        }).write.transferAndCall([$bridgeAddress, $amountToBridge, $foreignData], {
          account: $walletAccount as Hex,
          type: 'eip1559',
          chain: chainsMetadata[Chains.PLS],
        }))
    // txHash = await sendTransaction({
    //   sendTransaction: async () => {
    //     console.log('inside send transaction')
    //     return await ($bridgeKey === 'BNB'
    //       ? getContract({
    //           abi: erc677abiBNB,
    //           address: assets[$bridgeKey].input.address,
    //           client: $walletClient!,
    //         }).write.transferAndCall([$bridgeAddress, $amountToBridge, $foreignData, $walletAccount as Hex], {
    //           account: $walletAccount as Hex,
    //           type: 'eip1559',
    //           chain: chainsMetadata[Chains.PLS],
    //         })
    //       : getContract({
    //           abi: erc677abi,
    //           address: assets[$bridgeKey].input.address,
    //           client: $walletClient!,
    //         }).write.transferAndCall([$bridgeAddress, $amountToBridge, $foreignData], {
    //           account: $walletAccount as Hex,
    //           type: 'eip1559',
    //           chain: chainsMetadata[Chains.PLS],
    //         }))
    //   },
    //   txDetails: { to, value: '0' },
    // })
    if (!txHash) {
      return
    }
    ;((hash: Hex) =>
      setTimeout(() => {
        if (hash !== txHash) {
          return
        }
        txHash = undefined
      }, 20_000))(txHash)
    const receipt = await clientFromChain(Chains.PLS).waitForTransactionReceipt({
      hash: txHash,
    })
    console.log(receipt)
  }
</script>

<div>
  {#if $walletAccount}
    <button
      class="px-2 text-white w-full rounded-lg active:bg-purple-500 leading-10 flex items-center justify-around"
      class:hover:bg-purple-500={!disabled}
      class:bg-purple-600={!disabled}
      class:bg-purple-400={disabled}
      class:cursor-not-allowed={disabled}
      class:shadow-md={!disabled}
      on:click={initiateBridge}>
      <Loading class="my-[10px]">Bridge</Loading>
    </button>
  {:else}
    <button
      class="p-2 bg-purple-600 text-white w-full rounded-lg hover:bg-purple-500 active:bg-purple-500"
      on:click={() => connect()}>
      Connect
    </button>
  {/if}
</div>
{#if txHash}
  <div class="toast mb-16">
    <div class="alert alert-info bg-purple-400 text-slate-100">
      <a href="{chainsMetadata[Chains.PLS].blockExplorers?.default.url}/tx/{txHash}" class="underline" target="_blank">
        Submitted: {txHash.slice(0, 6)}...{txHash.slice(-4)}
      </a>
    </div>
  </div>
{/if}
