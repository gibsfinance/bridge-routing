<script lang="ts">
  import TokenSelect from './TokenSelect.svelte'
  import { appkitNetworkIds } from '$lib/stores/auth/AuthProvider.svelte'
  import {
    // think about getting rid of this since it is only relevant for onboard
    availableChains,
    availableTokensPerOriginChain,
    loadTokensForChains,
  } from '$lib/stores/lifi.svelte'
  import type { Token } from '$lib/types.svelte'

  type Props = {
    onsubmit: (token: Token | null, chainId: number | null) => void
    chainId: number
    chains?: [number, ...number[]]
    tokens?: Token[]
    selectedToken?: Token | null
  }
  const {
    onsubmit,
    chainId,
    chains: chainsProp,
    tokens: tokensProp,
    selectedToken,
  }: Props = $props()
  const chains = $derived(
    chainsProp ??
      ([...appkitNetworkIds.values()]
        .filter((id) => availableChains.has(id as number))
        .map(Number) as [number, ...number[]]),
  )
  let selectedChainIndex = $state(0)
  $effect(() => {
    selectedChainIndex = chains.indexOf(chainId)
  })
  const selectedChainId = $derived(chains[selectedChainIndex])
  const tokens = $derived(tokensProp ?? availableTokensPerOriginChain.get(selectedChainId) ?? [])
  const tokensUnder = $derived(tokens.filter((t) => t.chainId === selectedChainId))
  $effect(() => {
    if (tokensUnder.length === 0) {
      const chain = availableChains.get(selectedChainId)
      if (chain) {
        loadTokensForChains(chain)
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
