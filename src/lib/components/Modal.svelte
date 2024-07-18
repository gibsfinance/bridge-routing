<script lang="ts">
  import type { Token } from '$lib/types'
  import * as viem from 'viem'
  import { createEventDispatcher, onMount } from 'svelte'
  export let openOnMount: boolean = false
  import TokenIcon from '$lib/components/TokenIcon.svelte'
  import * as modalStore from '$lib/stores/modal'
  import { loading } from '$lib/stores/loading'
  import Lazy from './Lazy.svelte'
  import { getAddress, isAddress } from 'viem'
  import Icon from '@iconify/svelte'
  import { publicClient, assetSources, bridgableTokens } from '$lib/stores/bridge-settings'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import { Chains } from '$lib/stores/auth/types'
  import { multicallErc20 } from '$lib/utils'
  import _ from 'lodash'

  const dispatch = createEventDispatcher()
  const submit = (token: Token) => {
    dispatch('submit', token)
  }
  let modal: HTMLDialogElement | null = null
  let temporaryTokens: Token[] = []
  let custom!: Token
  const doClose = (e: Event) => {
    modalStore.type.set(null)
  }
  // load a test
  try {
    const tokensSerialized = localStorage.getItem('tokens')
    if (tokensSerialized) {
      temporaryTokens = JSON.parse(tokensSerialized)
    }
  } catch (err) {}
  onMount(() => {
    modal?.addEventListener('close', doClose)
    if (openOnMount) {
      modal?.showModal()
    }
    return () => {
      modal?.removeEventListener('close', doClose)
      modal = null
    }
  })
  const addEphemeralToken = (token: Token) => {
    temporaryTokens = temporaryTokens.concat(token)
    try {
      localStorage.setItem('tokens', JSON.stringify(temporaryTokens))
    } catch (err) {}
  }
  const addCustom = (newToken: Token) => {
    console.log('add custom', newToken)
    addEphemeralToken(newToken)
    searchValue = ''
    // use token as focus in bridge settings stores
  }
  const selectToken = (token: Token) => {
    submit(token)
    modal?.close()
  }
  let searchValue = ''
  const getSubset = (val: string) => {
    const lowerVal = val.toLowerCase()
    const filter = isAddress(val)
      ? ({ address }: Token) => {
          return getAddress(address) === getAddress(val)
        }
      : ({ name, symbol, address }: Token) => {
          return (
            address.toLowerCase().includes(lowerVal) ||
            name.toLowerCase().includes(lowerVal) ||
            symbol.toLowerCase().includes(lowerVal)
          )
        }
    return temporaryTokens.concat($bridgableTokens).filter(filter)
  }

  const loadViaMulticall = async (target: viem.Hex | null) => {
    if (!target) {
      throw new Error('no target')
    }
    const $chain = chainsMetadata[Chains.PLS]
    const [name, symbol, decimals] = await multicallErc20({
      chain: $chain,
      client: $publicClient,
      target,
    })
    custom = {
      name,
      symbol,
      decimals,
      chainId: Number(Chains.PLS),
      address: target,
      logoURI: '',
    }
    return custom
  }
  $: subset = searchValue ? getSubset(searchValue) : temporaryTokens.concat($bridgableTokens)
  $: inputIsAddress = isAddress(searchValue)
  $: addButtonDisabled = !inputIsAddress || !!subset.length
  $: searchValueHex = inputIsAddress ? (searchValue as viem.Hex) : null
</script>

<dialog id="choose-token-modal" class="modal" bind:this={modal}>
  <div class="modal-box text-slate-50 max-h-full h-96 p-0 overflow-hidden flex flex-col">
    <label class="input input-bordered flex flex-row items-center m-6 py-2 h-fit">
      <input
        type="text"
        class="grow flex leading-6"
        placeholder="0x... or name/symbol"
        bind:value={searchValue}
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false" />
      <Icon icon="ic:baseline-search" height="1.5em" width="1.5em" />
    </label>
    <ul class="overflow-y-scroll px-6 flex flex-col grow">
      {#each subset as token}
        <li class="flex tooltip tooltip-bottom my-2" data-tip={token.address}>
          <button class="flex flex-row grow cursor-pointer" on:click={() => selectToken(token)}>
            <Lazy let:load>
              <!-- might be a good idea to simply keep it loaded after first -->
              <TokenIcon visible={load} sources={assetSources(token)} />
            </Lazy>
            <span class="pl-2 leading-8">{token.name}</span>
          </button>
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
  <form method="dialog" class="modal-backdrop">
    <button
      on:click={() => {
        modalStore.type.set(null)
      }}>close</button>
  </form>
</dialog>
