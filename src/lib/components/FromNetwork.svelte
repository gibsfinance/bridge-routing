<script lang="ts">
  import NetworkSummary from './NetworkSummary.svelte'
  import { formatUnits, parseUnits, zeroAddress } from 'viem'
  import { assetSources, bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import * as input from '$lib/stores/input.svelte'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import Warning from './Warning.svelte'
  import Icon from '@iconify/svelte'
  import * as nav from '$lib/stores/nav.svelte'
  import type { FormEventHandler } from 'svelte/elements'
  import {
    minAmount,
    fromTokenBalance,
    tokenOriginationChainId,
    assetLink,
  } from '$lib/stores/chain-events.svelte'
  import { humanReadableNumber, stripNonNumber } from '$lib/stores/utils'
  import { bridgeKey } from '$lib/stores/input.svelte'
  import ModalWrapper from './ModalWrapper.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import { goto, pushState } from '$app/navigation'
  import type { Token } from '$lib/types.svelte'
  import NumericInput from './NumericInput.svelte'
  import SectionInput from './SectionInput.svelte'
  import TokenAndNetworkSelector from './TokenAndNetworkSelector.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import BridgeSettings from './BridgeSettings.svelte'
  import { isProd, pathways, validBridgeKeys } from '$lib/stores/config.svelte'
  import { Chains, toChain } from '$lib/stores/auth/types'
  import _ from 'lodash'

  // let inputValue = $state(null)
  // let focused = $state(false)

  const chooseTokenSubmit = async (token: Token) => {
    const bridgeKey = input.bridgeKey.value
    const native = input.isNative(token, bridgeKey)
    input.unwrap.value = native
    input.fee.value = bridgeSettings.desiredExcessCompensationBasisPoints
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
  const handleInput = (amount: bigint) => {
    // inputValue = e.currentTarget.value
    // bridgeSettings.amountToBridge = amount
    input.amountIn.value = amount
  }
  const decimals = $derived(bridgeSettings.assetIn.value?.decimals || 18)
  const handleMaxBalance = (bal: bigint) => {
    // bridgeSettings.amountToBridge = bal
    input.amountIn.value = bal
    // if (typeof fromTokenBalance.value !== 'bigint') {
    //   return
    // }
    // const updated = formatUnits(fromTokenBalance.value, decimals)
    // inputValue = updated
  }
  const minTooltip = $derived(minAmount.value ? formatUnits(minAmount.value, decimals) : '...')
  // $effect(() => {
  //   const inValue = parseUnits(stripNonNumber(inputValue), decimals)
  //   input.amountIn.value = inValue
  // })
  const showWarning = $derived(
    !!minAmount.value &&
      bridgeSettings.amountToBridge < minAmount.value &&
      bridgeSettings.amountToBridge > 0n,
  )
  // const oninput = () => {}
  // const tokens = $derived(
  //   input.bridgeableTokensUnder({
  //     tokens: input.bridgableTokens.value,
  //     chain: Number(bridgeKey.fromChain),
  //     partnerChain: Number(bridgeKey.toChain),
  //   }),
  // )
  const chains = $derived.by(() => {
    const chains = Object.keys(chainsMetadata).map(Number) as [number, ...number[]]
    const validChains = validBridgeKeys(isProd.value)
      .filter(([provider]) => provider === bridgeKey.provider)
      .map(([, chain]) => chain)
    return chains.filter((key) => {
      return validChains.includes(toChain(key))
    }) as [number, ...number[]]
  })
  // $effect(() => {
  //   // if the asset is not on the from chain,
  //   // then we need to switch the asset to use the default
  //   if (bridgeSettings.assetIn.value?.chainId === Number(bridgeKey.fromChain)) {
  //     return
  //   }
  //   const defaultAsset = input.bridgeKey.pathway!.defaultAssetIn
  //   bridgeSettings.assetIn.value = defaultAsset
  // })
  const tokens = $derived.by(() => {
    // const sorted = _.sortBy(input.bridgableTokens.value, ['name', 'chainId'])

    const sorted = input.bridgableTokens.value
    const [withImage, withoutImage] = _.partition(sorted, (t) => !!t.logoURI)
    // sorted.forEach((t) => {
    //   if (t.address === '0xBf55e1d899c9943cAe022F0585a6e0D5F8fdFC20') {
    //     console.log(t)
    //   }
    // })
    // console.log(withImage.slice(0, 10).map((t) => t.name))
    // console.log(withoutImage.slice(0, 10).map((t) => t.name))
    return [...withImage, ...withoutImage]
  })
  // $inspect(_.groupBy(tokens, 'chainId'))
</script>

<!-- <div class="rounded-2xl card transition-all duration-100 hover:shadow-sm grow"> -->
<!-- <div class="flex flex-row justify-between grow w-full"> -->
<!-- {#if bridgeSettings.assetIn.value} -->
<SectionInput
  label="Input"
  focused
  token={bridgeSettings.assetIn.value}
  onbalanceupdate={() => {}}
  value={bridgeSettings.amountToBridge ?? 0n}
  onmax={handleMaxBalance}
  oninput={handleInput}>
  {#snippet radio()}
    <BridgeSettings />
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
