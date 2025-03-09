<!-- <script lang="ts">
  import type { Token } from '$lib/types.svelte'
  import { Tabs } from '@skeletonlabs/skeleton-svelte'
  import {
    availableChains,
    availableTokensPerOriginChain,
    loadTokensForChains,
  } from '$lib/stores/lifi.svelte'
  import Image from './Image.svelte'
  import Button from './Button.svelte'
  import Infinite from './Infinite.svelte'
  import Input from './Input.svelte'
  import TokenInfo from './TokenInfo.svelte'
  import TokenSelectInput from './TokenSelectInput.svelte'
  import TokenSelect from './TokenSelect.svelte'
  import { appkitNetworkIds } from '$lib/stores/auth/AuthProvider.svelte'
  type Props = {
    onsubmit: (token: Token | null) => void
    token: Token | null
  }
  const { onsubmit, token }: Props = $props()
  const startChainId = token?.chainId ?? 1
  $effect(() => {
    if (selectedNetwork) {
      loadTokensForChains(selectedNetwork)
    }
  })
  let openItem = $state('network')
  let selectedToken = $state(token)
  let selectedNetwork = $state(availableChains.get(startChainId))
  let limit = $state(100)
  let searchValue = $state('')
  const loadMore = () => {
    limit += 100
  }
  const tokenNetworkId = $derived(selectedNetwork?.id ?? 1)
  const allAvailableTokensOnChain = $derived(
    availableTokensPerOriginChain.get(tokenNetworkId) ?? [],
  )
  const lowerSearchValue = $derived(searchValue.toLowerCase())
  // super basic search filter
  const filteredTokens = $derived(
    allAvailableTokensOnChain.filter((token) => {
      return (
        token.name.toLowerCase().includes(lowerSearchValue) ||
        token.symbol.toLowerCase().includes(lowerSearchValue) ||
        token.address.toLowerCase().includes(lowerSearchValue)
      )
    }),
  )
  const renderableTokens = $derived(filteredTokens.slice(0, limit))
</script> -->

<!--
<Tabs
  value={openItem}
  listClasses="flex flex-row px-4"
  listGap="gap-0"
  listMargin="mb-0"
  listBorder="border-b">
  {#snippet list()}
    <Tabs.Control
      value="network"
      classes="rounded-none"
      padding="p-2"
      labelClasses="flex"
      labelBase="">
      <span class="flex flex-row items-center gap-2">
        <Image src={selectedNetwork?.logoURI} alt={selectedNetwork?.name} sizeClasses="size-8" />
        {selectedNetwork?.name}
      </span>
    </Tabs.Control>
    <Tabs.Control
      value="token"
      padding="p-2"
      base="grow flex justify-items-start"
      classes="rounded-none"
      labelClasses="flex w-full justify-start"
      labelBase="">
      <span class="flex flex-row items-center gap-2 w-full h-8 relative">
        {#if selectedToken}
          <TokenInfo token={selectedToken} />
        {/if}
      </span>
    </Tabs.Control>
    {#if selectedToken}
      <Tabs.Control
        value="select"
        padding="p-2"
        labelClasses="flex w-full justify-start"
        labelBase="">
        <Button
          class="flex flex-row gap-1 items-center shrink text-base"
          onclick={() => {
            onsubmit(selectedToken as Token)
          }}>
          Select
        </Button>
      </Tabs.Control>
    {/if}
  {/snippet}
  {#snippet content()}
    <Tabs.Panel value="network" classes="px-6 py-2 flex flex-col gap-2 max-h-96 overflow-y-scroll">
      {#each availableChains.values() as chain}
        <Button
          class="flex flex-row gap-1 items-center shrink text-base"
          onclick={() => {
            selectedNetwork = chain
            selectedToken = null
            openItem = 'token'
          }}>
          <Image
            src={chain.logoURI}
            alt={chain.name}
            sizeClasses="size-8"
            class="rounded-full overflow-hidden" />
          {chain.name}
        </Button>
      {/each}
    </Tabs.Panel>
    <Tabs.Panel value="token">
      <TokenSelectInput
        value={searchValue}
        oninput={(value) => {
          searchValue = value
          limit = 100
        }} />
    </Tabs.Panel>
    <Tabs.Panel value="token" classes="px-6 py-2 gap-1 max-h-64 overflow-y-scroll">
      {#each renderableTokens as token}
        <li class="contents">
          <Button
            class="flex flex-row items-center gap-1 text-base w-full relative mt-2 h-8"
            onclick={() => {
              selectedToken = token as Token
            }}>
            <TokenInfo {token} />
          </Button>
        </li>
      {/each}
      <Infinite tag="li" class="flex" onloadmore={loadMore}></Infinite>
    </Tabs.Panel>
  {/snippet}
</Tabs> -->

<script lang="ts">
  import TokenSelect from './TokenSelect.svelte'
  import { appkitNetworkIds } from '$lib/stores/auth/AuthProvider.svelte'
  import { availableTokensPerOriginChain } from '$lib/stores/lifi.svelte'
  import type { Token } from '$lib/types.svelte'
  const chains = $derived([...appkitNetworkIds.values()].map(Number) as [number, ...number[]])
  let selectedChainIndex = $state(0)
  const selectedChainId = $derived(chains[selectedChainIndex])
  const tokens = $derived(availableTokensPerOriginChain.get(selectedChainId) ?? [])

  type Props = {
    onsubmit: (token: Token | null) => void
  }
  const { onsubmit }: Props = $props()
</script>

<TokenSelect
  {chains}
  {tokens}
  {onsubmit}
  onnetworkchange={(chainId) => {
    const index = chains.indexOf(chainId)
    if (index !== -1) {
      selectedChainIndex = index
    }
  }} />
