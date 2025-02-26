let observer: IntersectionObserver

type visibilityHandler = (visible: boolean) => void

const elToHandler = new WeakMap<Element, visibilityHandler>()

function getObserver() {
  if (observer) {
    return observer
  }

  observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      elToHandler.get(entry.target)?.(entry.isIntersecting)
    })
  })
  return observer
}

export const observe = (element: Element, handler: visibilityHandler) => {
  getObserver().observe(element)
  elToHandler.set(element, handler)
}

export const unobserve = (element: Element) => {
  getObserver().unobserve(element)
  elToHandler.delete(element)
}
