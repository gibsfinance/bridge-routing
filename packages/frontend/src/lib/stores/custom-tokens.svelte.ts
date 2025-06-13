import type { Token } from '@gibs/bridge-sdk/types'

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
