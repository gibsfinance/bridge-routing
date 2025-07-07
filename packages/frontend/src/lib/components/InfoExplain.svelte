<script lang="ts">
  import Icon from '@iconify/svelte'
  import VersionedLink from './VersionedLink.svelte'
</script>

<div class="py-8 h-full flex flex-col gap-6">
  <h3 class="font-bold text-center items-center flex justify-center text-lg">
    <Icon icon="material-symbols:info-outline" height="3em" width="3em" />
  </h3>
  <div class="flex h-full flex-grow overflow-y-auto px-8">
    <ul class="gap-4 flex flex-col">
      <li class="flex">
        This UI uses the bridge contracts directly, so all of the same security assumptions are
        present.
      </li>
      <li
        >The only difference is that the final router contract on Ethereum has been swapped out.</li>
      <li>
        This modified implementation allows the runner's actions to be measured and creates an
        economic incentive to deliver tokens, maintaining privacy for the end user (you) by not
        requiring you to fund new bridges to networks where you do not have gas.
      </li>
      <li
        >This does not mean that the transaction is untraceable. The destination address is written
        on the originating blockchain. It only means that you are not required to fund on the
        destination network from another address that has gas.</li>
      <li>
        If, for any reason, your transaction is not run in a timely manner, you can always use
        <VersionedLink domain="bridge.pulsechain.com" path="/#/transactions" />
        to complete the bridge yourself and pay zero fees outside of the bridge fees.
      </li>
    </ul>
  </div>
</div>
