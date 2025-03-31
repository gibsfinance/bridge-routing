import type { Currency } from '@pulsex/sdk'

import { type Pool, PoolType, type StablePool } from './types'
import { involvesCurrency, getOutputCurrency } from './pool'

/**
 * Simple utility function to get the output of an array of Pools or Pairs
 * @param pools
 * @param firstInputToken
 * @param output token to determine correct output of the 3pool
 * @param lastSectionInRoute
 * @returns the output token of the last pool in the array
 */
export const getOutputOfPools = (
  pools: Pool[],
  firstInputToken: Currency,
  output: Currency,
  lastSectionInRoute: boolean,
): Currency => {
  if (pools.every((p) => p.type === PoolType.STABLE)) {
    let out = firstInputToken
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i] as StablePool
      const isLastPool = i === pools.length - 1

      let chosenOutput: Currency
      if (isLastPool && lastSectionInRoute) {
        chosenOutput = output
      } else {
        chosenOutput = getOutputCurrency(pool, out)
      }

      if (!involvesCurrency(pool, chosenOutput)) {
        throw new Error('PATH')
      }

      out = chosenOutput
    }
    return out
  } else {
    const { inputToken: outputToken } = pools.reduce(
      ({ inputToken }, pool: Pool): { inputToken: Currency } => {
        if (!involvesCurrency(pool, inputToken)) throw new Error('PATH')
        const output = getOutputCurrency(pool, inputToken)
        return {
          inputToken: output,
        }
      },
      { inputToken: firstInputToken },
    )
    return outputToken
  }
}
