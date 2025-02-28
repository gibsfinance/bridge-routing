<script lang="ts">
  import Icon from '@iconify/svelte'
  import GreenBadge from '$lib/components/Badge.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import Input from './Input.svelte'
  import Button from './Button.svelte'
  import { SvelteMap } from 'svelte/reactivity'
  import type { Chains } from '$lib/stores/auth/types'
  type Data = [Chains, string[]][]
  type Props = {
    data: Data
    onsubmit: (data: Data) => void
    onclose: () => void
  }
  const { onsubmit, onclose, data: startingData }: Props = $props()
  const updated = $state<SvelteMap<Chains, string[]>>(new SvelteMap())
  const buttonClasses =
    'rounded-md bg-neutral-600 px-3 py-3 text-sm font-semibold text-white shadow-xs hover:bg-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 grow transition-all'
  const data = new SvelteMap(startingData)
  const rpcs = {
    add: (chain: Chains) => {
      const currentChainValue = updated.get(chain) ?? ([] as string[])
      currentChainValue.push('')
      updated.set(chain, currentChainValue)
    },
    remove: (chain: Chains, i: number) => {
      const currentChainValue = updated.get(chain) ?? ([] as string[])
      const updatedRPCs = currentChainValue.slice(0).splice(i, 1)
      updated.set(chain, updatedRPCs)
    },
    update: (chain: Chains, i: number, value: string) => {
      const currentChainValue = updated.get(chain) ?? ([] as string[])
      currentChainValue[i] = value
      updated.set(chain, currentChainValue)
    },
    restoreDefault: (chain: Chains) => {
      const updatedRPCs = chainsMetadata[chain].rpcUrls.default.http.slice(0)
      updated.set(chain, updatedRPCs)
    },
    hasDefault: (chain: Chains, list: string[]) => {
      const defaultValues = chainsMetadata[chain].rpcUrls.default.http.slice(0)
      const currentChainValue = updated.get(chain) ?? ([] as string[])
      return (
        currentChainValue.length === list.length &&
        currentChainValue.every((value, index) => value === defaultValues[index])
      )
    },
  }
</script>

<div class="flex flex-col h-full p-4">
  <h2 class="leading-10 text-2xl text-center flex flex-row items-center justify-center">
    <GreenBadge icon="carbon:network-4" />
    <span class="ml-2">RPCs</span>
  </h2>
  <p class="text-center pt-3 text-sm text-gray-400 max-w-md m-auto">
    Endpoints will be used under the same public client, and will use batching where possible.
  </p>
  <div class="overflow-y-scroll flex flex-col max-h-72">
    {#each data as [chain, list]}
      <div class="mt-3">
        <div class="flex flex-row">
          <label class="mb-3 flex flex-row items-center">
            <button type="button" class="mx-3" onclick={() => rpcs.add(chain)}>
              <Icon icon="gridicons:add-outline" />
            </button>
            {chainsMetadata[chain].name}
          </label>
        </div>
        <ul class="flex flex-col w-full">
          {#each list as rpc, i}
            <li class="mb-3 flex w-full grow">
              <label for="" class="relative flex grow">
                <Input
                  value={rpc}
                  class="border border-neutral-500 focus:border-neutral-600"
                  oninput={(val) => {
                    rpcs.update(chain, i, val)
                  }} />
                <button
                  type="button"
                  class="absolute top-0 bottom-0 right-0 justify-center flex size-8 items-center"
                  onclick={() => rpcs.remove(chain, i)}>
                  <Icon icon="zondicons:close-outline" />
                </button>
              </label>
            </li>
          {/each}
          {#if !rpcs.hasDefault(chain, list)}
            <li class="mb-3 flex w-full grow">
              <label class="flex text-sm">
                <Button
                  class={buttonClasses}
                  onclick={() => {
                    rpcs.restoreDefault(chain)
                  }}>Restore Default</Button>
              </label>
            </li>
          {/if}
        </ul>
      </div>
    {/each}
  </div>
  <div class="flex flex-row gap-3 pt-3">
    <Button class={buttonClasses} onclick={onclose}>Close</Button>
    <Button class={buttonClasses} onclick={() => onsubmit([...data.entries()])}>Reload</Button>
  </div>
</div>
