<script lang="ts">
  import NetworkSummary from './NetworkSummary.svelte'
  import { walletAccount } from '$lib/stores/auth/store'
  import { erc20Abi, formatUnits } from 'viem'
  import type { VisualChain } from '$lib/stores/auth/types'
  import { writable, type Writable } from 'svelte/store'
  import { amountToBridge } from '$lib/stores/bridge-settings'
  import { bridgeKey, assetIn, publicClient } from '$lib/stores/input'
  import { destinationChains } from '$lib/stores/config'
  import * as abis from '$lib/stores/abis'
  import AssetWithNetwork from './AssetWithNetwork.svelte'
  import { loading } from '$lib/stores/loading'
  import Warning from './Warning.svelte'
  import Icon from '@iconify/svelte'
  import * as modalStore from '$lib/stores/modal'
  import type { Token } from '$lib/types'
  import type { FormEventHandler } from 'svelte/elements'

  export let network!: VisualChain
  export let asset!: Token
  export let value!: Writable<string>
  $: if (asset) {
    value.set('')
  }
  let balance = 0n
  const getBalance = async () => {
    if (!$walletAccount) {
      return null
    }
    loading.increment('balance')
    return $publicClient
      .readContract({
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [$walletAccount],
        address: asset.address,
      })
      .then((res) => {
        loading.decrement('balance')
        balance = res || 0n
        return balance
      })
  }
  const getMinAmount = async () => {
    return $publicClient.readContract({
      abi: abis.inputBridge,
      functionName: 'minPerTx',
      args: [$assetIn.address],
      address: destinationChains[$bridgeKey].homeBridge,
    })
  }

  $: $walletAccount && getBalance()

  let unwind!: () => void
  const doUnwind = () => {
    loading.increment('minAmount')
    balance = 0n
    unwind?.()
  }
  const minInput = writable(0n)
  const focused = writable(false)
  $: if ($publicClient) {
    doUnwind()
    getBalance()
    // assume that the min amount will not change while the page is loaded
    getMinAmount().then((res) => {
      minInput.set(res)
      loading.decrement('minAmount')
    })
    unwind = $publicClient.watchContractEvent({
      address: asset.address,
      abi: erc20Abi,
      eventName: 'Transfer',
      onLogs: async (logs) => {
        const transfer = logs.filter((l) => l.eventName === 'Transfer')
        if (transfer.length) {
          await getBalance()
        }
      },
    })
  }
  const openModal = () => {
    modalStore.type.set('choosetoken')
  }
  const handleInput: FormEventHandler<HTMLInputElement> = (e) => {
    value.set(e.currentTarget.value)
  }
</script>

<div class="shadow-md rounded-lg">
  <div class="bg-slate-100 py-2 px-3 rounded-t-lg">
    <NetworkSummary
      {network}
      {asset}
      {balance}
      showMax
      on:max-balance={() => {
        const updated = formatUnits(balance, asset.decimals)
        value.set(updated)
        // val.set(updated)
      }} />
  </div>
  <div class="flex flex-row mt-[1px] bg-slate-100 rounded-b-lg text-xl justify-between">
    <span class="flex flex-grow relative max-w-[70%]">
      <input
        class="bg-transparent leading-8 outline-none px-3 py-2 placeholder-current hover:appearance-none focus:shadow-inner flex-grow text-xl sm:text-2xl w-full"
        placeholder="0.0"
        value={$value}
        on:focus={() => focused.set(true)}
        on:blur={() => focused.set(false)}
        on:input={handleInput} />
      <Warning
        show={$amountToBridge < $minInput && $amountToBridge > 0n}
        disabled={$focused}
        position="left"
        tooltip="Input is too low, must be at least {formatUnits($minInput, asset.decimals)}" />
    </span>

    <button
      class="tooltip tooltip-left leading-8 py-2 px-3 flex flex-row space-x-2 items-center open-modal-container"
      data-tip={asset.name}
      on:click={openModal}>
      <AssetWithNetwork {asset} tokenSize={8} networkSize={4} />
      <span class="ml-2">{asset.symbol}</span>
      <Icon icon="mingcute:right-fill" height="1em" width="1em" class="flex icon transition-all" />
    </button>
  </div>
</div>

<style lang="postcss">
  :global(.open-modal-container:hover .icon) {
    @apply translate-x-1;
  }
</style>
