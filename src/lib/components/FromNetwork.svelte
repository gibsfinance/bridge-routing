<script lang="ts">
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import * as input from '$lib/stores/input.svelte'
  import * as nav from '$lib/stores/nav.svelte'
  import { bridgeKey } from '$lib/stores/input.svelte'
  import type { Token } from '$lib/types.svelte'
  import SectionInput from './SectionInput.svelte'
  import TokenAndNetworkSelector from './TokenAndNetworkSelector.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import BridgeProviderToggle from './BridgeProviderToggle.svelte'
  import { isProd, pathways, validBridgeKeys } from '$lib/stores/config.svelte'
  import { Chains, toChain } from '$lib/stores/auth/types'
  import _ from 'lodash'
  import { fromTokenBalance } from '$lib/stores/chain-events.svelte'

  const chooseTokenSubmit = async (token: Token) => {
    const bridgeKey = input.bridgeKey.value
    const native = input.isNative(token, bridgeKey)
    input.unwrap.value = native
    input.amountIn.value = null
    input.resetFeeInputs()
    nav.delivery.shallow(bridgeKey, token.address)
  }
  const chooseTokenAndNetworkSubmit = async (token: Token, chainId: number) => {
    const availablePaths = _.get(pathways, [bridgeKey.provider, toChain(chainId!)]) ?? {}
    const keys = Object.keys(availablePaths)
    const destinationChain = keys[0]
    if (!destinationChain) {
      throw new Error('no to chain found')
    }
    const options = [
      bridgeKey.provider,
      toChain(chainId!),
      destinationChain as Chains,
    ] as input.BridgeKey
    nav.delivery.shallow(options, token.address)
  }
  const keepBalance = (bal: bigint | null) => {
    fromTokenBalance.value = bal
  }
  const handleInput = (amount: bigint) => {
    // if (balance !== null) {
    //   if (amount > balance) {
    //     amount = balance
    //   }
    // }
    input.amountIn.value = amount
  }
  const handleMaxBalance = (bal: bigint) => {
    input.amountIn.value = bal
  }
  const chains = $derived.by(() => {
    const chains = Object.keys(chainsMetadata).map(Number) as [number, ...number[]]
    const validChains = validBridgeKeys(isProd.value)
      .filter(([provider]) => provider === bridgeKey.provider)
      .map(([, chain]) => chain)
    return chains.filter((key) => {
      return validChains.includes(toChain(key))
    }) as [number, ...number[]]
  })
  const tokens = $derived.by(() => {
    const sorted = input.bridgableTokens.value
    const [withImage, withoutImage] = _.partition(sorted, (t) => !!t.logoURI)
    return [...withImage, ...withoutImage]
  })
</script>

<SectionInput
  label="Input"
  focused
  token={bridgeSettings.assetIn.value}
  onbalanceupdate={keepBalance}
  value={bridgeSettings.amountToBridge ?? 0n}
  onmax={handleMaxBalance}
  oninput={handleInput}>
  {#snippet radio()}
    <BridgeProviderToggle />
  {/snippet}
  {#snippet modal({ close })}
    <TokenAndNetworkSelector
      {chains}
      {tokens}
      chainId={Number(bridgeKey.fromChain)}
      onsubmit={(tkn, chainId) => {
        if (tkn) {
          if (chainId && chainId !== Number(bridgeKey.fromChain)) {
            chooseTokenAndNetworkSubmit(tkn, chainId)
          } else {
            chooseTokenSubmit(tkn)
          }
        }
        close()
      }} />
  {/snippet}
</SectionInput>
