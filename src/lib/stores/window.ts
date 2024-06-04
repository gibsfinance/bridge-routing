import { get, readable } from "svelte/store"
import _ from 'lodash'

const w = readable({
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
}, (set) => {
  const getCurrent = () => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  })
  const updateIfDifferent = () => {
    const $w = get(w)
    const current = getCurrent()
    if (_.isEqual(current, $w)) {
      return
    }
    console.log(current)
    set(current)
  }
  const resizeHandler = () => updateIfDifferent()
  window.addEventListener('resize', resizeHandler)
  const unwind = () => {
    window.removeEventListener('resize', resizeHandler)
  }
  return unwind
})

export {
  w as windowStore
}
