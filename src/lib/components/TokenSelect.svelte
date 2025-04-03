<script lang="ts">
  import * as customTokens from '$lib/stores/custom-tokens.svelte'
  import type { Token } from '$lib/types.svelte'
  import type { Hex } from 'viem'
  import { getAddress, isAddress, isHex } from 'viem'
  import Icon from '@iconify/svelte'
  import { multicallErc20 } from '$lib/utils.svelte'
  import { clientFromChain } from '$lib/stores/input.svelte'
  import _ from 'lodash'
  import TokenInfo from './TokenInfo.svelte'
  import Infinite from './Infinite.svelte'
  import { InfiniteStore } from '$lib/stores/infinite.svelte'
  import TokenSelectInput from './TokenSelectInput.svelte'
  import Button from './Button.svelte'
  import Loading from './Loading.svelte'
  import { loading } from '$lib/stores/loading.svelte'
  import { evmChainsById } from '$lib/stores/auth/AuthProvider.svelte'

  type Props = {
    onsubmit?: (token: Token | null) => void
    chains: [number, ...number[]]
    tokens: Token[]
    showCustomTokens?: boolean
    selectedChain?: number
    selectedToken?: Token | null
  }
  let {
    onsubmit = () => {},
    chains,
    tokens,
    showCustomTokens = false,
    selectedChain = 0,
    selectedToken,
  }: Props = $props()
  let custom!: Token
  const addCustom = (newToken: Token) => {
    customTokens.tokens.value = _.uniqBy(customTokens.tokens.value.concat(newToken), 'address')
  }
  const selectToken = (token: Token) => {
    onsubmit(token)
  }
  let searchValue = $state('')
  // if you add a whitelist
  let showAllTokens = $state(false)
  let showAllChains = $state(false)

  const getSubset = ($tokens: Token[], val: string, allTokens: boolean, allChains: boolean) => {
    let tkns = $tokens
    if (!val && allTokens && allChains) {
      return tkns
    }
    const lowerVal = val.toLowerCase()
    if (lowerVal) {
      const filter = isAddress(val)
        ? ({ address }: Token) => {
            return getAddress(address) === getAddress(val)
          }
        : ({ name, symbol, address, extensions }: Token) => {
            return (
              address.toLowerCase().includes(lowerVal) ||
              !!Object.values(extensions?.bridgeInfo || {}).find((info) => {
                return info.tokenAddress.toLowerCase().includes(lowerVal)
              }) ||
              name.toLowerCase().includes(lowerVal) ||
              symbol.toLowerCase().includes(lowerVal)
            )
          }
      tkns = tkns.filter(filter)
    }
    if (allChains) return tkns
    const inside = _.filter(tkns, (tkn) => {
      return selectedChain === tkn.chainId
      // return chains.includes(tkn.chainId)
    })
    return inside
  }

  const loadViaMulticall = async (target: Hex | null) => {
    if (chains.length !== 1) {
      return null
    }
    const chainId = chains[0]
    if (!target) {
      throw new Error('no target')
    }
    const chain = evmChainsById.get(chainId)
    if (!chain) {
      return null
    }
    const [name, symbol, decimals] = await multicallErc20({
      chain,
      client: clientFromChain(chainId),
      target,
    })
    custom = {
      name,
      symbol,
      decimals,
      chainId,
      address: target,
      logoURI: '',
    }
    return custom
  }
  const fullTokenSet = $derived.by(() => {
    const [selected, notSelected] = selectedToken
      ? _.partition(tokens, (t) => {
          return (
            t.address.toLowerCase() === selectedToken?.address?.toLowerCase() &&
            t.chainId === selectedChain
          )
        })
      : [[], tokens]
    const rearranged = [...selected, ...notSelected]
    if (!showCustomTokens) {
      return rearranged
    }
    const custom = customTokens.tokens.value
    return custom.concat(rearranged)
  })
  const filteredSubset = $derived(
    getSubset(fullTokenSet, searchValue, showAllTokens, showAllChains),
  )
  $effect(() => {
    if (fullTokenSet.length) {
      limit.set(50)
    }
  })
  const limit = $derived(new InfiniteStore(50, fullTokenSet.length))
  const subset = $derived(filteredSubset.slice(0, limit.count))
  const inputIsAddress = $derived(isAddress(searchValue))
  const addButtonDisabled = $derived(!inputIsAddress || !!subset.length)
  const searchValueHex = $derived(inputIsAddress ? (searchValue as Hex) : null)
  const loadMore = () => {
    if (limit.count > subset.length) return
    limit.increment(50)
  }
</script>

<div class="flex flex-col h-full max-h-[512px] rounded-2xl overflow-hidden">
  <div class="flex flex-row grow justify-between px-6 pt-4 pb-2">
    <span class="flex flex-row grow">Select a Token</span>
    <Button
      class="flex flex-row"
      onclick={() => {
        onsubmit(null)
      }}>
      <Icon icon="ic:baseline-close" height="1.5em" width="1.5em" />
    </Button>
  </div>
  <TokenSelectInput
    borderClasses="ring-0 focus:ring-0"
    value={searchValue}
    short={chains.length === 1}
    oninput={(val) => {
      searchValue = val
    }}>
    <!-- {#snippet icon()}
      {#if chains.length > 1}
        <Popover
          open={chainSelectOpen}
          triggerBase="flex flex-row items-center py-1 px-2 justify-center h-full"
          zIndex="50"
          contentClasses="flex flex-col max-h-64 border rounded-2xl bg-white text-surface-contrast-50 overflow-y-scroll relative"
          positionerClasses="pointer-events-auto"
          modal
          positioning={{
            placement: 'bottom-start',
            gutter: 2,
            strategy: 'fixed',
          }}
          onOpenChange={() => {
            chainSelectOpen = !chainSelectOpen
          }}>
          {#snippet trigger()}
            {@const network = availableChains.get(selectedChain) ?? {
              id: selectedChain,
              logoURI: imageLinks.network(selectedChain),
            }}
            <StaticNetworkImage
              network={network.id}
              sizeClasses="size-9 rounded-l-full overflow-hidden"
              icon={network.logoURI} />
            <Icon icon="mynaui:chevron-down" class="size-6 ml-0.5" />
          {/snippet}
          {#snippet content()}
            {@const sortedChains = _(chains)
              .slice(0)
              .map((chain) => {
                return (
                  availableChains.get(chain) ?? {
                    id: chain,
                    logoURI: imageLinks.network(chain),
                    name: chainsMetadata[toChain(chain)].name,
                  }
                )
              })
              .sortBy((chain) => chain.name.toLowerCase())
              .value()}
            <span class="text-sm text-gray-500 px-4 pt-2">Select Network</span>
            <ul class="flex flex-col">
              {#each sortedChains as chain}
                <li class="flex flex-row grow">
                  <Button
                    class="flex flex-row items-center pl-[14px] py-1 hover:bg-surface-100 grow border-l-2 pr-4 {chain.id ===
                    selectedChain
                      ? 'border-primary-500'
                      : 'border-transparent'}"
                    onclick={() => {
                      chainSelectOpen = false
                      onnetworkchange?.(chain.id)
                    }}>
                    <StaticNetworkImage
                      network={chain.id}
                      sizeClasses="size-8 rounded-lg"
                      icon={chain.logoURI} />
                    <span class="ml-2">{chain.name}</span>
                  </Button>
                </li>
              {/each}
            </ul>
          {/snippet}
        </Popover>
      {:else}
        <div class="flex flex-row items-center py-1 px-2 justify-center h-full">
          <StaticNetworkImage
            network={network.id}
            sizeClasses="size-9 rounded-l-full overflow-hidden"
            icon={network.logoURI} />
        </div>
      {/if}
    {/snippet} -->
  </TokenSelectInput>
  <div class="overflow-y-scroll h-full">
    <div
      class="h-10 w-full flex items-center justify-center"
      class:hidden={loading.isResolved('lifi-tokens')}>
      <Loading class="size-6" />
    </div>
    <ul class="flex grow flex-col overflow-y-scroll h-full">
      {#each subset as token}
        <li class="flex hover:bg-surface-900-100 relative">
          <Button
            class="relative flex grow cursor-pointer flex-row py-2 pr-2"
            onclick={() => selectToken(token)}>
            <TokenInfo {token} truncate={6} />
          </Button>
        </li>
      {/each}
      <Infinite tag="li" class="flex" onloadmore={loadMore}>
        {#if showCustomTokens}
          <Button
            class="flex grow flex-row items-center py-2 leading-8 {addButtonDisabled
              ? 'cursor-not-allowed opacity-75'
              : 'cursor-pointer'}"
            disabled={addButtonDisabled}
            onclick={() => addCustom(custom)}>
            <Icon icon="ic:baseline-add" height="1.5em" width="1.5em" />
            <Icon class="ml-2" icon="ph:question" height={32} width={32} />
            {#if !addButtonDisabled && isHex(searchValueHex)}
              {#await loadViaMulticall(searchValueHex)}
                <span class="flex flex-row items-center pl-2 leading-8"
                  ><Icon
                    icon="svg-spinners:3-dots-scale"
                    height="1.5em"
                    width="1.5em" />&nbsp;</span>
              {:then data}
                {#if data}
                  <span class="pl-2 leading-8">{data.name} ({data.symbol})</span>
                {:else}
                  <span class="pl-2 leading-8">Unknown</span>
                {/if}
              {:catch}
                <span class="pl-2 leading-8">Unknown</span>
              {/await}
            {/if}
            <span class="pl-2 leading-8">&nbsp;</span>
          </Button>
        {/if}
      </Infinite>
    </ul>
  </div>
</div>
