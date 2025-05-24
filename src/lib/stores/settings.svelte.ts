export const guide = {
  CLOSED: null,
  SHOW: 'show',
} as const

export type Guide = typeof guide[keyof typeof guide]

export const onramps = {
  CLOSED: null,
  SHOW: 'show',
} as const

export type Onramps = typeof onramps[keyof typeof onramps]

export const stage = {
  ONBOARD: null,
  SWAP: 'swap',
} as const

export type Stage = typeof stage[keyof typeof stage]

export const mode = {
  DEFAULT: null,
  EMBED: 'embed',
  SIMPLE: 'simple',
} as const

export type Mode = typeof mode[keyof typeof mode]

export const settings = {
  CLOSED: null,
  DISABLED: 'disabled',
  OPEN: 'open',
  MODE: 'mode',
  ONRAMPS: 'onramps',
  GUIDE: 'guide',
  STAGE: 'stage',
  BRIDGE_TOKEN_IN: 'bridgeTokenIn',
  PULSEX_TOKEN_OUT: 'pulsexTokenOut',
} as const

export type Settings = typeof settings[keyof typeof settings]

export const details = {
  CLOSED: null,
  SHOW: 'show',
} as const

export type Details = typeof details[keyof typeof details]
