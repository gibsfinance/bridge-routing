<script lang="ts">
  import { Chains } from '@gibs/bridge-sdk/config'
  import Icon from "@iconify/svelte"
  import { getAddress, isAddress, zeroAddress, type Hex } from "viem"
  import { normalize } from 'viem/ens'

  import { accountState } from "../stores/auth/AuthProvider.svelte"
  import { page } from "../stores/app-page.svelte"
  import { details } from "../stores/settings.svelte"
  import { recipient, clientFromChain, recipientLockedToAccount, recipientInput } from "../stores/input.svelte"
  import { ensTld, isEns } from '../stores/ens'
  import { ensToAddress } from '../stores/auth/store.svelte'
  import { type Cleanup } from '../stores/loading.svelte'

  import Button from "./Button.svelte"
  import LockIcon from "./LockIcon.svelte"
  import Input from "./Input.svelte"
  import Section from "./Section.svelte"
  import Warning from "./Warning.svelte"

  const oninput = (value: string) => {
    recipientLockedToAccount.value = false
    updateDestination(value)
  }

  const isValidRecipient = $derived(
    !accountState.address || (
      isAddress(recipientInput.value || '') &&
      recipientInput.value?.length === 42 &&
      recipientInput.value !== zeroAddress
    ),
  )
  $effect(() => {
    if (!recipientLockedToAccount.value) return
    recipientInput.value = accountState.address
  })
  $effect(() => {
    const r = recipientInput.value
    if (isValidRecipient && r !== recipient.value) {
      recipient.value = r as Hex
    }
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
        // console.log('ensToAddressLoader.promise.then', resolved)
        if (ensToAddressLoader?.controller.signal.aborted || !resolved) {
          return null
        }
        recipientInput.value = resolved
        recipientLockedToAccount.value = false
      })
    }
  }
  let focused = $state(false)
</script>

<Section id="destination-address" focused compressed flexClass="flex flex-row">
  <Button class={`transition-all duration-100 size-6 ${page.details === details.SHOW ? 'rotate-90' : ''}`} onclick={() => {
    page.setParam('details', page.details === details.SHOW ? details.CLOSED : details.SHOW)
  }}>
    <Icon icon="gravity-ui:arrow-chevron-right" class="size-6" />
  </Button>
  <div class="flex relative grow">
    <Input
      {oninput}
      onfocus={() => {
        focused = true
      }}
      onblur={() => {
        focused = false
      }}
      id="destination-address"
      value={recipientInput.value}
      placeholder="Destination Address"
      class="border-none grow px-1 py-1 text-right focus:ring-0 {isValidRecipient ? 'text-surface-contrast-50' : 'text-red-500'}" />
    <Warning
      show={!isValidRecipient && !focused}
      wrapperPositionClass="-top-1 left-0 -bottom-1 m-auto h-6"
      tooltip="Address is not valid. Casing influences the checksum of the address." />
  </div>
  <Button class="size-6 text-base justify-end flex items-center" onclick={() => {
    recipientLockedToAccount.value = !recipientLockedToAccount.value
    if (accountState.address) {
      recipientInput.value = accountState.address
    }
  }}>
    <LockIcon locked={recipientLockedToAccount.value} />
  </Button>
</Section>
