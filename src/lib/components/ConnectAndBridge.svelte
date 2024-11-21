<script lang="ts">
  import { humanReadableNumber } from '$lib/stores/utils'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { useAuth } from '$lib/stores/auth/methods'
  import { walletAccount } from '$lib/stores/auth/store'
  import {
    fromTokenBalance,
    amountToBridge,
    foreignDataParam,
    // foreignCalldata,
    transactionInputs,
  } from '$lib/stores/bridge-settings'
  import { type Hex, getContract, erc20Abi, maxUint256, zeroAddress } from 'viem'
  import Loading from './Loading.svelte'
  import * as input from '$lib/stores/input'
  import { tokenBridgeInfo, assetLink, approval } from '$lib/stores/chain-events'
  import { loading } from '$lib/stores/loading'
  import { get } from 'svelte/store'
  import { addMessage, removeMessage, uri } from '$lib/stores/toast'

  const { walletClient, assetIn, clientFromChain, bridgeKey, bridgePathway, fromChainId } = input

  let disabledByClick = false
  $: tokenBalance = $fromTokenBalance || 0n
  $: disabled =
    disabledByClick ||
    BigInt($walletAccount || 0n) === 0n ||
    $amountToBridge === 0n ||
    $amountToBridge > tokenBalance

  const { connect } = useAuth()

  const transactionButtonPress = (fn: () => Promise<Hex | undefined>) => async () => {
    disabledByClick = true
    try {
      loading.increment('user')
      const amountInBefore = get(input.amountIn)
      const txHash = await fn()
      if (!txHash) {
        return
      }
      const msg = {
        message: 'Submitted: ' + txHash.slice(0, 6) + '...' + txHash.slice(-4),
        link: uri($fromChainId, 'tx', txHash),
        label: 'submit-tx',
      }
      addMessage(msg)
      const receipt = await clientFromChain($fromChainId).waitForTransactionReceipt({
        hash: txHash,
      })
      removeMessage(msg)
      addMessage({
        message: 'Confirmed: ' + txHash.slice(0, 6) + '...' + txHash.slice(-4),
        link: uri($fromChainId, 'tx', txHash),
        label: 'confirm-tx',
      })
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
    if (!$foreignDataParam) {
      return
    }
    // TODO: add tracing call on foreign network to show that the bridge will be successful
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
    if (!$bridgePathway) {
      return
    }
    if (!$assetLink || !$assetIn || !$transactionInputs) {
      return
    }
    const options = opts()
    return await $walletClient!.sendTransaction({
      ...$transactionInputs,
      ...options,
    })
  }
  const opts = () => {
    const account = $walletAccount as Hex
    const options = {
      account,
      type: 'eip1559',
      chain: chainsMetadata[$fromChainId],
    } as const
    return options
  }
  const increaseApproval = async () => {
    if (!$bridgePathway || !$assetIn) {
      return
    }
    const contract = getContract({
      abi: erc20Abi,
      address: $assetIn.address,
      client: $walletClient!,
    })
    const options = opts()
    return await contract.write.approve([$bridgePathway.from, maxUint256], options)
  }
  const sendInitiateBridge = transactionButtonPress(initiateBridge)
  const sendIncreaseApproval = transactionButtonPress(increaseApproval)
  const testId = 'progression-button'
  $: isNative = $assetIn?.address === zeroAddress
</script>

<div>
  {#if $walletAccount}
    {#if $assetLink?.originationChainId !== $fromChainId || $approval >= $amountToBridge || isNative}
      <button
        data-testid={testId}
        class="px-2 text-white w-full rounded-lg active:bg-purple-500 leading-10 flex items-center justify-center"
        class:hover:bg-purple-500={!disabled}
        class:bg-purple-600={!disabled}
        class:bg-purple-400={disabled}
        class:cursor-not-allowed={disabled}
        class:shadow-md={!disabled}
        {disabled}
        on:click={sendInitiateBridge}>
        <div class="size-5"></div>&nbsp;Bridge&nbsp;<div class="size-5"><Loading key="user" /></div>
      </button>
    {:else}
      <button
        data-testid={testId}
        class="px-2 text-white w-full rounded-lg active:bg-purple-500 leading-10 flex items-center justify-center hover:bg-purple-500 bg-purple-600 shadow-md"
        on:click={sendIncreaseApproval}>
        <div class="size-5"></div>&nbsp;Approve
        {$assetIn?.symbol}&nbsp;<div class="size-5"><Loading key="user" /></div>
      </button>
    {/if}
  {:else}
    <button
      class="px-2 leading-10 bg-purple-600 text-white w-full rounded-lg hover:bg-purple-500 active:bg-purple-500"
      data-testid={testId}
      on:click={() => connect()}>
      Sign In
    </button>
  {/if}
</div>
<!-- {#each hashes as txHash}
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
{/each} -->
