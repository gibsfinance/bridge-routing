<script lang="ts">
  import Toggle from '$lib/components/Toggle.svelte'
  import * as customTokens from '$lib/stores/custom-tokens.svelte'
  import type { Token } from '$lib/types.svelte'
  import type { Hex } from 'viem'
  import { getAddress, isAddress } from 'viem'
  import Icon from '@iconify/svelte'
  import { multicallErc20 } from '$lib/utils.svelte'
  import { bridgableTokens, clientFromChain } from '$lib/stores/input.svelte'
  import _ from 'lodash'
  import TokenInfo from './TokenInfo.svelte'
  import Infinite from './Infinite.svelte'
  import { InfiniteStore } from '$lib/stores/infinite.svelte'
  import TokenSelectInput from './TokenSelectInput.svelte'
  import { appkitNetworkById, chainsById } from '$lib/stores/auth/AuthProvider.svelte'
  import Button from './Button.svelte'
  import StaticNetworkImage from './StaticNetworkImage.svelte'
  import { Popover } from '@skeletonlabs/skeleton-svelte'
  import { availableChains } from '$lib/stores/lifi.svelte'
  import Loading from './Loading.svelte'
  import { loading } from '$lib/stores/loading.svelte'
  import * as imageLinks from '$lib/stores/image-links'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { Provider, toChain } from '$lib/stores/auth/types'
  type Props = {
    onsubmit?: (token: Token | null) => void
    onnetworkchange?: (chain: number) => void
    chains: [number, ...number[]]
    tokens: Token[]
    showCustomTokens?: boolean
    selectedChain?: number
  }
  let {
    onsubmit = () => {},
    onnetworkchange = () => {},
    chains,
    tokens,
    showCustomTokens = false,
    selectedChain = 0,
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
  let currentChain = $state(chains[0])

  $effect(() => {
    onnetworkchange?.(currentChain)
  })

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
    const [inside, outside] = _.partition(tkns, onlyFromCurrentNetwork)
    return inside
  }

  const onlyFromCurrentNetwork = (tkn: Token) => chains.includes(tkn.chainId)

  const loadViaMulticall = async (target: Hex | null) => {
    if (chains.length !== 1) {
      return null
    }
    const chainId = chains[0]
    if (!target) {
      throw new Error('no target')
    }
    const [name, symbol, decimals] = await multicallErc20({
      chain: chainsById.get(chainId)!,
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
    // const bridgeable =
    //   tokens ??
    //   _.flatMap(chains, (chain) =>
    //     bridgableTokens.bridgeableTokensUnder({
    //       provider: Provider.PULSECHAIN,
    //       chain,
    //       partnerChain: partnerChain ?? null,
    //     }),
    //   )
    if (!showCustomTokens) {
      return tokens
    }
    const custom = customTokens.tokens.value
    return custom.concat(tokens)
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
  let chainSelectOpen = $state(false)
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
    borderClasses="border-none ring-0 focus:ring-0 focus:border-none"
    value={searchValue}
    oninput={(val) => {
      searchValue = val
    }}>
    {#snippet icon()}
      {#if chains.length > 1}
        <!-- for some reason, the modal property is required here -->
        <Popover
          open={chainSelectOpen}
          triggerBase="flex flex-row items-center p-1 justify-center mr-2"
          zIndex="50"
          contentClasses="flex flex-col max-h-64 border rounded-2xl bg-surface-50 text-surface-contrast-50 overflow-y-scroll relative"
          positionerClasses="pointer-events-auto"
          modal
          positioning={{
            placement: 'bottom-end',
            gutter: 2,
            strategy: 'fixed',
          }}
          onOpenChange={() => {
            chainSelectOpen = !chainSelectOpen
          }}>
          {#snippet trigger()}
            {@const network = availableChains.get(chains[selectedChain]) ?? {
              id: chains[selectedChain],
              logoURI: imageLinks.network(chains[selectedChain]),
            }}
            <StaticNetworkImage
              network={network.id}
              sizeClasses="size-6 rounded-lg"
              icon={network.logoURI} />
            <Icon icon="mynaui:chevron-down" class="size-5 ml-1" />
          {/snippet}
          {#snippet content()}
            <span class="text-sm text-gray-500 px-4 pt-2">Select Network</span>
            <ul class="flex flex-col">
              {#each chains as chain}
                {@const network = availableChains.get(chain) ?? {
                  id: chain,
                  logoURI: imageLinks.network(chain),
                  name: chainsMetadata[toChain(chain)].name,
                }}
                <li class="flex flex-row grow">
                  <Button
                    class="flex flex-row items-center px-4 py-2 hover:bg-surface-100 grow"
                    onclick={() => {
                      onnetworkchange(chain)
                      chainSelectOpen = false
                    }}>
                    <StaticNetworkImage
                      network={network.id}
                      sizeClasses="size-6 rounded-lg"
                      icon={network.logoURI} />
                    <span class="ml-2">{network.name}</span>
                  </Button>
                </li>
              {/each}
            </ul>
          {/snippet}
        </Popover>
      {/if}
    {/snippet}
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
          <button
            class="relative flex grow cursor-pointer flex-row py-2"
            onclick={() => selectToken(token)}>
            <TokenInfo {token} truncate={6} />
          </button>
        </li>
      {/each}
      <Infinite tag="li" class="flex" onloadmore={loadMore}>
        {#if showCustomTokens}
          <button
            class="flex grow flex-row items-center py-2 leading-8"
            class:cursor-pointer={!addButtonDisabled}
            disabled={addButtonDisabled}
            class:opacity-70={addButtonDisabled}
            class:cursor-not-allowed={addButtonDisabled}
            onclick={() => addCustom(custom)}>
            <Icon icon="ic:baseline-add" height="1.5em" width="1.5em" />
            <Icon class="ml-2" icon="ph:question" height={32} width={32} />
            {#if !addButtonDisabled}
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
          </button>
        {/if}
      </Infinite>
    </ul>
  </div>
  <!-- <div class="flex flex-row">
    <label class="flex items-center py-2 pr-6 pl-6 text-slate-400" for="">
      <span class="mr-3 text-sm">
        <span class="font-medium text-slate-400">Show All Tokens</span>
      </span>
      <Toggle
        screenReaderText="Show All Tokens"
        checked={showAllChains}
        onchange={() => {
          showAllChains = !showAllChains
        }} />
    </label>
  </div> -->
</div>
