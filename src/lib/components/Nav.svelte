<script lang="ts">
  import { goto } from '$app/navigation'
  import gibs from '$lib/images/1FAF0.svg'

  const gotoHome = async () => {
    await goto('/')
  }
  const gotoNativeDelivery = async () => {
    await goto('/bridge')
  }
</script>

<div class="h-10 -mb-10 z-20">
  <nav class="fixed h-10 leading-8 px-2 flex flex-row right-0 left-0 shadow-inner">
    <div class="max-w-5xl m-auto w-full flex justify-between">
      <span
        role="button"
        tabindex="-1"
        on:keypress={gotoHome}
        on:click={gotoHome}
        class="link leading-8 pr-2 text-white font-italiana uppercase flex flex-row">
        <img
          src={gibs}
          alt="a yellow hand with index finger and thub rubbing together"
          style="height: 32px" /> Gibs
      </span>
      <div>
        <ul>
          <li>
            <button class="link" on:keypress={gotoNativeDelivery} on:click={gotoNativeDelivery}>
              🌁
            </button>
          </li>
        </ul>
        <div id="onboard-container"></div>
      </div>
    </div>
  </nav>
</div>

<style lang="postcss">
  .link {
    @apply cursor-pointer px-2 py-1 text-xl;
  }
</style>
