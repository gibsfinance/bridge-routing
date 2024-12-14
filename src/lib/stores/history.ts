import { derived, type Stores } from 'svelte/store'
import * as input from './input'
import { walletAccount } from './auth/store'
import { getAddress } from 'viem'
import { loading } from './loading'
import type { Query } from '$lib/gql/graphql'
import { gql, GraphQLClient } from 'graphql-request'
import { indexer } from '$lib/config'
import type { UserRequestForAffirmation, UserRequestForSignature } from '../gql/graphql'
import { sortBy } from 'lodash'

export type Bridge = UserRequestForSignature | UserRequestForAffirmation

const client = new GraphQLClient(indexer)

const fragmentBridge = (addFeeDirector: boolean) => gql`{
  originationChainId
  destinationChainId
  from
  to
  orderId
  requiredSignature {
    value
  }
  bridge {
    id
    provider
    chainId
  }
  transaction {
    hash
    from
    to
    block {
      chainId
      timestamp
    }
  }
  signatures {
    items {
      transaction {
        hash
        block {
          timestamp
        }
      }
    }
  }
  id
  messageHash
  encodedData${
    addFeeDirector
      ? gql`
  feeDirector {
    feeType
    unwrapped
    recipient
    multiplier
    limit
  }`
      : ''
  }
  delivery {
    transaction {
      hash
      from
      block {
        chainId
        timestamp
      }
    }
  }
}`

const queries = {
  getBridgesUnderAccount: gql`
    query V($whereSig: UserRequestForSignatureFilter, $whereAff: UserRequestForAffirmationFilter) {
      userRequestForAffirmations(where: $whereAff, limit: 1000) {
        items ${fragmentBridge(false)}
      }
      userRequestForSignatures(where: $whereSig, limit: 1000) {
        items ${fragmentBridge(true)}
      }
    }
  `,
}

export const bridges = derived<Stores, null | Bridge[]>(
  [walletAccount, input.forcedRefresh],
  ([$walletAccount], set) => {
    if (!$walletAccount) {
      return set(null)
    }
    const account = getAddress($walletAccount)
    const filter = {
      OR: [{ from: account }, { to: account }],
    }
    loading.loadsAfterTick(
      `bridges-${account}`,
      async () => {
        return client
          .request<Query>(queries.getBridgesUnderAccount, {
            whereAff: filter,
            whereSig: filter,
          })
          .then((data) => {
            return sortBy(
              ([] as Bridge[]).concat(
                data.userRequestForSignatures.items,
                data.userRequestForAffirmations.items,
              ),
              [(r) => -BigInt(r.orderId)],
            )
          })
      },
      set,
    )
  },
  null,
)
