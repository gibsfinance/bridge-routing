<script lang="ts">
  import SmallInput from './SmallInput.svelte'
  import { ensToAddress, walletAccount } from '$lib/stores/auth/store'
  import { createPublicClient, http, isAddress, zeroAddress } from 'viem'
  import { router, unwrap, calldata, bridgeAddress, destination } from '$lib/stores/bridge-settings'
  import { Chains } from '$lib/stores/auth/types'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import Warning from './Warning.svelte'
  import { ensTld, isEns } from '$lib/stores/ens'
  import { normalize } from 'viem/ens'
  import { loading } from '$lib/stores/loading'
  $: account = $walletAccount
  let lastDestination: string = zeroAddress
  const updateDestination = async (e: CustomEvent) => {
    let addr = e.detail.value
    lastDestination = addr
    if (addr === 'me' && $walletAccount) {
      account = $walletAccount
    }
    if (isAddress(addr)) {
      destination.set(addr)
      account = addr
      return
    }
    if (isEns(addr)) {
      const tld = ensTld(addr)
      const normalized = normalize(addr)
      const publicClient = createPublicClient({
        chain: chainsMetadata[Chains[tld]],
        transport: http(),
      })
      loading.increment('ens')
      const resolved = await ensToAddress(publicClient, normalized).catch((err) => {
        console.log(err)
        return null
      })
      if (resolved) {
        account = resolved
        destination.set(resolved)
      }
      loading.decrement('ens')
    }
  }
</script>

<div class="my-2 text-sm shadow-sm rounded-lg">
  <div class="bg-slate-100 rounded-t-lg py-2 px-3 justify-between flex flex-col md:flex-row relative">
    <span>Destination</span>
    <SmallInput
      editOnLeft
      value={account || zeroAddress}
      on:update={updateDestination}
      class="font-mono text-xs md:text-sm mr-auto md:mr-0" />
    <Warning
      show={!(isAddress(account || '') && account?.length === 42 && account !== zeroAddress)}
      tooltip="address is not valid" />
  </div>
  <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-col md:flex-row disabled cursor-not-allowed">
    <span>Router</span>
    <span class="font-mono text-xs md:text-sm">{$router}</span>
  </div>
  <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-row">
    <span>Unwrap</span>
    <input
      type="checkbox"
      class="toggle toggle-sm [--tglbg:white] border-purple-600 bg-purple-600 hover:bg-purple-400 disabled:bg-purple-600 disabled:opacity-100"
      disabled
      bind:checked={$unwrap} />
  </div>
  <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-col md:flex-row disabled cursor-not-allowed">
    <span>To (Bridge)</span>
    <span class="font-mono text-xs md:text-sm">{$bridgeAddress}</span>
  </div>
  <div class="bg-slate-100 rounded-b-lg mt-[1px] py-2 px-3 justify-between flex flex-col md:flex-row">
    <span>Calldata</span>
    <textarea
      name="calldata"
      id="calldata"
      disabled
      class="bg-transparent outline-none resize-none flex flex-grow cursor-not-allowed font-mono text-xs md:text-sm md:px-2"
      rows="5">{$calldata}</textarea>
  </div>
</div>
