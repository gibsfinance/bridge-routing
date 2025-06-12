// import { loading } from './loading.svelte'
// import { getAddress } from 'viem'
// import type { Query } from '../gql/graphql'
// import { gql, GraphQLClient } from 'graphql-request'
// import { indexer } from '../config'
// import type { UserRequestForAffirmation, UserRequestForSignature } from '../gql/graphql'
// import { sortBy } from 'lodash'
// import type { UseAppKitAccountReturn } from '@reown/appkit'

// export type Bridge = UserRequestForSignature | UserRequestForAffirmation

// const client = new GraphQLClient(indexer)

// const fragmentBridge = (addFeeDirector: boolean) => gql`{
//   originationChainId
//   destinationChainId
//   from
//   to
//   orderId
//   requiredSignatures {
//     value
//   }
//   token
//   handlingNative
//   deliveringNative
//   bridge {
//     id
//     provider
//     chainId
//   }
//   transaction {
//     hash
//     from
//     to
//     block {
//       chainId
//       timestamp
//     }
//   }
//   confirmedSignatures {
//     items {
//       transaction {
//         hash
//         block {
//           timestamp
//         }
//       }
//     }
//   }
//   messageHash
//   encodedData${
//     addFeeDirector
//       ? gql`
//     feeDirector {
//       feeType
//       unwrapped
//       recipient
//       multiplier
//       limit
//     }`
//       : ''
//   }
//   delivery {
//     transaction {
//       hash
//       from
//       block {
//         chainId
//         timestamp
//       }
//     }
//   }
// }`

// const queries = {
//   getBridgesUnderAccount: gql`
//     query V($whereSig: UserRequestForSignatureFilter, $whereAff: UserRequestForAffirmationFilter) {
//       userRequestForAffirmations(where: $whereAff, limit: 1000) {
//         items ${fragmentBridge(false)}
//       }
//       userRequestForSignatures(where: $whereSig, limit: 1000) {
//         items ${fragmentBridge(true)}
//       }
//     }
//   `,
// }

// export const bridges = loading.loadsAfterTick<Bridge[]>(
//   'bridges',
//   async (accountState: UseAppKitAccountReturn | null | undefined) => {
//     if (!accountState) {
//       return null
//     }
//     const walletAccount = accountState.address
//     if (!walletAccount) {
//       return null
//     }
//     const account = getAddress(walletAccount)
//     const filter = {
//       OR: [{ from: account }, { to: account }],
//     }
//     return client.request<Query>(queries.getBridgesUnderAccount, {
//       whereAff: filter,
//       whereSig: filter,
//     })
//   },
//   async (data: Query) => {
//     return sortBy(
//       ([] as Bridge[]).concat(
//         data.userRequestForSignatures.items,
//         data.userRequestForAffirmations.items,
//       ),
//       [(r) => -BigInt(r.orderId)],
//     )
//   },
// )

// // export const bridges = (accountState: UseAppKitAccountReturn | null | undefined) =>
// //   loading.loadsAfterTick(
// //     'bridges',
// //     async (accountState: UseAppKitAccountReturn | null | undefined, controller: AbortController) => {
// //       if (!accountState) {
// //       return null
// //     }
// //     const walletAccount = connectedAddress(accountState)
// //     if (!walletAccount) {
// //       return null
// //     }
// //     const account = getAddress(walletAccount)
// //     const filter = {
// //       OR: [{ from: account }, { to: account }],
// //     }
// //     return client
// //       .request<Query>(queries.getBridgesUnderAccount, {
// //         whereAff: filter,
// //         whereSig: filter,
// //       })
// //       .then((data) => {
// //         if (controller.signal.aborted) {
// //           return null
// //         }
// //         return sortBy(
// //           ([] as Bridge[]).concat(
// //             data.userRequestForSignatures.items,
// //             data.userRequestForAffirmations.items,
// //           ),
// //           [(r) => -BigInt(r.orderId)],
// //         )
// //       })
// //   },
// // )
