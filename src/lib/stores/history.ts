import { derived, type Stores } from 'svelte/store'
import * as input from './input'
import { walletAccount } from './auth/store'
import { getAddress } from 'viem'
import { loading } from './loading'
import type { Query } from '$lib/gql/graphql'
import { gql, GraphQLClient } from 'graphql-request'
import { indexer } from '$lib/config'
import type { UserRequestForAffirmation, UserRequestForSignature } from '../gql/graphql'

export type Bridge = UserRequestForSignature | UserRequestForAffirmation

const client = new GraphQLClient(indexer)

const queries = {
  getBridgesUnderAccount: gql`
    query V($where: UserRequestForSignatureFilter) {
      userRequestForSignatures(where: $where) {
        items {
          from
          to
          bridge {
            bridgeId
            provider
            chainId
          }
          transaction {
            hash
            from
            to
            block {
              chainId
            }
          }
          messageId
          messageHash
          encodedData
          feeDirector {
            feeType
            unwrapped
            recipient
            multiplier
            limit
          }
          delivery {
            transaction {
              hash
              block {
                chainId
              }
            }
          }
        }
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
    loading.loadsAfterTick(
      `bridges-${account}`,
      () => {
        return client
          .request<Query>(queries.getBridgesUnderAccount, {
            where: {
              OR: [{ from: account }, { to: account }],
            },
          })
          .then((data) => {
            console.log(data.userRequestForSignatures.items)
            return data.userRequestForSignatures.items
          })
      },
      set,
    )
  },
  null,
)
