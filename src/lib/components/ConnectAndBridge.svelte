<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import * as transactions from '$lib/stores/transactions'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { formatUnits, type Hex, zeroAddress } from 'viem'
  import Loading from './Loading.svelte'
  import * as input from '$lib/stores/input.svelte'
  import { assetLink, fromTokenBalance } from '$lib/stores/chain-events.svelte'
  import { transactionButtonPress } from '$lib/stores/transaction'
  import { connect } from '$lib/stores/auth/AuthProvider.svelte'
  import { getContext } from 'svelte'

  const toast = getContext('toast')

  const { shouldDeliver } = input

  let disabledByClick = $state(false)
  const tokenBalance = $derived(fromTokenBalance.value || 0n)
  const walletAccount = $derived(accountState.address)
  const disabled = $derived(
    disabledByClick ||
      BigInt(walletAccount || 0n) === 0n ||
      bridgeSettings.amountToBridge === 0n ||
      bridgeSettings.amountToBridge > tokenBalance,
  )
  const initiateBridge = async () => {
    if (!bridgeSettings.foreignDataParam) {
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
    if (!bridgeSettings.bridgePathway) {
      return
    }
    if (!assetLink || !bridgeSettings.assetIn.value || !bridgeSettings.transactionInputs) {
      return
    }
    // const options = opts()
    return await transactions.sendTransaction({
      ...bridgeSettings.transactionInputs,
      ...transactions.options(chainsMetadata[input.bridgeKey.fromChain].id),
    })
  }
  // const increaseApproval = async () => {
  //   if (!bridgeSettings.bridgePathway || !bridgeSettings.assetIn.value) {
  //     return
  //   }
  //   return transactions.sendApproval({
  //     token: bridgeSettings.assetIn.value.address as Hex,
  //     spender: bridgeSettings.bridgePathway.from,
  //     chainId: chainsMetadata[input.bridgeKey.fromChain].id,
  //     account: input.amountIn.value!,
  //   })
  // }
  let amountInBefore = ''
  const sendIncreaseApproval = transactionButtonPress({
    toast,
    steps: [increaseApproval],
  })
  const decimals = $derived(bridgeSettings.assetIn.value!.decimals)
  const sendInitiateBridge = transactionButtonPress({
    toast,
    steps: [
      () => {
        amountInBefore = formatUnits(input.amountIn.value!, decimals)
        return initiateBridge()
      },
    ],
    after: () => {
      const previousAmount = formatUnits(input.amountIn.value!, decimals)
      if (amountInBefore === previousAmount) {
        input.amountIn.value = null
      }
    },
  })
  const testId = 'progression-button'
  const isNative = $derived(bridgeSettings.assetIn.value?.address === zeroAddress)
</script>

<div class="flex w-full">
  {#if walletAccount}
    {#if assetLink.value?.originationChainId !== input.bridgeKey.fromChain || (bridgeSettings.approval.value && bridgeSettings.approval.value >= bridgeSettings.amountToBridge) || isNative}
      <button
        data-testid={testId}
        class="px-2 text-white w-full rounded-lg active:bg-tertiary-500 leading-10 flex items-center justify-center"
        class:hover:bg-tertiary-500={!disabled}
        class:bg-tertiary-600={!disabled}
        class:bg-tertiary-400={disabled}
        class:cursor-not-allowed={disabled}
        class:shadow-md={!disabled}
        {disabled}
        onclick={sendInitiateBridge}>
        <div class="size-5"></div
        >&nbsp;Bridge{#if shouldDeliver.value && bridgeSettings.bridgePathway?.requiresDelivery}
          &nbsp;+&nbsp;Deliver{:else if !shouldDeliver.value && bridgeSettings.bridgePathway?.requiresDelivery}&nbsp;Only{/if}&nbsp;<div
          class="size-5"><Loading key="user" /></div>
      </button>
    {:else}
      <button
        data-testid={testId}
        class="px-2 text-white w-full rounded-lg active:bg-tertiary-500 leading-10 flex items-center justify-center hover:bg-tertiary-500 bg-tertiary-600 shadow-md"
        onclick={sendIncreaseApproval}>
        <div class="size-5"></div>&nbsp;Approve
        {bridgeSettings.assetIn.value?.symbol}&nbsp;<div class="size-5"><Loading key="user" /></div>
      </button>
    {/if}
  {:else}
    <button
      class="px-2 leading-10 bg-tertiary-600 text-white w-full rounded-lg hover:bg-tertiary-500 active:bg-tertiary-500"
      data-testid={testId}
      onclick={() => connect()}>
      Sign In
    </button>
  {/if}
</div>
