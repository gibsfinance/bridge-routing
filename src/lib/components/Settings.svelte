<script lang="ts">
  import SmallInput from './SmallInput.svelte'
  import { isAddress, zeroAddress, getAddress } from 'viem'
  import { bridgeSettings } from '$lib/stores/bridge-settings.svelte'
  import * as input from '$lib/stores/input.svelte'
  import { Chains } from '$lib/stores/auth/types'
  import Warning from './Warning.svelte'
  import { ensTld, isEns } from '$lib/stores/ens'
  import { normalize } from 'viem/ens'
  import { loading } from '$lib/stores/loading.svelte'
  import LockIcon from './LockIcon.svelte'
  import { accountState } from '$lib/stores/auth/AuthProvider.svelte'
  import { ensToAddress } from '$lib/stores/auth/store.svelte'
  const { recipient, bridgeKey, recipientLockedToAccount } = input
  const walletAccount = $derived(accountState.address)
  const updateDestination = (value: string) => {
    let addr = value
    if (addr === 'me') {
      if (walletAccount) {
        recipient.value = walletAccount
      }
      return
    }
    if (isAddress(addr)) {
      recipient.value = getAddress(addr)
      recipientLockedToAccount.value = false
      return
    }
    if (isEns(addr)) {
      const tld = ensTld(addr)
      const normalized = normalize(addr)
      const publicClient = input.clientFromChain(Chains[tld])
      loading.increment('ens')
      ensToAddress(publicClient, normalized)
        .catch((err) => {
          console.error(err)
          return null
        })
        .then((resolved) => {
          if (resolved) {
            recipient.value = resolved
            recipientLockedToAccount.value = false
          }
          loading.decrement('ens')
        })
    }
  }
  const nonZeroXCalldata = $derived(bridgeSettings.transactionInputs?.data?.slice(2) || '')
  const lockRecipient = () => {
    const current = recipientLockedToAccount.value
    recipientLockedToAccount.value = !current
    if (!current && accountState.address) {
      recipient.value = accountState.address
    }
  }
  // const canToggleUnwrap = $derived(
  //   canChangeUnwrap(bridgeKey.value, bridgeSettings.assetIn.value)
  // )
</script>

<div class="my-2 text-sm shadow-sm rounded-lg hover:shadow transition-shadow">
  <div
    class="bg-slate-50 rounded-t-lg py-2 px-3 justify-between flex flex-col sm:flex-row relative">
    <button type="button" onclick={lockRecipient}
      >Recipient <LockIcon locked={recipientLockedToAccount.value} /></button>
    <SmallInput
      editOnLeft
      value={recipient.value}
      oninput={updateDestination}
      class="font-mono text-xs sm:text-sm mr-auto sm:mr-0"
      inputClass="text-sm" />
    <Warning
      show={!(
        isAddress(recipient.value || '') &&
        recipient.value?.length === 42 &&
        recipient.value !== zeroAddress
      )}
      tooltip="Address is not valid. Casing influences the checksum of the address." />
  </div>
  {#if bridgeKey.destinationRouter}
    <div
      class="bg-slate-50 mt-[1px] py-2 px-3 justify-between flex flex-col sm:flex-row disabled cursor-not-allowed">
      <span>Router</span>
      <span class="font-mono text-xs sm:text-sm">{bridgeKey.destinationRouter}</span>
    </div>
  {/if}
  <div class="bg-slate-50 mt-[1px] py-2 px-3 justify-between flex flex-row">
    <span>Unwrap</span>
    <input
      type="checkbox"
      class="toggle toggle-sm [--tglbg:white] border-tertiary-600 bg-tertiary-600 hover:bg-tertiary-400 disabled:bg-tertiary-600 disabled:opacity-100"
      class:cursor-not-allowed={!bridgeSettings.unwrap}
      disabled={!bridgeSettings.unwrap}
      checked={input.unwrap.value}
      onchange={(e) => {
        input.unwrap.value = e.currentTarget.checked
      }} />
  </div>
  <div
    class="bg-slate-50 mt-[1px] py-2 px-3 justify-between flex flex-col sm:flex-row disabled cursor-not-allowed"
    class:rounded-b-lg={!nonZeroXCalldata}>
    <span>To (Bridge)</span>
    <span class="font-mono text-xs sm:text-sm">{bridgeKey.pathway?.to || zeroAddress}</span>
  </div>
  {#if nonZeroXCalldata}
    <div
      class="bg-slate-50 rounded-b-lg mt-[1px] py-2 px-3 justify-between flex flex-col sm:flex-row">
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
