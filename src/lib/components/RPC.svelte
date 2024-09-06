<script lang="ts">
  import Icon from '@iconify/svelte'
  import { chainsMetadata } from '$lib/stores/auth/constants'
  import * as rpcs from '$lib/stores/rpcs'
  import { createEventDispatcher } from 'svelte'
  const { store: rpcStore } = rpcs
  const dispatch = createEventDispatcher()
  const dispatchClose = () => dispatch('close')
  const dispatchSubmit = () => dispatch('submit')
</script>

<div class="flex flex-col h-full py-4">
  <h2 class="leading-10 text-2xl text-center">RPCs</h2>
  <p class="text-center px-4 text-sm text-gray-400">
    Endpoints will be used under the same public client, and will use batching where possible.
  </p>
  <div class="overflow-y-scroll flex flex-col px-4">
    {#each $rpcStore as [chain, list]}
      <div class="mt-4">
        <div class="flex flex-row">
          <label class="mb-2 flex flex-row items-center">
            <button type="button" class="mx-2" on:click={() => rpcs.add(chain)}>
              <Icon icon="gridicons:add-outline" />
            </button>
            {chainsMetadata[chain].name}
          </label>
        </div>
        <ul class="flex flex-col w-full">
          {#each list as rpc, i}
            <li class="mb-2 flex w-full flex-grow">
              <label for="" class="relative flex flex-grow">
                <input
                  type="text"
                  class="input grow input-bordered w-full input-sm"
                  value={rpc}
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
            <li class="mb-2 flex w-full flex-grow">
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
  <div class="flex flex-row gap-2 px-4">
    <button type="button" class="btn btn-neutral grow" on:click={dispatchClose}>Close</button>
    <button type="button" class="btn btn-neutral grow" on:click={dispatchSubmit}>Reload</button>
  </div>
</div>
