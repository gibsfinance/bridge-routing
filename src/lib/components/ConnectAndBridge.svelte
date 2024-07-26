<script lang="ts">
  import { humanReadableNumber } from '$lib/stores/utils'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { useAuth } from '$lib/stores/auth/methods'
  import { walletAccount } from '$lib/stores/auth/store'
  import { Chains } from '$lib/stores/auth/types'
  import {
    amountToBridge,
    foreignDataParam,
    foreignCalldata,
    // assetOut,
    // amountAfterBridgeFee,
  } from '$lib/stores/bridge-settings'
  import * as abis from '$lib/stores/abis'
  import { type Hex, getContract, erc20Abi, maxUint256 } from 'viem'
  import Loading from './Loading.svelte'
  import * as input from '$lib/stores/input'
  import { tokenBalance, tokenBridgeInfo, assetLink, approval } from '$lib/stores/chain-events'
  import { loading } from '$lib/stores/loading'
  import { get } from 'svelte/store'

  const {
    walletClient,
    assetIn,
    clientFromChain,
    bridgeKey,
    router,
    bridgeAddress,
    // foreignBridgeAddress,
  } = input

  let disabledByClick = false
  $: disabled =
    disabledByClick || BigInt($walletAccount || 0n) === 0n || $amountToBridge === 0n || $amountToBridge > $tokenBalance

  const { connect } = useAuth()
  const hashes: Hex[] = []

  const transactionButtonPress = (fn: () => Promise<Hex | undefined>) => async () => {
    disabledByClick = true
    try {
      loading.increment('user')
      const amountInBefore = get(input.amountIn)
      const txHash = await fn()
      if (!txHash) {
        return
      }
      const receipt = await clientFromChain(Chains.PLS).waitForTransactionReceipt({
        hash: txHash,
      })
      wipeTxHash(txHash)
      if (fn === initiateBridge && amountInBefore === get(input.amountIn)) {
        input.amountIn.set('')
      }
      input.incrementForcedRefresh()
      console.log(receipt)
    } finally {
      loading.decrement('user')
      disabledByClick = false
    }
  }

  const initiateBridge = async () => {
    if (!$foreignCalldata || !$foreignDataParam) {
      return
    }
    // const foreignClient = clientFromChain(Chains.ETH).extend((client) => ({
    //   async traceCall(args: CallParameters) {
    //     return client.request({
    //       method: 'debug_traceCall' as unknown as any,
    //       params: [
    //         {
    //           ...formatTransactionRequest(args),
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
    // const trace = await foreignClient.traceCall({
    //   // abi: outputRouterAbi,
    //   to: $router,
    //   data: $foreignCalldata,
    //   // functionName: 'onTokenBridged',
    //   // args: [assets.ETH.output.address, $amountAfterBridgeFee, $foreignDataParam],
    //   // from: $foreignBridgeAddress,
    //   stateOverride: [
    //     {
    //       address: $foreignBridgeAddress,
    //       balance: 100n * 10n ** 18n,
    //     },
    //     {
    //       address: $assetOut.address,
    //       stateDiff: [
    //         {
    //           slot: keccak256(
    //             encodeAbiParameters(
    //               parseAbiParameters('address, uint256'),
    //               [$router, 3n], // balance of is at 3rd storage slot on weth canonical
    //             ),
    //           ),
    //           value: numberToHex($amountAfterBridgeFee),
    //         },
    //       ],
    //     },
    //   ],
    // })
    // console.info(trace)
    //   await foreignClient.simulateContract({
    //     abi: abis.outputRouter,
    //     address: $router,
    //     functionName: 'onTokenBridged',
    //     args: [$assetOut.address, $amountAfterBridgeFee, $foreignDataParam],
    //     account: $foreignBridgeAddress,
    //     stateOverride: [
    //       {
    //         address: $foreignBridgeAddress,
    //         balance: 100n * 10n ** 18n,
    //       },
    //       {
    //         address: $assetOut.address,
    //         stateDiff: [
    //           {
    //             slot: keccak256(
    //               encodeAbiParameters(
    //                 parseAbiParameters('address, uint256'),
    //                 [$router, 3n], // balance of is at 3rd storage slot on weth canonical
    //               ),
    //             ),
    //             value: numberToHex(maxUint256),
    //             // numberToHex($amountAfterBridgeFee, {
    //             //   size: 32,
    //             // }),
    //           },
    //         ],
    //       },
    //     ],
    //   })
    // } catch (err) {
    //   console.error(err)
    //   throw err
    // }
    // const to = assets[$bridgeKey].input.address
    const tokenInfo = await tokenBridgeInfo([$bridgeKey, $assetIn])
    if (!tokenInfo || !$assetIn) {
      return
    }
    const account = $walletAccount as Hex
    const options = {
      account,
      type: 'eip1559',
      chain: chainsMetadata[Chains.PLS],
    } as const
    if ($bridgeKey === Chains.BNB) {
      if (tokenInfo.toForeign) {
        // token is native to pulsechain
        const bridgeContract = getContract({
          abi: abis.inputBridgeBNB,
          address: $bridgeAddress,
          client: $walletClient!,
        })
        return await bridgeContract.write.relayTokensAndCall(
          [$assetIn.address, $router, $amountToBridge, $foreignDataParam, account],
          options,
        )
      } else {
        // extra arg in transfer+call
        const contract = getContract({
          abi: abis.erc677BNB,
          address: $assetIn.address,
          client: $walletClient!,
        })
        return await contract.write.transferAndCall(
          [$bridgeAddress, $amountToBridge, $foreignDataParam, account],
          options,
        )
      }
    } else if ($bridgeKey === Chains.ETH) {
      if (tokenInfo.toForeign) {
        // native to pulsechain
        const bridgeContract = getContract({
          abi: abis.inputBridgeETH,
          address: $bridgeAddress,
          client: $walletClient!,
        })
        return await bridgeContract.write.relayTokensAndCall(
          [$assetIn.address, $router, $amountToBridge, $foreignDataParam],
          options,
        )
      } else {
        const contract = getContract({
          abi: abis.erc677ETH,
          address: $assetIn.address,
          client: $walletClient!,
        })
        return await contract.write.transferAndCall([$bridgeAddress, $amountToBridge, $foreignDataParam], options)
      }
    } else {
      throw new Error('unrecognized chain')
    }
  }
  const wipeTxHash = (hash: Hex) => {
    setTimeout(() => {
      const index = hashes.indexOf(hash)
      if (index >= 0) {
        hashes.splice(index, 1)
      }
    }, 20_000)
  }
  const increaseApproval = async () => {
    if (!$assetIn) {
      return
    }
    const contract = getContract({
      abi: erc20Abi,
      address: $assetIn.address,
      client: $walletClient!,
    })
    const account = $walletAccount as Hex
    const options = {
      account,
      type: 'eip1559',
      chain: chainsMetadata[Chains.PLS],
    } as const
    return await contract.write.approve([$bridgeAddress, maxUint256], options)
  }
  const sendInitiateBridge = transactionButtonPress(initiateBridge)
  const sendIncreaseApproval = transactionButtonPress(increaseApproval)
</script>

<div>
  {#if $walletAccount}
    {#if $assetLink && ($assetLink.toHome || ($assetLink.toForeign && $approval >= $amountToBridge))}
      <button
        class="px-2 text-white w-full rounded-lg active:bg-purple-500 leading-10 flex items-center justify-center"
        class:hover:bg-purple-500={!disabled}
        class:bg-purple-600={!disabled}
        class:bg-purple-400={disabled}
        class:cursor-not-allowed={disabled}
        class:shadow-md={!disabled}
        {disabled}
        on:click={sendInitiateBridge}>
        <div class="size-5"></div>&nbsp;Bridge&nbsp;<Loading key="user" keepSpace class="my-[10px]" />
      </button>
    {:else}
      <button
        class="px-2 text-white w-full rounded-lg active:bg-purple-500 leading-10 flex items-center justify-center"
        class:hover:bg-purple-500={!disabled}
        class:bg-purple-600={!disabled}
        class:bg-purple-400={disabled}
        class:cursor-not-allowed={disabled}
        class:shadow-md={!disabled}
        {disabled}
        on:click={sendIncreaseApproval}>
        <div class="size-5"></div>&nbsp;Approve {!$assetIn
          ? ''
          : humanReadableNumber($amountToBridge, $assetIn.decimals)}
        {$assetIn?.symbol}&nbsp;<Loading key="user" keepSpace class="my-[10px]" />
      </button>
    {/if}
  {:else}
    <button
      class="p-2 bg-purple-600 text-white w-full rounded-lg hover:bg-purple-500 active:bg-purple-500"
      on:click={() => connect()}>
      Connect
    </button>
  {/if}
</div>
{#each hashes as txHash}
  <div class="toast mb-16">
    <div class="alert alert-info bg-purple-400 text-slate-100">
      <a
        href="{chainsMetadata[Chains.PLS].blockExplorers?.default.url}/tx/{txHash}"
        class="underline"
        aria-label="transaction details"
        target="_blank">
        Submitted: {txHash.slice(0, 6)}...{txHash.slice(-4)}
      </a>
    </div>
  </div>
{/each}
