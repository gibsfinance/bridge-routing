<script lang="ts">
  import Input from "./Input.svelte"
  import Section from "./Section.svelte"
  import { accountState } from "../stores/auth/AuthProvider.svelte"
  import { getAddress, isAddress, zeroAddress, type Hex } from "viem"
  import Icon from "@iconify/svelte"
  import { page } from "../stores/app-page.svelte"
  import { details } from "../stores/settings.svelte"
  import Button from "./Button.svelte"
  import LockIcon from "./LockIcon.svelte"
  // import { untrack } from "svelte"
  import { recipient, clientFromChain, recipientLockedToAccount, recipientInput } from "../stores/input.svelte"
  import { ensTld, isEns } from '../stores/ens'
  import { normalize } from 'viem/ens'
  import { ensToAddress } from '../stores/auth/store.svelte'
  import { Chains } from '../stores/auth/types'
  import { type Cleanup } from '../stores/loading.svelte'

  const oninput = (value: string) => {
    recipientIsDecoupled = true
    recipientInput.value = value.trim()
    updateDestination(recipientInput.value)
  }
  let recipientIsDecoupled = $state(false)
  // let currentRecipient = $state((accountState.address ?? '') as string)
  // const isValidRecipient = $derived(isAddress(currentRecipient))
  // $effect(() => {
  //   if (recipientIsDecoupled) return
  //   if (!accountState.address) return
  //   const input = untrack(() => currentRecipient)
  //   if (input === accountState.address) return
  //   currentRecipient = accountState.address
  // })

  const isValidRecipient = $derived(
    !accountState.address || (
      isAddress(recipientInput.value || '') &&
      recipientInput.value?.length === 42 &&
      recipientInput.value !== zeroAddress
    ),
  )
  // $effect.pre(() => {
  //   recipientInput.value = accountState.address ?? zeroAddress
  // })
  $effect.pre(() => {
    const r = recipientInput.value
    if (isValidRecipient) {
      recipient.value = r as Hex
    }
  })
  $effect(() => {
    recipientInput.value = accountState.address ?? ''
    recipientLockedToAccount.value = !!accountState.address
  })
  let ensToAddressLoader: {
    promise: Promise<Hex | null>
    controller: AbortController
    cleanup: Cleanup
  } | null = null
  const updateDestination = (value: string) => {
    recipientInput.value = value
    if (recipientInput.value === 'me') {
      if (accountState.address) {
        recipientInput.value = accountState.address
      }
      return
    }
    if (isAddress(recipientInput.value)) {
      recipientInput.value = getAddress(recipientInput.value)
      recipientLockedToAccount.value = false
      return
    }
    if (isEns(recipientInput.value)) {
      const tld = ensTld(recipientInput.value)
      const ens = normalize(recipientInput.value)
      const client = clientFromChain(Number(Chains[tld]))
      ensToAddressLoader?.controller?.abort()
      ensToAddressLoader?.cleanup()
      ensToAddressLoader = ensToAddress({ client, ens })
      ensToAddressLoader.promise.then((resolved) => {
        if (ensToAddressLoader?.controller.signal.aborted || !resolved) {
          return null
        }
        recipientInput.value = resolved
        recipientLockedToAccount.value = false
      })
    }
  }
</script>

<Section id="destination-address" focused compressed flexClass="flex flex-row">
  <Button class={`transition-all duration-100 size-6 ${page.details === details.SHOW ? 'rotate-90' : ''}`} onclick={() => {
    page.setParam('details', page.details === details.SHOW ? details.CLOSED : details.SHOW)
  }}>
    <Icon icon="bi:chevron-bar-right" class="size-6" />
  </Button>
  <Input
    {oninput}
    id="destination-address"
    value={recipientInput.value}
    placeholder="Destination Address"
    class="border-none grow px-1 py-1 text-right focus:ring-0 {isValidRecipient ? 'text-surface-contrast-50' : 'text-red-500'}" />
  <Button class="size-6 text-base justify-end flex" onclick={() => {
    recipientIsDecoupled = !recipientIsDecoupled
    if (accountState.address) {
      recipientInput.value = accountState.address
    }
  }}>
    <LockIcon locked={!recipientIsDecoupled} />
  </Button>
</Section>
