<script lang="ts">
  import Icon from '@iconify/svelte'
  import { SvelteMap } from 'svelte/reactivity'
  import _ from 'lodash'
  import { chainsMetadata } from '@gibs/bridge-sdk/chains'
  import { toChain } from '@gibs/bridge-sdk/config'

  import GreenBadge from './Badge.svelte'
  import Input from './Input.svelte'
  import Button from './Button.svelte'

  type Data = [number, string[]][]
  type Props = {
    data: Data
    onsubmit: (data: Data) => void
    onclose: () => void
  }
  const { onsubmit, onclose, data: startingData }: Props = $props()
  const restoreDefaultsButtonClass =
    'rounded-2xl bg-neutral-500 dark:bg-neutral-800 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-neutral-600 focus:outline-none grow transition-all'
  const data = new SvelteMap(startingData)
  const rpcs = {
    add: (chain: number) => {
      const currentChainValue = data.get(chain) ?? ([] as string[])
      const updated = _.uniq([...currentChainValue, ''])
      data.set(chain, updated)
    },
    remove: (chain: number, i: number) => {
      const currentChainValue = data.get(chain) ?? ([] as string[])
      const updatedRPCs = currentChainValue.filter((_, index) => index !== i)
      data.set(chain, updatedRPCs)
    },
    update: (chain: number, i: number, value: string) => {
      const currentChainValue = data.get(chain) ?? ([] as string[])
      const copy = [...currentChainValue].map((v, index) => (index === i ? value : v))
      data.set(chain, copy)
    },
    restoreDefault: (chain: number) => {
      const updatedRPCs = chainsMetadata[toChain(chain)].rpcUrls.default.http.slice(0)
      data.set(chain, updatedRPCs)
    },
    isDefault: (chain: number, list: string[]) => {
      const defaultValues = chainsMetadata[toChain(chain)].rpcUrls.default.http.slice(0)
      return (
        defaultValues.length === list.length &&
        defaultValues.every((value, index) => value === list[index])
      )
    },
  }
</script>

<div class="flex flex-col h-full gap-2 dark:text-surface-950">
  <h2 class="leading-10 text-2xl text-center flex flex-row items-center justify-center px-4 pt-4">
    <GreenBadge icon="carbon:network-4" />
    <span class="ml-2">RPCs</span>
  </h2>
  <p class="text-center text-sm max-w-md mx-auto">
    Endpoints will be used under the same public client, and will use batching where possible.
  </p>
  <div class="overflow-y-scroll flex flex-col max-h-64 h-full px-4">
    {#each data.entries() as [chain, list] (chain)}
      <div class="mt-3">
        <div class="flex flex-row">
          <Button class="mb-1 flex flex-row items-center gap-2" onclick={() => rpcs.add(chain)}>
            <Icon icon="zondicons:add-outline" class="size-4" />
            {chainsMetadata[toChain(chain)].name}
          </Button>
        </div>
        <ul class="flex flex-col w-full gap-2">
          {#each list as rpc, i (chain + '-' + i)}
            <li class="flex w-full grow">
              <label for="" class="relative flex grow">
                <Input
                  value={rpc}
                  class="border border-surface-200 dark:border-surface-700 rounded-full py-0 h-10 leading-10 text-surface-50 bg-surface-50 dark:bg-surface-950 dark:text-surface-950 focus:ring-0 focus:border-surface-500 dark:focus:border-surface-500"
                  oninput={(val) => {
                    rpcs.update(chain, i, val)
                  }} />
                <Button
                  class="absolute bottom-0 right-0 top-0 justify-center flex size-10 items-center text-surface-50 dark:text-surface-950"
                  onclick={() => rpcs.remove(chain, i)}>
                  <Icon icon="zondicons:close-outline" class="size-4" />
                </Button>
              </label>
            </li>
          {/each}
          {#if !rpcs.isDefault(chain, list)}
            <li class="flex w-full grow">
              <label class="flex text-sm">
                <Button
                  class={restoreDefaultsButtonClass}
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
  <div class="flex flex-row gap-2 p-4 border-t border-surface-200 dark:border-surface-700">
    <Button
      class="flex w-1/2 text-center justify-center border border-surface-200 hover:border-surface-300 dark:border-surface-700 dark:hover:border-surface-600 text-surface-50 dark:text-surface-950 leading-6 p-2 rounded-2xl font-semibold hover:shadow transition-all duration-100"
      onclick={onclose}>Close</Button>
    <Button
      class="flex w-1/2 text-center justify-center bg-surface-500 text-surface-950 leading-6 p-2 rounded-2xl font-semibold hover:bg-surface-600 hover:shadow transition-all duration-100"
      onclick={() => onsubmit([...data.entries()])}>Reload</Button>
  </div>
</div>
