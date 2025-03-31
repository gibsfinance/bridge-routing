<script lang="ts">
  import TokenSelect from './TokenSelect.svelte'
  import {
    // think about getting rid of this since
    // it is only relevant for onboard
    availableChains,
    availableTokensPerOriginChain,
    loadTokensForChains,
  } from '$lib/stores/lifi.svelte'
  import type { Token } from '$lib/types.svelte'
  import { ChainType, type UTXOChain } from '@lifi/types'

  type Props = {
    onsubmit: (token: Token | null, chainId: number | null) => void
    chainId: number
    chains: [number, ...number[]]
    tokens?: Token[]
    selectedToken?: Token | null
  }
  const { onsubmit, chainId, chains, tokens: tokensProp, selectedToken }: Props = $props()
  let selectedChainIndex = $state<number>(0)
  $effect(() => {
    selectedChainIndex = chains.indexOf(chainId)
  })
  const selectedChainId = $derived(chains[selectedChainIndex])
  const selectedChain = $derived(availableChains.get(selectedChainId))
  const tokens = $derived(
    tokensProp ??
      availableTokensPerOriginChain.get(selectedChainId) ??
      (selectedChain && selectedChain.chainType === ChainType.UTXO
        ? [(selectedChain as UTXOChain).nativeToken]
        : []),
  )
  const tokensUnder = $derived(tokens.filter((t) => t.chainId === selectedChainId))
  $effect(() => {
    if (tokensUnder.length === 0) {
      const chain = availableChains.get(selectedChainId)
      if (chain) {
        if (chain.key === 'btc') {
          // loadTokensForChains(chain).then((tokens) => {
          //   console.log('loading tokens for chain', chain, tokens)
          // })
        } else {
          loadTokensForChains(chain)
        }
      }
    }
  })
</script>

<TokenSelect
  {chains}
  tokens={tokensUnder}
  onsubmit={(token) => {
    onsubmit(token, chains[selectedChainIndex])
  }}
  selectedChain={chains[selectedChainIndex]}
  {selectedToken}
  onnetworkchange={(chainId) => {
    const index = chains.indexOf(chainId)
    if (index !== -1) {
      selectedChainIndex = index
    }
  }} />
