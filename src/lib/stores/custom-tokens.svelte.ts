import type { Token } from '$lib/types.svelte'

let temporaryTokens: Token[] = []
// load a test
try {
  const tokensSerialized = localStorage.getItem('tokens')
  if (tokensSerialized) {
    temporaryTokens = JSON.parse(tokensSerialized)
  }
} catch (err) {
  console.error(err)
}

let tokensData = $state(temporaryTokens)
export const tokens = {
  get value() {
    return tokensData
  },
  set value(v: Token[]) {
    tokensData = v
    updateLocalStorage(v)
  },
}

const updateLocalStorage = (list: Token[]) => {
  try {
    localStorage.setItem('tokens', JSON.stringify(list))
  } catch (err) {
    console.error(err)
  }
}

// export const tokens: Writable<Token[]> = {
//   ...tokensStore,
//   set: (tkns) => {
//     updateLocalStorage(tkns)
//     tokensStore.set(tkns)
//   },
//   update: (fn) => {
//     const res = fn(get(tokensStore))
//     updateLocalStorage(res)
//     tokensStore.set(res)
//   },
// }
