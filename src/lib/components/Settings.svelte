<script lang="ts">
  import SmallInput from './SmallInput.svelte'
  import { ensToAddress, walletAccount } from '$lib/stores/auth/store'
  import { createPublicClient, http, isAddress, zeroAddress } from 'viem'
  import { recipient, unwrap, calldata, to } from '$lib/stores/bridge-settings'
  import { Chains } from '$lib/stores/auth/types'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  $: account = $walletAccount
  const updateRecipient = async (e: CustomEvent) => {
    let addr = e.detail.value

    if (addr === 'me') {
      account = $walletAccount
    }
    if (isAddress(addr)) {
      recipient.set(addr)
      return
    }
    if (addr.includes('.eth')) {
      const publicClient = createPublicClient({
        chain: chainsMetadata[Chains.ETH],
        transport: http(),
      })
      const resolved = await ensToAddress(publicClient, addr)
      if (resolved) {
        account = resolved
        recipient.set(addr)
      }
    }
  }
  const updateTo = (e: CustomEvent) => {
    to.set(e.detail.value)
  }
</script>

<div class="my-2 text-sm">
  <div class="bg-slate-100 rounded-t-lg py-2 px-4 justify-between flex flex-row">
    <span>Recv</span>
    <SmallInput value={account || zeroAddress} on:update={updateRecipient} />
  </div>
  <div class="bg-slate-100 mt-[1px] py-2 px-4 justify-between flex flex-row">
    <span>Unwrap</span>
    <input
      type="checkbox"
      class="toggle toggle-sm [--tglbg:white] border-purple-600 bg-purple-600 hover:bg-purple-400 disabled:bg-purple-600 disabled:opacity-100"
      disabled
      bind:checked={$unwrap}
    />
  </div>
  <div class="bg-slate-100 mt-[1px] py-2 px-4 justify-between flex flex-row">
    <span>To</span>
    <SmallInput value={$to} on:update={updateTo} />
  </div>
  <div class="bg-slate-100 rounded-b-lg mt-[1px] py-2 px-4 justify-between flex flex-row">
    <span>Data</span>
    <textarea
      name="calldata"
      id="calldata"
      disabled
      class="bg-transparent outline-none resize-none flex flex-grow px-2 cursor-not-allowed"
      rows="5">{$calldata}</textarea
    >
  </div>
</div>
