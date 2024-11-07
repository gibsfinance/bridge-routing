<script lang="ts">
  import SmallInput from './SmallInput.svelte'
  import { ensToAddress, walletAccount } from '$lib/stores/auth/store'
  import { isAddress, zeroAddress, getAddress } from 'viem'
  import { unwrap, transactionInputs } from '$lib/stores/bridge-settings'
  import * as input from '$lib/stores/input'
  import { Chains } from '$lib/stores/auth/types'
  import Warning from './Warning.svelte'
  import { ensTld, isEns } from '$lib/stores/ens'
  import { normalize } from 'viem/ens'
  import { loading } from '$lib/stores/loading'
  import LockIcon from './LockIcon.svelte'
  const { recipient, canChangeUnwrap, router, bridgePathway, recipientLockedToAccount } = input
  const updateDestination = async (e: CustomEvent) => {
    let addr = e.detail.value
    if (addr === 'me') {
      if ($walletAccount) {
        recipient.set($walletAccount)
      }
      return
    }
    if (isAddress(addr)) {
      recipient.set(getAddress(addr))
      recipientLockedToAccount.set(false)
      return
    }
    if (isEns(addr)) {
      const tld = ensTld(addr)
      const normalized = normalize(addr)
      const publicClient = input.clientFromChain(Chains[tld])
      loading.increment('ens')
      const resolved = await ensToAddress(publicClient, normalized).catch((err) => {
        console.error(err)
        return null
      })
      if (resolved) {
        recipient.set(resolved)
        recipientLockedToAccount.set(false)
      }
      loading.decrement('ens')
    }
  }
  $: nonZeroXCalldata = $transactionInputs?.data?.slice(2) || ''
  const lockRecipient = () => {
    const current = $recipientLockedToAccount
    recipientLockedToAccount.set(!current)
    if (!current && $walletAccount) {
      recipient.set($walletAccount)
    }
  }
</script>

<div class="my-2 text-sm shadow-sm rounded-lg">
  <div class="bg-slate-100 rounded-t-lg py-2 px-3 justify-between flex flex-col sm:flex-row relative">
    <button type="button" on:click={lockRecipient}>Recipient <LockIcon locked={$recipientLockedToAccount} /></button>
    <SmallInput
      editOnLeft
      value={recipient}
      on:input={updateDestination}
      class="font-mono text-xs sm:text-sm mr-auto sm:mr-0" />
    <Warning
      show={!(isAddress($recipient || '') && $recipient?.length === 42 && $recipient !== zeroAddress)}
      tooltip="Address is not valid. Casing influences the checksum of the address." />
  </div>
  {#if $router}
    <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-col sm:flex-row disabled cursor-not-allowed">
      <span>Router</span>
      <span class="font-mono text-xs sm:text-sm">{$router}</span>
    </div>
  {/if}
  <div class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-row">
    <span>Unwrap</span>
    <input
      type="checkbox"
      class="toggle toggle-sm [--tglbg:white] border-purple-600 bg-purple-600 hover:bg-purple-400 disabled:bg-purple-600 disabled:opacity-100"
      class:cursor-not-allowed={!$canChangeUnwrap}
      disabled={!$canChangeUnwrap}
      checked={$unwrap}
      on:change={(e) => {
        input.unwrap.set(e.currentTarget.checked)
      }} />
  </div>
  <div
    class="bg-slate-100 mt-[1px] py-2 px-3 justify-between flex flex-col sm:flex-row disabled cursor-not-allowed"
    class:rounded-b-lg={!nonZeroXCalldata}>
    <span>To (Bridge)</span>
    <span class="font-mono text-xs sm:text-sm">{$bridgePathway?.to || zeroAddress}</span>
  </div>
  {#if nonZeroXCalldata}
    <div class="bg-slate-100 rounded-b-lg mt-[1px] py-2 px-3 justify-between flex flex-col sm:flex-row">
      <span class="whitespace-pre">Data&nbsp;&nbsp;<span class="font-mono">0x</span></span>
      <textarea
        name="calldata"
        id="calldata"
        disabled
        class="bg-transparent outline-none resize-none flex flex-grow cursor-not-allowed font-mono text-xs sm:text-sm -mr-3 pr-3 max-h-24"
        rows={4}>{nonZeroXCalldata}</textarea>
    </div>
  {/if}
</div>
