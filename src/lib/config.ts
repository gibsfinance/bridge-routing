export const imageRoot: string = process.env.PUBLIC_IMAGE_ROOT || 'https://gib.show'

export const walletConnectProjectId: string = process.env.PUBLIC_WALLET_CONNECT_ID || ''

export const nodeEnv: string = process.env.PUBLIC_NODE_ENV || 'development'

export const version: string = process.env.PUBLIC_VERSION || `0.0.0_${new Date().toISOString()}`

export const indexer = ''

// console.log({
//   imageRoot,
//   walletConnectProjectId,
//   nodeEnv,
//   version,
// })
