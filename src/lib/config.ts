import { env } from '$env/dynamic/public'

export const imageRoot = env.PUBLIC_IMAGE_ROOT || 'https://gib.show'

export const indexer = env.PUBLIC_INDEXER_URL || 'https://pulsechain-bridge-indexer.up.railway.app'
