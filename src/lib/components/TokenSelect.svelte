<script lang="ts">
  import Toggle from '$lib/components/Toggle.svelte'
  import * as customTokens from '$lib/stores/custom-tokens.svelte'
  import type { Token } from '$lib/types.svelte'
  import type { Hex } from 'viem'
  import TokenIcon from '$lib/components/TokenIcon.svelte'
  import { getAddress, isAddress } from 'viem'
  import Icon from '@iconify/svelte'
  import { assetSources } from '$lib/stores/bridge-settings.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { multicallErc20 } from '$lib/utils.svelte'
  import * as input from '$lib/stores/input.svelte'
  import Input from './Input.svelte'
  import _ from 'lodash'

  type Props = {
    onsubmit?: (token: Token) => void
  }
  let { onsubmit = () => {} }: Props = $props()
  let custom!: Token
  const addCustom = (newToken: Token) => {
    const tkns = customTokens.tokens.value
    customTokens.tokens.value = _.uniqBy(tkns.concat(newToken), 'address')
    // searchValue = ''
    // use token as focus in bridge settings stores
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
    const [inside, outside] = _.partition(tkns, onlyFromCurrentNetwork)
    return inside
  }

  const onlyFromCurrentNetwork = (tkn: Token) => tkn.chainId === Number(input.bridgeKey.fromChain) // || !!tkn.extensions?.bridgeInfo?.[Number($bridgeKey[2])]?.tokenAddress

  const loadViaMulticall = async (target: Hex | null) => {
    if (!target) {
      throw new Error('no target')
    }
    const [name, symbol, decimals] = await multicallErc20({
      chain: chainsMetadata[input.bridgeKey.fromChain],
      client: input.clientFromChain(input.bridgeKey.fromChain),
      target,
    })
    custom = {
      name,
      symbol,
      decimals,
      chainId: Number(input.bridgeKey.fromChain),
      address: target,
      logoURI: '',
    }
    return custom
  }
  const tokens = customTokens.tokens
  const bridgeableTokens = $derived(
    input.bridgableTokens.bridgeableTokensUnder(input.bridgeKey.value),
  )
  const subset = $derived(
    getSubset(tokens.value.concat(bridgeableTokens), searchValue, showAllTokens, showAllChains),
  )
  const inputIsAddress = $derived(isAddress(searchValue))
  const addButtonDisabled = $derived(!inputIsAddress || !!subset.length)
  const searchValueHex = $derived(inputIsAddress ? (searchValue as Hex) : null)
  const searchInputId = 'search-input'
</script>

<label
  class="m-6 flex h-fit flex-row items-center rounded-lg border border-slate-400 focus:ring-1 focus:ring-slate-200"
  for={searchInputId}>
  <Input
    autoFocus
    id={searchInputId}
    size="md"
    placeholder="0x... or name/symbol"
    class="ring-0 focus:ring-0"
    value={searchValue}
    oninput={(val) => {
      searchValue = val
    }} />
  <Icon
    icon="ic:baseline-search"
    height="1.5em"
    width="1.5em"
    class="cursor-text size-8 p-1 flex" />
</label>
<div class="max-h-72 overflow-y-scroll">
  <ul class="flex grow flex-col overflow-y-scroll px-6">
    {#each subset as token}
      <li class="mt-2 flex">
        <button
          class="relative flex grow cursor-pointer flex-row"
          onclick={() => selectToken(token)}>
          <span class="size-8">
            <!-- might be a good idea to simply keep it loaded after first -->
            <TokenIcon src={assetSources(token)} />
          </span>
          <span
            class="w-full pl-2 text-left flex flex-col leading-8 overflow-ellipsis whitespace-pre group relative">
            <span class="leading-5 translate-y-1.5 group-hover:translate-y-0 transition-all"
              >{token.name}</span>
            <span
              class="text-slate-400 text-xs opacity-0 group-hover:opacity-100 transition-all absolute bottom-0 left-2">
              {token.address}
            </span>
          </span>
        </button>
      </li>
    {/each}
    <li class="flex">
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
</div>
