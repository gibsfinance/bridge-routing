// import { getContext } from 'svelte'
// import type { AppKitNetwork } from '@reown/appkit/networks'
// import type { ConnectedWalletInfo } from '@reown/appkit'
// import type { NullableProxy } from '$lib/types.svelte'
// import type { UseAppKitAccountReturn } from '@reown/appkit'

// export const CONTEXT_KEY = 'AUTH_CONTEXT'

// export interface AuthMethods {
//   connect: () => Promise<void>
//   disconnect: () => Promise<void>
//   switchNetwork: (chain: AppKitNetwork | null | undefined) => Promise<void>
//   walletInfoState: NullableProxy<ConnectedWalletInfo>
//   accountState: NullableProxy<UseAppKitAccountReturn>
// }

// export function useAuth() {
//   const context = getContext<AuthMethods>(CONTEXT_KEY)

//   if (!context) throw new Error("AuthProvider isn't valid!")

//   return context
// }
