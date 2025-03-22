<script lang="ts">
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import * as transactions from '$lib/stores/transactions'
  import {
    accountState,
    appkitNetworkById,
    switchNetwork,
  } from '$lib/stores/auth/AuthProvider.svelte'
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { formatUnits, type Hex, zeroAddress } from 'viem'
  import * as input from '$lib/stores/input.svelte'
  import { assetLink, blocks, fromTokenBalance } from '$lib/stores/chain-events.svelte'
  import { transactionButtonPress } from '$lib/stores/transaction'
  import { connect } from '$lib/stores/auth/AuthProvider.svelte'
  import { getContext } from 'svelte'
  import type { ToastContext } from '@skeletonlabs/skeleton-svelte'
  import Button from './Button.svelte'

  const toast = getContext('toast') as ToastContext

  const { shouldDeliver } = input

  const tokenBalance = $derived(fromTokenBalance.value ?? 0n)
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
    return await transactions.sendTransaction({
      ...bridgeSettings.transactionInputs,
      ...transactions.options(chainsMetadata[input.bridgeKey.fromChain].id, blocks.get(Number(input.bridgeKey.fromChain))!),
    })
  }
  let amountInBefore = ''
  const sendIncreaseApproval = $derived(
    transactionButtonPress({
      toast,
      chainId: Number(input.bridgeKey.fromChain),
      steps: [
        async () => {
          return transactions.checkAndRaiseApproval({
            token: bridgeSettings.assetIn.value!.address as Hex,
            spender: bridgeSettings.bridgePathway!.from!,
            chainId: Number(input.bridgeKey.fromChain),
            minimum: bridgeSettings.amountToBridge,
            latestBlock: blocks.get(Number(input.bridgeKey.fromChain))!,
          })
        },
      ],
    }),
  )
  const decimals = $derived(bridgeSettings.assetIn.value!.decimals)
  const sendInitiateBridge = $derived(
    transactionButtonPress({
      toast,
      chainId: Number(input.bridgeKey.fromChain),
      steps: [
        () => {
          amountInBefore = formatUnits(bridgeSettings.amountToBridge, decimals)
          return initiateBridge()
        },
      ],
      after: () => {
        const previousAmount = formatUnits(bridgeSettings.amountToBridge!, decimals)
        if (amountInBefore === previousAmount) {
          input.amountIn.value = null
        }
      },
    }),
  )
  // const testId = 'progression-button'
  const inputIsNative = $derived(bridgeSettings.assetIn.value?.address === zeroAddress)
  const isBridgeToken = $derived(assetLink.value?.originationChainId !== input.bridgeKey.fromChain)
  // const canDeliver = $derived.by(() => {
  //   return isBridgeToken || hasSufficientApproval || inputIsNative
  // })
  const isRequiredChain = $derived(accountState.chainId === Number(input.bridgeKey.fromChain))
  const hasSufficientApproval = $derived(
    !!bridgeSettings.approval.value &&
      bridgeSettings.approval.value >= bridgeSettings.amountToBridge,
  )
  const skipApproval = $derived.by(() => {
    return isBridgeToken || hasSufficientApproval || inputIsNative
  })
  const disabled = $derived.by(() => {
    if (!accountState?.address) {
      return false
    }
    if (!isRequiredChain) {
      return false
    }
    if (!skipApproval) {
      return hasSufficientApproval
    }
    return !input.amountIn.value || input.amountIn.value > tokenBalance
  })
  const text = $derived.by(() => {
    if (!accountState?.address) {
      return 'Connect'
    }
    if (!isRequiredChain) {
      return 'Switch Network'
    }
    if (!skipApproval) {
      return 'Approve'
    }
    const requiresDelivery = bridgeSettings.bridgePathway?.requiresDelivery
    if ((!shouldDeliver.value && requiresDelivery) || !requiresDelivery) {
      return 'Bridge'
    }
    return 'Bridge and Deliver'
  })
  const switchToChain = $derived(() =>
    switchNetwork(appkitNetworkById.get(Number(input.bridgeKey.fromChain))),
  )
  const onclick = $derived.by(() => {
    if (!accountState?.address) {
      return connect
    }
    if (!isRequiredChain) {
      return switchToChain
    }
    if (!skipApproval) {
      return sendIncreaseApproval
    }
    return sendInitiateBridge
  })
</script>

<div class="flex w-full">
  <Button
    class="bg-tertiary-600 w-full text-surface-contrast-950 leading-10 p-2 rounded-2xl"
    {onclick}
    {disabled}>{text}</Button>
</div>
