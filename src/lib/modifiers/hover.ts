type Params = {
  enter?: () => void
  leave?: () => void
  over?: () => void
  out?: () => void
}
export function hover(element: HTMLElement, params: Params) {
  if (params.enter && params.leave) {
    const enterOnly = onlyTarget(params.enter!, element)
    const leaveOnly = onlyTarget(params.leave!, element)
    element.addEventListener('mouseenter', enterOnly)
    element.addEventListener('mouseleave', leaveOnly)
    return {
      destroy() {
        element.removeEventListener('mouseenter', enterOnly)
        element.removeEventListener('mouseleave', leaveOnly)
      },
    }
  } else if (params.over && params.out) {
    const overOnly = onlyTarget(params.over!, element)
    const outOnly = onlyTarget(params.out!, element)
    element.addEventListener('mouseover', overOnly)
    element.addEventListener('mouseout', outOnly)
    return {
      destroy() {
        element.removeEventListener('mouseover', overOnly)
        element.removeEventListener('mouseout', outOnly)
      },
    }
  } else {
    throw new Error('Invalid hover params')
  }
}

const onlyTarget = (fn: () => void, target: HTMLElement) => {
  return (event: MouseEvent) => {
    if (event.currentTarget === target) {
      fn()
    }
  }
}
