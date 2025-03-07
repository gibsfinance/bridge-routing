<script lang="ts">
  import type { Token } from '$lib/types.svelte'
  import { Tabs } from '@skeletonlabs/skeleton-svelte'
  import TokenIcon from './TokenIcon.svelte'
  import { assetSources } from '$lib/stores/bridge-settings.svelte'
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
  type Props = {
    onSelect: (token: Token) => void
    token: Token | null
  }
  const { onSelect, token }: Props = $props()
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
</script>

<Tabs
  value={openItem}
  listClasses="flex flex-row gap-2"
  listBorder="border-b-2 border-surface-500"
  listBase="!mb-0">
  {#snippet list()}
    <Tabs.Control value="network" classes="rounded-none">
      <span class="flex flex-row items-center gap-2">
        <Image src={selectedNetwork?.logoURI} alt={selectedNetwork?.name} sizeClasses="size-8" />
        {selectedNetwork?.name}
      </span>
    </Tabs.Control>
    <Tabs.Control
      value="token"
      base="grow flex justify-items-start"
      classes="rounded-none"
      labelClasses="w-full justify-start">
      <span class="flex flex-row items-center gap-2 w-full h-8 relative">
        {#if selectedToken}
          <TokenInfo token={selectedToken} />
          <!-- <TokenIcon
            src={selectedToken.logoURI || assetSources(selectedToken)}
            alt={selectedToken.symbol}
            class="rounded-full overflow-hidden" />
          {selectedToken.name} -->
        {/if}
      </span>
    </Tabs.Control>
    {#if selectedToken}
      <Tabs.Control value="select">
        <Button
          class="flex flex-row gap-1 items-center shrink text-base"
          onclick={() => {
            onSelect(selectedToken as Token)
          }}>
          Select
        </Button>
      </Tabs.Control>
    {/if}
  {/snippet}
  {#snippet content()}
    <Tabs.Panel value="network" classes="p-4 flex flex-wrap gap-2 max-h-96 overflow-y-scroll">
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
      <Input
        value={searchValue}
        placeholder="Search tokens"
        class="px-4 py-2 ring-0 border-b-2 border-surface-500"
        oninput={(value) => {
          searchValue = value
          limit = 100
        }} />
    </Tabs.Panel>
    <Tabs.Panel value="token" classes="p-4 gap-2 max-h-64 overflow-y-scroll">
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
</Tabs>
