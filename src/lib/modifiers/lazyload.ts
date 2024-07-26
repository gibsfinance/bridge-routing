let observer: IntersectionObserver

function getObserver() {
  if (observer) {
    return
  }

  observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      entry.target.dispatchEvent(
        new CustomEvent('visible', {
          detail: entry.isIntersecting,
        }),
      )
      // if (entry.isIntersecting) {
      // }
    })
  })
}

export function lazyload(element: HTMLElement) {
  getObserver()

  observer.observe(element)

  return {
    destroy() {
      observer.unobserve(element)
    },
  }
}
