<script lang="ts">
  import { numberWithCommas, stripNonNumber } from '$lib/stores/utils'
  import classNames from 'classnames'
  import type { ClassParam } from '$lib/types.svelte'
  import _ from 'lodash'
  import type { FormEventHandler } from 'svelte/elements'
  import { formatUnits, parseUnits } from 'viem'
  import { largeInputFontScaler } from '$lib/stores/font-scaler'
  // import { fitText } from '$lib/stores/fittext'

  type Props = {
    id?: string
    value?: bigint | null
    decimals?: number
    disabled?: boolean
    oninput?: (value: bigint) => void
    onblur?: FormEventHandler<HTMLInputElement>
    onfocus?: FormEventHandler<HTMLInputElement>
    class?: ClassParam
    paddingClass?: ClassParam
    placeholder?: string
    fit?: boolean
  }
  const {
    fit = false,
    id = _.uniqueId('numeric-input-'),
    value: startingValue = null,
    decimals = 18,
    placeholder = '0',
    disabled = false,
    class:
      className = 'w-full input ring-0 focus:ring-0 text-surface-contrast-50 text-right font-inter',
    paddingClass = 'py-0 px-0',
    ...props
  }: Props = $props()
  let focused = $state(false)
  let selectionEnd = $state<number | null>(null)
  const decimalValue = $derived(startingValue ? formatUnits(startingValue, decimals) : null)
  let value = $derived.by(() => {
    if (!decimalValue) return decimalValue
    if (selectionEnd === null) return numberWithCommas(decimalValue)
    return numberWithCommas(decimalValue)
  })
  const classes = $derived(classNames(className, paddingClass))
  const oninput: FormEventHandler<HTMLInputElement> = (e) => {
    const val = (e.target as HTMLInputElement).value
    let bestGuess = startingValue
    try {
      const stripped = stripNonNumber(val)
      bestGuess = parseUnits(stripped, decimals)
    } catch (err) {}
    // if the parsed value fails, then we use the previous value or the best guess
    selectionEnd = (e.target as HTMLInputElement).selectionEnd
    props.oninput?.(bestGuess ?? 0n)
  }
  let inputRef: HTMLInputElement | null = null
  const fontSize = $derived(largeInputFontScaler(value?.length))
  const onfocus: FormEventHandler<HTMLInputElement> = (e) => {
    focused = true
    props.onfocus?.(e)
  }
  const onblur: FormEventHandler<HTMLInputElement> = (e) => {
    focused = false
    props.onblur?.(e)
  }
</script>

<input
  type="text"
  bind:this={inputRef}
  style:font-size={`${fontSize}px`}
  {disabled}
  {id}
  {placeholder}
  class={classes}
  {value}
  {oninput}
  {onblur}
  {onfocus} />
