import { derived, get, writable, type Writable } from "svelte/store"
import { page } from '$app/stores'
import * as viem from 'viem'
import { humanReadableNumber, isZero, stripNonNumber } from '$lib/stores/utils'
import { parseUnits, zeroAddress } from "viem";
import { Chains, type DestinationChains } from "./auth/types";
import { feeManagerMapping } from "./fee-manager";
import { destinationChains } from "./config";
import type { Token } from "$lib/types";

const limitStore = writable('0')

let decimals = 18

export const setLimitDecimals = (d: number) => {
  decimals = d
}

const humanReadableSet = (store: Writable<string>) => (v: string) => {
  if (!v) {
    if (get(store)) {
      store.set(v)
    }
    return
  }
  let val = stripNonNumber(v)
  if (isZero(val)) {
    // the input is a string of zeros
    store.set(val)
    return
  }
  val = humanReadableNumber(parseUnits(val, decimals), decimals)
  if (get(store) === val) {
    return
  }
  store.set(val)
}

export const limit: Writable<string> = {
  ...limitStore,
  set: humanReadableSet(limitStore),
}

const amountInStore = writable('')

export const amountIn: Writable<string> = {
  ...amountInStore,
  set: humanReadableSet(amountInStore),
}

const feeStore = writable('0')

export const fee: Writable<string> = {
  ...feeStore,
  set: humanReadableSet(feeStore),
}

export enum FeeType {
  PERCENT = '%',
  GAS_TIP = 'gas+%',
  FIXED = 'fixed',
}

type FeeTypeKeys = keyof typeof FeeType

const feeTypeValToKeyMap = new Map<FeeType, FeeTypeKeys>(
  (Object.keys(FeeType) as FeeTypeKeys[]).map((key) => (
    [FeeType[key], key]
  ))
)

const feeTypeStore = writable<FeeType>(FeeType.PERCENT)
/** whether to use a fixed or gas based fee */
export const feeType = {
  ...feeTypeStore,
  set: (v: FeeType) => {
    if (!feeTypeValToKeyMap.get(v)) {
      throw new Error('invalid fee type')
    }
    feeTypeStore.set(v)
  },
}

const recipientStore = writable<viem.Hex>(zeroAddress)

export const recipient = {
  ...recipientStore,
}

export const bridgeFrom = writable(feeManagerMapping)

export const bridgeKeys = Object.keys(destinationChains) as DestinationChains[]

export const bridgeKey = derived([page], ([$page]) => (Chains[$page.params.route as keyof typeof Chains] || Chains.ETH) as DestinationChains)

const unwrapStore = writable(true)

export const unwrap = {
  ...unwrapStore,
}

const desiredAssetIn = writable<Token | null>(null)

export const assetIn = {
  ...desiredAssetIn,
}
