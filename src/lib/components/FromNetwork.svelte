<script lang="ts">
  import { bridgeSettings } from '../stores/bridge-settings.svelte'
  import * as input from '../stores/input.svelte'
  import * as nav from '../stores/nav.svelte'
  import { bridgeKey } from '../stores/input.svelte'
  import type { InputValue, Token } from '../types.svelte'
  import SectionInput from './SectionInput.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import { chainsMetadata } from '../stores/auth/constants'
  import BridgeProviderToggle from './BridgeProviderToggle.svelte'
  import { isProd, pathways, validBridgeKeys } from '../stores/config.svelte'
  import { Chains, toChain } from '../stores/auth/types'
  import _ from 'lodash'
  import {
    fromTokenBalance,
    minBridgeAmountIn,
    minBridgeAmountInKey,
  } from '../stores/chain-events.svelte'

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
  const handleInput = ({ int }: InputValue) => {
    if (int !== null) {
      input.amountIn.value = int
    }
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
  const invalidValue = $derived.by(() => {
    const minAmount = minBridgeAmountIn.get(
      minBridgeAmountInKey(bridgeKey.value, bridgeSettings.assetIn.value),
    )
    if (!minAmount) return true
    return !!input.amountIn.value && input.amountIn.value < minAmount
  })
</script>

<SectionInput
  label="Input"
  focused
  token={bridgeSettings.assetIn.value}
  onbalanceupdate={keepBalance}
  value={bridgeSettings.amountToBridge ?? 0n}
  onmax={handleMaxBalance}
  oninput={handleInput}
  {invalidValue}>
  {#snippet radio()}
    <BridgeProviderToggle />
  {/snippet}
  {#snippet modal({ close })}
    <TokenSelect
      {chains}
      {tokens}
      selectedToken={bridgeSettings.assetIn.value}
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
