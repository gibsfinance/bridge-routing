type Params = {
  enter: () => void;
  leave: () => void;
}
export function hover(element: HTMLElement, params: Params) {
  element.addEventListener('mouseenter', params.enter)
  element.addEventListener('mouseleave', params.leave)
  return {
    destroy() {
      element.removeEventListener('mouseenter', params.enter)
      element.removeEventListener('mouseleave', params.leave)
    }
  }
}
