<script lang="ts">
  import Icon from '@iconify/svelte'
  import VersionedLink from './VersionedLink.svelte'
</script>

<div class="p-8">
  <h3 class="font-bold text-center items-center flex justify-center text-lg mb-2">
    <Icon icon="material-symbols:info-outline" height="3em" width="3em" />
  </h3>
  <div class="flex">
    <ul class="gap-4 flex flex-col">
      <li class="flex">
        This UI uses the bridge contracts directly, so all of the same security assumptions are present.
      </li>
      <li>The only difference is that the final router contract on Ethereum has been swapped out.</li>
      <li>
        This modified implementation allows the runner's actions to be measured and creates an economic incentive to
        deliver tokens, maintaining privacy for the end user (you).
      </li>
      <li>
        If, for any reason, your transaction is not run in a timely manner, you can always use
        <VersionedLink domain="bridge.pulsechain.com" path="/#/transactions" />
        to complete the bridge yourself and pay zero fees outside of the bridge fees.
      </li>
    </ul>
  </div>
</div>
