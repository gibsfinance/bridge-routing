<script lang="ts">
  import Button from './Button.svelte'

  interface Props {
    isOpen: boolean
    fromNetworkName?: string
    toNetworkName?: string
    onClose: () => void
    onConfirm: () => void
  }

  const { isOpen, fromNetworkName, toNetworkName, onClose, onConfirm }: Props = $props()
</script>

<!-- Bridge Confirmation Modal -->
{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-surface-200 dark:border-surface-700">
      <div class="space-y-4">
        <!-- Header -->
        <div class="text-center">
          <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-50">
            ⚠️ Bridge Confirmation
          </h3>
        </div>

        <!-- Warning Message -->
        <div class="space-y-3 text-surface-700 dark:text-surface-300">
          <p class="text-sm">
            <strong>Important:</strong> You are about to initiate a bridge transaction that may require you to manually deliver your tokens to complete the transfer.
          </p>

          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
            <p class="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>What this means:</strong>
            </p>
            <ul class="text-xs mt-2 space-y-1 text-yellow-700 dark:text-yellow-300 ml-4 list-disc">
              <li>Your tokens will be locked on the source chain</li>
              <li>You may need to manually trigger delivery on the destination chain</li>
              <li>Gas fees may be required on the destination chain to complete delivery</li>
            </ul>
          </div>

          {#if fromNetworkName && toNetworkName}
            <p class="text-xs text-surface-600 dark:text-surface-400">
              Bridging from <strong>{fromNetworkName}</strong> to <strong>{toNetworkName}</strong>
            </p>
          {/if}
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-2">
          <Button
            class="flex-1 bg-surface-200 dark:bg-surface-700 text-surface-800 dark:text-surface-200 py-3 rounded-lg hover:bg-surface-300 dark:hover:bg-surface-600"
            onclick={onClose}>
            Cancel
          </Button>
          <Button
            class="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700"
            onclick={onConfirm}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}
