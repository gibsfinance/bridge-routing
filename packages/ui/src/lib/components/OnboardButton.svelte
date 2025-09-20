<script lang="ts">
  import Button from './Button.svelte'
  import Loading from './Loading.svelte'
  import {
    accountState,
    connect,
    getNetwork,
    switchNetwork,
  } from '../stores/auth/AuthProvider.svelte'
  import { loading } from '../stores/loading.svelte'

  type Props = {
    disabled: boolean
    onclick: () => void
    text: string
    loadingKey: string
    requiredChain?: {
      id: number | string
      name: string
    } | null
  }
  const {
    disabled: disabledMain,
    onclick: onClickMain,
    text: textMain,
    loadingKey,
    requiredChain,
  }: Props = $props()
  const isRequiredChain = $derived.by(() => {
    if (!requiredChain) return false
    return requiredChain.id === Number(accountState.chainId)
  })
  const disabled = $derived.by(() => {
    if (!accountState.connected) {
      return false
    }
    if (!isRequiredChain) {
      return false
    }
    return disabledMain
  })
  const text = $derived.by(() => {
    if (!accountState.connected) {
      return 'Connect Wallet'
    }
    if (!requiredChain) {
      return 'Switch Network'
    }
    if (!isRequiredChain) {
      return 'Switch to ' + requiredChain.name
    }
    return textMain
  })
  const onclick = $derived(
    loading.loadsAfterTick(loadingKey, () => {
      if (!accountState.connected) {
        return connect()
      }
      if (!isRequiredChain) {
        const chain = getNetwork({
          chainId: requiredChain!.id,
          name: requiredChain!.name,
        })
        return switchNetwork(chain!)
      }
      return onClickMain()
    }),
  )
</script>

<div class="flex flex-row rounded-2xl overflow-hidden">
  <Button
    {disabled}
    class="bg-tertiary-500 text-surface-contrast-950 h-14 grow text-xl flex flex-row items-center justify-center shrink-0 gap-2"
    {onclick}>
    <div class="size-6"></div>
    {text}
    <div class="size-6">
      <Loading key={loadingKey} class="size-6" />
    </div>
  </Button>
</div>
