<script lang="ts">
  import Icon from '@iconify/svelte'
  import type { Token, BridgeKey } from '@gibs/bridge-sdk/types'
  import { getRecommendedSwapToken, bypassStore } from '../stores/bridged-token-detection.svelte'
  import Button from './Button.svelte'
  import Toggle from './Toggle.svelte'

  type BridgedTokenWarningProps = {
    token: Token
    bridgeKey: BridgeKey
    onSwapClick?: () => void
  }

  const { token, bridgeKey, onSwapClick }: BridgedTokenWarningProps = $props()

  const recommendedToken = $derived(getRecommendedSwapToken(bridgeKey))
  const fromChainName = $derived.by(() => {
    const [, fromChain] = bridgeKey
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      56: 'BSC',
      369: 'PulseChain',
      943: 'PulseChain V4',
      11155111: 'Sepolia',
    }
    return chainNames[Number(fromChain)] || 'Source Chain'
  })

  const toChainName = $derived.by(() => {
    const [, , toChain] = bridgeKey
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      56: 'BSC',
      369: 'PulseChain',
      943: 'PulseChain V4',
      11155111: 'Sepolia',
    }
    return chainNames[Number(toChain)] || 'Destination Chain'
  })

  const handleBypassToggle = () => {
    bypassStore.toggle()
  }
</script>

<div class="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-800 rounded-xl p-6 my-4">
  <div class="flex items-start gap-4">
    <Icon icon="mdi:information" class="text-4xl text-blue-600 dark:text-blue-400 flex-shrink-0" />
    <div class="flex-1">
      <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-3">
        This pathway probably isn't what you're looking for
      </h3>

      <div class="space-y-3 text-surface-900 dark:text-surface-100">
        <p class="leading-relaxed">
          <strong>{token.symbol}</strong> on {fromChainName} is already a bridged token from another chain.
          Bridging it to <strong>{toChainName}</strong> will create a wrapped variant with limited liquidity.
        </p>

        <div class="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p class="font-semibold mb-2 text-sm text-blue-900 dark:text-blue-100">
            Most users want to:
          </p>
          <ol class="text-sm space-y-1 list-decimal list-inside ml-2">
            <li>Swap {token.symbol} → {recommendedToken.symbol} on {fromChainName}</li>
            <li>Bridge {recommendedToken.symbol} to {toChainName}</li>
            <li>Swap {recommendedToken.symbol} → {token.symbol} on {toChainName} (if needed)</li>
          </ol>
        </div>

        {#if onSwapClick}
          <div class="pt-2">
            <Button
              onclick={onSwapClick}
              class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <Icon icon="mdi:swap-horizontal" class="text-xl" />
              Swap to {recommendedToken.symbol} first
            </Button>
            <p class="text-xs text-surface-600 dark:text-surface-400 mt-2">
              Opens {fromChainName === 'Ethereum' ? 'Uniswap' : fromChainName === 'BSC' ? 'PancakeSwap' : 'PulseX'} in a new tab
            </p>
          </div>
        {/if}

        <!-- Bypass Option -->
        <div class="pt-4 border-t border-surface-200 dark:border-surface-800">
          <label class="flex items-start gap-3 cursor-pointer">
            <Toggle
              checked={bypassStore.bypassed}
              onchange={handleBypassToggle}
            />
            <div class="flex-1">
              <p class="text-sm font-semibold">
                Bridge anyway (I know what I'm doing)
              </p>
              <p class="text-xs text-surface-600 dark:text-surface-400 mt-1">
                Skip this warning and proceed with the bridge
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
</div>
