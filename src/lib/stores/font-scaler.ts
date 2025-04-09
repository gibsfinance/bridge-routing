export type FontScalerOptions = {
  minFontSize: number
  maxFontSize: number
  freeCharacters: number
  scale: number
}
export const createFontScaler =
  ({ minFontSize, maxFontSize, freeCharacters, scale }: FontScalerOptions) =>
  (length: number | undefined | null) => {
    const len = Number(length ?? 0)
    return Math.max(minFontSize, maxFontSize - Math.max(0, len - freeCharacters) / scale)
  }

export const largeInputSettings = {
  maxFontSize: 36,
  minFontSize: 18,
  freeCharacters: 4,
  scale: 1.3,
}
export const largeInputFontScaler = createFontScaler(largeInputSettings)
