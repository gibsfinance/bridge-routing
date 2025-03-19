<script lang="ts">
  import { untrack } from 'svelte'
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
    oninput?: (value: bigint) => bigint | undefined | void
    onblur?: FormEventHandler<HTMLInputElement>
    onfocus?: FormEventHandler<HTMLInputElement>
    class?: ClassParam
    sizeClass?: ClassParam
    paddingClass?: ClassParam
    textClass?: ClassParam
    fontSizeClass?: ClassParam
    placeholder?: string
    fit?: boolean
    fontSizeInput?: string | number | null
  }
  const {
    // fit = false,
    id = _.uniqueId('numeric-input-'),
    value: startingValue = null,
    decimals = 18,
    fontSizeInput,
    placeholder = '0',
    disabled = false,
    class: className = 'input ring-0 focus:ring-0',
    sizeClass = 'w-full',
    paddingClass = 'py-0 px-0',
    textClass = 'text-right font-inter text-surface-contrast-50 placeholder:text-surface-contrast-50',
    fontSizeClass,
    ...props
  }: Props = $props()
  // let focused = $state(false)

  // let selectionEnd = $state<number | null>(null)
  const decimalValue = $derived(
    startingValue !== null ? formatUnits(startingValue, decimals) : null,
  )
  const value = $derived.by(() => {
    if (!decimalValue) return decimalValue
    return numberWithCommas(decimalValue)
  })
  const classes = $derived(classNames(sizeClass, className, textClass, paddingClass, fontSizeClass))
  let inputRef: HTMLInputElement | null = null
  const fontSize = $derived(
    fontSizeInput === undefined ? largeInputFontScaler(value?.length) : fontSizeInput,
  )
  const oninput: FormEventHandler<HTMLInputElement> = (e) => {
    const currentTextValue = (e.target as HTMLInputElement).value
    let bestGuess = untrack(() => startingValue)
    let failed = false
    try {
      const stripped = stripNonNumber(currentTextValue)
      bestGuess = parseUnits(stripped, decimals)
    } catch {
      console.log('failed to parse', currentTextValue)
      failed = true
    }
    // if the parsed value fails, then we use the previous value or the best guess
    // selectionEnd = (e.target as HTMLInputElement).selectionEnd
    const clamped = props.oninput?.(bestGuess ?? 0n)
    if (clamped !== undefined && inputRef && clamped !== bestGuess && !failed) {
      // startingValue = clamped
      inputRef.value = numberWithCommas(formatUnits(clamped, decimals))
    }
  }
  const onfocus: FormEventHandler<HTMLInputElement> = (e) => {
    // focused = true
    props.onfocus?.(e)
  }
  const onblur: FormEventHandler<HTMLInputElement> = (e) => {
    // focused = false
    props.onblur?.(e)
  }
  // $inspect(value, value.length)
</script>

<input
  type="text"
  size={1}
  bind:this={inputRef}
  style:font-size={typeof fontSize === 'string' ? fontSize : `${fontSize}px`}
  {disabled}
  {id}
  {placeholder}
  class={classes}
  {value}
  {oninput}
  {onblur}
  {onfocus} />
