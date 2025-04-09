type Settings = {
  minFontSize?: number
  maxFontSize?: number
  compressor?: number
}

export const fitText = (
  el: HTMLElement,
  { minFontSize = -1 / 0, maxFontSize = 1 / 0, compressor = 1 }: Settings,
) => {
  return () => {
    const clientWidth = el.clientWidth
    const fontSize = Math.max(Math.min(clientWidth / (compressor * 10), maxFontSize), minFontSize)
    el.style.fontSize = fontSize + 'px'
  }
}
