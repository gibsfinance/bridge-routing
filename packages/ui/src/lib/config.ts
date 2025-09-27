export const imageRoot: string = process.env.PUBLIC_IMAGE_ROOT || 'https://gib.show'

export const projectId: string = process.env.VITE_PROJECT_ID || ''
console.log('projectId=%o', projectId)

export const nodeEnv: string = process.env.PUBLIC_NODE_ENV || 'development'

export const version: string =
  process.env.PUBLIC_VERSION || `0.0.0_abcd_${new Date().toISOString()}`

export const indexer = process.env.PUBLIC_INDEXER || 'https://staging.indexer.gibs.finance'
