<script lang="ts">
  import { messages, removeMessage } from '$lib/stores/toast'
</script>

<div class="fixed bottom-20 w-full px-4">
  <div class="absolute bottom-0 max-w-80 w-full right-0 px-4">
    {#each $messages as msg}
      <div class="toast mb-4">
        <div
          class="alert alert-info bg-purple-400 text-slate-100 py-2 px-3 rounded-md flex justify-between items-center">
          <a
            href={msg.link}
            class="underline flex overflow-ellipsis whitespace-pre"
            aria-label={msg.label}
            target="_blank">
            {msg.message}
          </a>
          <button
            on:click={() => removeMessage(msg)}
            class="size-8 flex justify-center items-center">&times;</button>
        </div>
      </div>
    {/each}
  </div>
</div>
