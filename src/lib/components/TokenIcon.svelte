<script lang="ts" context="module">
  import * as viem from 'viem'
  const cached = new Map<string, string | false>()
</script>

<script lang="ts">
  import Icon from '@iconify/svelte'
  import _ from 'lodash'
  let sourceInput = ''
  export { sourceInput as src }
  export let sources: string[] = []
  export let alt = ''
  export let size = 32
  export let visible = false
  let className = ''
  export { className as class }
  let src = sourceInput
  $: key = viem.keccak256(viem.concatBytes(sources.map((s) => viem.toBytes(viem.toHex(s)))))
  $: src = sourceInput || cached.get(key) || ''
  $: if (!src && visible) {
    const val = cached.get(key)
    if (_.isNil(val)) {
      sources
        .reduce(async (res, source) => {
          await res
          let r = res
          if (!src && source) {
            r = fetch(source)
              .then(async (res) => {
                if (!res.ok) {
                  // try next source
                  return
                }
                src = source
              })
              .catch((err) => {
                console.log(err)
              })
          }
          return r
        }, Promise.resolve())
        .then(() => {
          cached.set(key, src || false)
        })
    }
  }
</script>

{#if !src || !visible}
  <div class="flex" data-url={src}>
    <Icon icon="ph:question" height={size} width={size} class={className} />
  </div>
{:else}
  <img data-sources={JSON.stringify(sources)} {src} {alt} height={size} width={size} class={className} />
{/if}
