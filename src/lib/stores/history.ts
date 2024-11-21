import { derived, type Stores } from 'svelte/store'
import * as input from './input'
import { walletAccount } from './auth/store'
import { getAddress } from 'viem'
import { loading } from './loading'
import type { Query } from '$lib/gql/graphql'
import { gql, GraphQLClient} from 'graphql-request'
import { indexer } from '$lib/config'

type Bridge = {}

const client = new GraphQLClient(indexer)

const queries = {
  getBridgesUnderAccount: gql`
  query GetBridges($account: String!) {
    bridges(account: $account) {}
  }`,
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
        return client.request<Query>(queries.getBridgesUnderAccount, {
          account,
        }).then((data) => data.bridges)
      },
      set,
    )
  },
  null,
)
