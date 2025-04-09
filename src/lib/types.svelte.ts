import { untrack } from 'svelte'
import type { Hex, Abi } from 'viem'

export type Call = {
  allowFailure?: boolean
  functionName: string
  target?: Hex
  abi?: Abi
  args?: (bigint | Hex | Hex[])[]
}

export type PerNetworkBridgeLink = {
  tokenAddress: Hex
}
export type Extensions = {
  wrapped?: { address: Hex }
  bridgeInfo?: Record<number, PerNetworkBridgeLink>
}

export type TokenMetadata = {
  name: string
  symbol: string
  decimals: number
}

export type Token = TokenMetadata & {
  address: string
  chainId: number
  logoURI?: string | undefined | null
  extensions?: Extensions
}

export type TokenOut = Omit<Token, 'address'> & { address: string | null }

export type TokenList = {
  tokens: Token[]
}

export class ProxyStore<T> {
  private val = $state(null as unknown as T)
  constructor(
    v: T,
    protected validation: (current: T, v: T) => T | undefined = (_, v) => v,
  ) {
    this.val = v
  }
  set value(v: T) {
    const validated = this.validation(
      untrack(() => this.value),
      v,
    )
    if (validated === undefined) return
    this.val = validated
  }
  get value() {
    return this.val
  }
}
export class NullableProxyStore<T> {
  private val = $state(null as unknown as T | null)
  constructor(
    v: T | null = null,
    protected validation: (current: T | null, v: T | null) => T | null | undefined = (_, v) => v,
  ) {
    this.val = v
  }
  set(v: T | null) {
    this.value = v
  }
  set value(v: T | null) {
    const validated = this.validation(this.value, v)
    if (validated === undefined) return
    this.val = validated
  }
  get value() {
    return this.val
  }
}

export type InputValue = { value: string; int: bigint | null }
