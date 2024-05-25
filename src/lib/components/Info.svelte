<script lang="ts">
  import Icon from '@iconify/svelte'
  const openModal = () => {
    const el = document.querySelector('#bridge-info-modal') as any
    el.showModal()
  }
</script>

<div class="flex flex-row mb-8">
  <button
    type="button"
    class="border-2 rounded-full h-8 w-8 mr-2 flex justify-center items-center"
    on:click={openModal}><Icon icon="entypo:info" /></button>

  <a href="https://github.com/gibsfinance" target="_blank">
    <button class="border-2 rounded-full h-8 w-8 mr-2 flex justify-center items-center"
      ><Icon icon="fe:github-alt" height="1.5em" width="1.5em" /></button>
  </a>
</div>
<dialog id="bridge-info-modal" class="modal">
  <div class="modal-box text-slate-50">
    <h3 class="font-bold text-center items-center flex justify-center text-lg mb-2">
      <Icon icon="material-symbols:info-outline" height="3em" width="3em" />
    </h3>
    <div class="flex">
      <ul class="gap-4 flex flex-col">
        <li class="flex">
          This UI uses the bridge contracts directly, so all of the same security assumptions are
          present
        </li>
        <li>
          The only difference is that the final router contract on Ethereum has been swapped out
        </li>
        <li>
          This modified implementation allows the runner's actions to be measured and creates an
          economic incentive to deliver native tokens, maintaining privacy for the end user (you).
        </li>
        <li>
          If, for any reason, your transaction is not run in a timely manner, you can always use the
          escape hatch to complete the bridge yourself and pay zero fees
        </li>
      </ul>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
