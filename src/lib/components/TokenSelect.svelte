<script lang="ts">
  import Toggle from '$lib/components/Toggle.svelte'
  import * as customTokens from '$lib/stores/custom-tokens'
  import type { Token } from '$lib/types'
  import type { Hex } from 'viem'
  import { createEventDispatcher } from 'svelte'
  import TokenIcon from '$lib/components/TokenIcon.svelte'
  import * as modalStore from '$lib/stores/modal'
  import Lazy from '$lib/components/Lazy.svelte'
  import { getAddress, isAddress } from 'viem'
  import Icon from '@iconify/svelte'
  import { assetSources } from '$lib/stores/bridge-settings'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { multicallErc20 } from '$lib/utils'
  import * as input from '$lib/stores/input'
  import Input from './Input.svelte'
  import Hover from './Hover.svelte'
  import { hover } from '$lib/modifiers/hover'
  import Tooltip from './Tooltip.svelte'
  import { uniqBy, partition } from 'lodash'

  const { bridgableTokens, fromPublicClient, fromChainId } = input

  const dispatch = createEventDispatcher()
  const submit = (token: Token) => {
    dispatch('submit', token)
  }
  let custom!: Token
  const doClose = () => {
    modalStore.type.set(null)
  }
  const addCustom = (newToken: Token) => {
    customTokens.tokens.update((tkns) => uniqBy(tkns.concat(newToken), 'address'))
    // searchValue = ''
    // use token as focus in bridge settings stores
  }
  const selectToken = (token: Token) => {
    submit(token)
    doClose()
  }
  let searchValue = ''
  // if you add a whitelist
  let showAllTokens = false
  let showAllChains = false

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
    const [inside, outside] = partition(tkns, onlyFromCurrentNetwork)
    return inside
  }

  const onlyFromCurrentNetwork = (tkn: Token) => tkn.chainId === Number($fromChainId) // || !!tkn.extensions?.bridgeInfo?.[Number($bridgeKey[2])]?.tokenAddress

  const loadViaMulticall = async (target: Hex | null) => {
    if (!target) {
      throw new Error('no target')
    }
    const [name, symbol, decimals] = await multicallErc20({
      chain: chainsMetadata[$fromChainId],
      client: $fromPublicClient,
      target,
    })
    custom = {
      name,
      symbol,
      decimals,
      chainId: Number($fromChainId),
      address: target,
      logoURI: '',
    }
    return custom
  }
  const tokens = customTokens.tokens
  $: subset = getSubset($tokens.concat($bridgableTokens), searchValue, showAllTokens, showAllChains)
  $: inputIsAddress = isAddress(searchValue)
  $: addButtonDisabled = !inputIsAddress || !!subset.length
  $: searchValueHex = inputIsAddress ? (searchValue as Hex) : null
  const searchInputId = 'search-input'
</script>

<label
  class="border flex flex-row items-center m-6 px-2 h-fit rounded-lg border-slate-400 focus:ring-1 focus:ring-slate-200"
  for={searchInputId}>
  <Input
    autoFocus
    id={searchInputId}
    size="md"
    placeholder="0x... or name/symbol"
    bind:value={searchValue} />
  <Icon icon="ic:baseline-search" height="1.5em" width="1.5em" class="cursor-text" />
</label>
<div class="max-h-72 overflow-y-scroll">
  <ul class="overflow-y-scroll px-6 flex flex-col grow">
    {#each subset as token}
      <li class="flex my-2">
        <Hover let:hovering let:handlers>
          <button
            use:hover={handlers}
            class="flex flex-row grow cursor-pointer relative"
            on:click={() => selectToken(token)}>
            <span class="size-8">
              <Lazy let:everLoaded>
                <!-- might be a good idea to simply keep it loaded after first -->
                <TokenIcon visible={everLoaded} src={assetSources(token)} />
              </Lazy>
            </span>
            <span class="pl-2 leading-8 whitespace-pre overflow-ellipsis w-full text-left"
              >{token.name}</span>
            <Tooltip positionFlow="below" position="right" show={hovering}>{token.address}</Tooltip>
          </button>
        </Hover>
      </li>
    {/each}
    <li class="flex">
      <button
        class="flex flex-row grow py-2 items-center leading-8"
        class:cursor-pointer={!addButtonDisabled}
        disabled={addButtonDisabled}
        class:opacity-70={addButtonDisabled}
        class:cursor-not-allowed={addButtonDisabled}
        on:click={() => addCustom(custom)}>
        <Icon icon="ic:baseline-add" height="1.5em" width="1.5em" />
        <Icon class="ml-2" icon="ph:question" height={32} width={32} />
        {#if !addButtonDisabled}
          {#await loadViaMulticall(searchValueHex)}
            <span class="flex flex-row items-center pl-2 leading-8"
              ><Icon icon="svg-spinners:3-dots-scale" height="1.5em" width="1.5em" />&nbsp;</span>
          {:then data}
            <span class="pl-2 leading-8">{data.name} ({data.symbol})</span>
          {:catch}
            <span class="pl-2 leading-8">Unknown</span>
          {/await}
        {/if}
        <span class="pl-2 leading-8">&nbsp;</span>
      </button>
    </li>
  </ul>
</div>
<div class="flex flex-row">
  <label class="flex py-2 pr-6 pl-6 text-slate-400 items-center" for="">
    <span class="mr-3 text-sm">
      <span class="font-medium text-slate-400">Show All Tokens</span>
    </span>
    <Toggle bind:checked={showAllChains} />
  </label>
</div>
