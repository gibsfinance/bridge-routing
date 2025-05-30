import type { Currency } from '@pulsex/sdk'
import type { Pool, Route } from './types'

/**
 * Utility function to return each consecutive section of Pools or Pairs in a MixedRoute
 * @param route
 * @returns a nested array of Pools or Pairs in the order of the route
 */
export const partitionMixedRouteByProtocol = (
  route: Route,
): { pools: Pool[][]; output: Currency } => {
  const acc: Pool[][] = []
  const targetOutputCurrency = route.outputAmount.currency.wrapped

  let left = 0
  let right = 0
  while (right < route.pools.length) {
    if (route.pools[left].type !== route.pools[right].type) {
      acc.push(route.pools.slice(left, right))
      left = right
    }
    // seek forward with right pointer
    right++
    if (right === route.pools.length) {
      /// we reached the end, take the rest
      acc.push(route.pools.slice(left, right))
    }
  }
  return { pools: acc, output: targetOutputCurrency }
}
