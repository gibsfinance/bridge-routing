<script lang="ts">
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import { getPulseXQuote, type TradeType } from '$lib/stores/pulsex.svelte'
  import Icon from '@iconify/svelte'
  import type { Token } from '$lib/types.svelte'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import { Chains } from '$lib/stores/auth/types'
  import VerticalDivider from './VerticalDivider.svelte'
  import NumericInput from './NumericInput.svelte'
  import BalanceReadout from './BalanceReadout.svelte'
  import { formatUnits } from 'viem'
  import { destination } from '$lib/stores/chain-events.svelte'
  import Loading from './Loading.svelte'
  import Button from './Button.svelte'
  type Props = {
    tokenOut: Token
  }
  const { tokenOut }: Props = $props()
  const tokenInURI = $derived(bridgeSettings.assetIn.value?.logoURI)
  const bridgeTokenOut = $derived(bridgeSettings.assetOut.value as Token | null)
  const tokenIn = $derived(
    bridgeTokenOut && tokenInURI
      ? ({
          ...bridgeTokenOut,
          logoURI: tokenInURI,
        } as Token)
      : null,
  )
  let amountInControl = $state(true)
  let amountToSwapIn = $state<bigint | null>(0n)
  let amountToSwapOut = $state<bigint | null>(null)
  $effect(() => {
    if (!tokenIn || !tokenOut || (!amountToSwapIn && !amountToSwapOut) || !destination.block) {
      // console.log('no quote', !tokenIn, !tokenOut, amountToSwapIn, amountToSwapOut)
      return
    }
    const quote = getPulseXQuote({
      tokenIn,
      tokenOut,
      amountIn: amountInControl ? amountToSwapIn : null,
      amountOut: amountInControl ? null : amountToSwapOut,
    })
    quote.promise.then((result) => {
      if (quote.controller.signal.aborted || !result) return
      if (amountInControl) {
        amountToSwapOut = truncateValue(result.outputAmount.value, tokenOut.decimals)
      } else {
        amountToSwapIn = truncateValue(result.inputAmount.value, tokenIn.decimals)
      }
    })
    return quote.cleanup
  })
  const truncateValue = (value: string, decimals: number) => {
    const int = BigInt(value)
    const decimal = formatUnits(int, decimals)
    const [i, d] = decimal.split('.')
    if (i.length > 3) {
      // truncate to half the number of decimals
      const targetDecimals = Math.floor(decimals / 2)
      const delta = decimals - targetDecimals
      const expanded = 10n ** BigInt(delta)
      // truncate to half the number of decimals from the bigint
      return (int / expanded) * expanded
    }
    return int
  }
  const swapButtonClassNames = $derived(
    'btn bg-tertiary-500 text-surface-contrast-950 h-16 rounded-none px-4 w-16',
  )
</script>

<div
  class="w-full card preset-outline-surface-500 bg-surface-950-50 shadow-sm hover:shadow-lg transition-all duration-100 overflow-hidden">
  <header class="flex flex-row justify-between relative h-16">
    {#if tokenIn}
      <div class="flex flex-row items-center w-1/2 justify-end pr-6 gap-2">
        <div class="flex flex-row-reverse items-center gap-1 absolute top-0 left-0">
          <BalanceReadout
            token={tokenIn}
            roundedClasses="rounded-tl"
            hideSymbol
            decimalLimit={9}
            onmax={(balance) => {
              amountToSwapIn = balance
            }} />
        </div>
        <NumericInput
          class="w-full input ring-0 focus:ring-0 text-right  placeholder:text-gray-600 text-surface-contrast-50"
          value={amountToSwapIn}
          decimals={tokenIn.decimals}
          oninput={(v) => {
            amountInControl = true
            amountToSwapIn = v
            amountToSwapOut = null
          }} />
        <AssetWithNetwork asset={tokenIn} network={Chains.PLS} />
      </div>
      <VerticalDivider>
        <Icon
          icon="gridicons:chevron-right"
          class="text-surface-500 bg-surface-950-50 rounded-full w-full h-full ring-2 ring-current ring-inset p-0.5" />
      </VerticalDivider>
      <div
        class="size-6 absolute left-0 bottom-0 text-surface-contrast-50 ml-1 flex items-center justify-center">
        <Loading key="pulsex-quote" />
      </div>
      <div class="flex flex-row items-center w-1/2 pl-6 gap-2">
        <!-- output token -->
        <AssetWithNetwork asset={tokenOut} network={Chains.PLS} />
        <NumericInput
          paddingClass="px-0"
          class="w-full input ring-0 focus:ring-0  placeholder:text-gray-600 placeholder: text-surface-contrast-50"
          value={amountToSwapOut}
          decimals={tokenOut.decimals}
          oninput={(v) => {
            amountInControl = false
            amountToSwapOut = v
            amountToSwapIn = null
          }} />
        <Button disabled class={swapButtonClassNames}>Swap</Button>
      </div>
    {/if}
  </header>
</div>
