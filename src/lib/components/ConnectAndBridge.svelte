<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import * as viem from 'viem'
  import { useAuth } from '$lib/stores/auth/methods'
  import { clientFromChain, walletClient, walletAccount } from '$lib/stores/auth/store'
  import { Chains } from '$lib/stores/auth/types'
  import {
    erc677abi,
    bridgeAddress,
    amountToBridge,
    assets,
    foreignData,
    router,
    outputRouterAbi,
    amountAfterBridgeFee,
    foreignBridgeAddress,
    foreignCalldata,
    feeDirectorStructEncoded,
  } from '$lib/stores/bridge-settings'
  import { getContract, type Hex } from 'viem'

  $: disabled = BigInt($walletAccount || 0n) === 0n || $amountToBridge === 0n

  const { connect } = useAuth()

  const initiateBridge = async () => {
    // const foreignClient = clientFromChain(Chains.ETH).extend((client) => ({
    //   // ...
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
    //   // ...
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
    //         address: assets.ETH.output.address,
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
    // console.log($feeDirectorStructEncoded)
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
