// The canonical FeeManager ABI lives in bridge-sdk so it can be shared
// across the indexer, tx-analyzer, and any future consumers.
// Re-export here so existing indexer imports don't need to change.
export { feeManager as FeeManagerAbi } from '@gibs/abis'
