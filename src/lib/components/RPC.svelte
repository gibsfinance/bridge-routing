<script lang="ts">
  import Icon from '@iconify/svelte'
  import GreenBadge from '$lib/components/Badge.svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import * as rpcs from '$lib/stores/rpcs'
  import { createEventDispatcher } from 'svelte'
  import Input from './Input.svelte'
  import Button from './Button.svelte'
  const { store: rpcStore } = rpcs
  const dispatch = createEventDispatcher()
  const dispatchClose = () => dispatch('close')
  const dispatchSubmit = () => dispatch('submit')
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
    {#each $rpcStore as [chain, list]}
      <div class="mt-3">
        <div class="flex flex-row">
          <label class="mb-3 flex flex-row items-center">
            <button type="button" class="mx-3" on:click={() => rpcs.add(chain)}>
              <Icon icon="gridicons:add-outline" />
            </button>
            {chainsMetadata[chain].name}
          </label>
        </div>
        <ul class="flex flex-col w-full">
          {#each list as rpc, i}
            <li class="mb-3 flex w-full flex-grow">
              <label for="" class="relative flex flex-grow">
                <Input
                  bind:value={rpc}
                  class="border border-neutral-500 focus:border-neutral-600"
                  on:blur={() => {
                    rpcs.update(chain, i, rpc)
                  }} />
                <button
                  type="button"
                  class="absolute top-0 bottom-0 right-0 justify-center flex size-8 items-center"
                  on:click={() => rpcs.remove(chain, i)}>
                  <Icon icon="zondicons:close-outline" />
                </button>
              </label>
            </li>
          {/each}
          {#if !rpcs.hasDefault(chain, list)}
            <li class="mb-3 flex w-full flex-grow">
              <label class="flex text-sm">
                <button
                  type="button"
                  class="btn btn-sm btn-neutral"
                  on:click={() => {
                    rpcs.restoreDefault(chain)
                  }}>Restore Default</button>
              </label>
            </li>
          {/if}
        </ul>
      </div>
    {/each}
  </div>
  <div class="flex flex-row gap-3 pt-3">
    <Button type="button" on:click={dispatchClose}>Close</Button>
    <Button type="button" on:click={dispatchSubmit}>Reload</Button>
  </div>
</div>
