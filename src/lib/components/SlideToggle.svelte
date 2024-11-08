<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  export let size = 20
  export let checked = false
  const dispatch = createEventDispatcher()

  const uniqueID = Math.floor(Math.random() * 100)

  function handleClick(event: MouseEvent) {
    const target = event.target as HTMLButtonElement

    const state = target.getAttribute('aria-checked')

    checked = state === 'true' ? false : true
    dispatch('change', checked)
  }
</script>

<div class="s s--slider" style="font-size:{size}px">
  <button
    role="switch"
    aria-checked={checked}
    aria-labelledby={`switch-${uniqueID}`}
    on:click={handleClick}></button>
</div>

<style type="postcss">
  :root {
    --accent-color: CornflowerBlue;
    --gray: #ccc;
  }
  /* Slider Design Option */

  .s--slider {
    display: flex;
    align-items: center;
  }

  .s--slider button {
    width: 1.8em;
    height: 1em;
    position: relative;
    border: none;
    transition: all 0.2s;
    @apply bg-slate-300;
  }

  .s--slider button::before {
    content: '';
    position: absolute;
    width: 0.8em;
    height: 0.8em;
    background: #fff;
    top: 0.1em;
    right: 100%;
    transition: all 0.2s;
    transform: translateX(calc(100% + 0.1em));
  }

  .s--slider button[aria-checked='true'] {
    @apply bg-purple-600;
  }

  .s--slider:hover button[aria-checked='true'] {
    @apply bg-purple-500;
  }

  .s--slider button[aria-checked='true']::before {
    transform: translateX(-0.1em);
    right: 0;
  }

  .s--slider button:focus {
    box-shadow: 0 0px 0px 1px var(--accent-color);
  }

  /* Slider Design Option */
  .s--slider button {
    border-radius: 9999px;
  }

  .s--slider button::before {
    border-radius: 9999px;
  }

  .s--slider button:focus {
    box-shadow: 0 0px 2px var(--accent-color);
    border-radius: 9999px;
  }
</style>
