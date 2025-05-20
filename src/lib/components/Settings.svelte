<script lang="ts">
  import { isAddress, zeroAddress, getAddress, type Hex } from 'viem'
  import { bridgeSettings } from '../stores/bridge-settings.svelte'
  import * as input from '../stores/input.svelte'
  import { Chains } from '../stores/auth/types'
  import Warning from './Warning.svelte'
  import { ensTld, isEns } from '../stores/ens'
  import { normalize } from 'viem/ens'
  import { type Cleanup } from '../stores/loading.svelte'
  import LockIcon from './LockIcon.svelte'
  import { accountState } from '../stores/auth/AuthProvider.svelte'
  import { ensToAddress } from '../stores/auth/store.svelte'
  import Button from './Button.svelte'
  import ButtonToggle from './ButtonToggle.svelte'
  import Input from './Input.svelte'
  const { recipient, bridgeKey, recipientLockedToAccount } = input
  let currentRecipient = $state((accountState.address ?? zeroAddress) as string)
  const isValidRecipient = $derived(
    isAddress(currentRecipient || '') &&
      currentRecipient?.length === 42 &&
      currentRecipient !== zeroAddress,
  )
  $effect.pre(() => {
    currentRecipient = accountState.address ?? zeroAddress
  })
  $effect.pre(() => {
    const r = currentRecipient
    if (isValidRecipient) {
      recipient.value = r as Hex
    }
  })
  let ensToAddressLoader: {
    promise: Promise<Hex | null>
    controller: AbortController
    cleanup: Cleanup
  } | null = null
  const updateDestination = (value: string) => {
    currentRecipient = value
    if (currentRecipient === 'me') {
      if (accountState.address) {
        currentRecipient = accountState.address
      }
      return
    }
    if (isAddress(currentRecipient)) {
      currentRecipient = getAddress(currentRecipient)
      recipientLockedToAccount.value = false
      return
    }
    if (isEns(currentRecipient)) {
      const tld = ensTld(currentRecipient)
      const ens = normalize(currentRecipient)
      const client = input.clientFromChain(Number(Chains[tld]))
      ensToAddressLoader?.controller?.abort()
      ensToAddressLoader?.cleanup()
      ensToAddressLoader = ensToAddress({ client, ens })
      ensToAddressLoader.promise.then((resolved) => {
        if (ensToAddressLoader?.controller.signal.aborted || !resolved) {
          return null
        }
        currentRecipient = resolved
        recipientLockedToAccount.value = false
      })
    }
  }
  const nonZeroXCalldata = $derived(bridgeSettings.transactionInputs?.data?.slice(2) || '')
  const lockRecipient = () => {
    const current = recipientLockedToAccount.value
    recipientLockedToAccount.value = !current
    if (!current && accountState.address) {
      currentRecipient = accountState.address
    }
  }
  const canUnwrap = $derived(input.canChangeUnwrap(bridgeKey.value, bridgeSettings.assetIn.value))
</script>

<div class="flex flex-col gap-2 text-sm">
  <div
    class="leading-6 sm:justify-between flex flex-col sm:flex-row relative sm:items-center text-left items-start">
    <Button
      class="flex flex-row items-center grow flex-nowrap"
      type="button"
      onclick={lockRecipient}
      >Recipient&nbsp;<LockIcon locked={recipientLockedToAccount.value} /></Button>
    <Input
      value={currentRecipient}
      oninput={updateDestination}
      class="border-none font-mono mr-auto sm:mr-0 p-0 text-xs sm:text-right ring-0" />
    <Warning
      show={!isValidRecipient}
      wrapperPositionClass="top-0 -left-6"
      tooltip="Address is not valid. Casing influences the checksum of the address." />
  </div>
  {#if bridgeKey.destinationRouter}
    <div
      class="leading-6 justify-between flex flex-col sm:flex-row sm:items-center disabled cursor-not-allowed relative">
      <span>Router</span>
      <span class="font-mono text-xs">{bridgeKey.destinationRouter}</span>
    </div>
  {/if}
  {#if canUnwrap}
    <div class="leading-6 justify-between flex flex-row items-center">
      <ButtonToggle
        title="Unwrap"
        contentClass="leading-6 sm:text-sm"
        checked={input.unwrap.value}
        onclick={() => {
          input.unwrap.value = !input.unwrap.value
        }}>Unwrap</ButtonToggle>
    </div>
  {/if}
  <div
    class="leading-6 justify-between flex flex-col sm:flex-row sm:items-center disabled cursor-not-allowed"
    class:rounded-b-lg={!nonZeroXCalldata}>
    <span>To (Bridge)</span>
    <span class="font-mono text-xs">{bridgeKey.pathway?.to || zeroAddress}</span>
  </div>
  {#if nonZeroXCalldata}
    <div
      class="rounded-b-lg leading-4 justify-between flex flex-col sm:flex-row cursor-not-allowed">
      <span class="flex flex-row items-start justify-between whitespace-pre"
        >Data &nbsp;&nbsp;<span class="font-mono text-xs">0x</span></span>
      <textarea
        name="calldata"
        id="calldata"
        disabled
        class="bg-transparent !opacity-100 text-surface-contrast-50 border-none outline-hidden resize-none flex grow cursor-not-allowed font-mono text-xs -mr-3 pr-2 p-0 max-h-24"
        rows={4}>{nonZeroXCalldata}</textarea>
    </div>
  {/if}
</div>
