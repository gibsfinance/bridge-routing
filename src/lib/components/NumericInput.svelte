<script lang="ts">
  import { untrack } from 'svelte'
  import { numberWithCommas, stripNonNumber } from '$lib/stores/utils'
  import classNames from 'classnames'
  import type { ClassParam, InputValue } from '$lib/types.svelte'
  import _ from 'lodash'
  import type { FormEventHandler } from 'svelte/elements'
  import { formatUnits, parseUnits } from 'viem'
  import { largeInputFontScaler } from '$lib/stores/font-scaler'

  type Props = {
    id?: string
    value?: bigint | null
    decimals?: number
    disabled?: boolean
    oninput?: (values: InputValue) => bigint | undefined | void
    onblur?: FormEventHandler<HTMLInputElement>
    onfocus?: FormEventHandler<HTMLInputElement>
    class?: ClassParam
    sizeClass?: ClassParam
    paddingClass?: ClassParam
    textClass?: ClassParam
    fontSizeClass?: ClassParam
    placeholder?: string
    validTextClass?: ClassParam
    invalidTextClass?: ClassParam
    fit?: boolean
    fontSizeInput?: string | number | null
    invalid?: boolean
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
    textClass = 'text-right font-inter',
    validTextClass = 'text-surface-contrast-50 placeholder:text-surface-contrast-50',
    invalidTextClass = 'text-red-500',
    fontSizeClass,
    invalid = false,
    ...props
  }: Props = $props()
  let invalidCharacters = $state(false)
  const classes = $derived(
    classNames(
      sizeClass,
      className,
      textClass,
      paddingClass,
      fontSizeClass,
      invalidCharacters || invalid ? invalidTextClass : validTextClass,
    ),
  )
  let inputRef: HTMLInputElement | null = null
  let value = $state('')
  const parsedValue = () => {
    try {
      return numberWithCommas(stripNonNumber(value))
    } catch {
      return null
    }
  }
  $effect.pre(() => {
    if (startingValue === null) {
      return
    }
    const parsedVal = untrack(() => parsedValue())
    const before = parseUnits(parsedVal ?? '0', decimals)
    if (parsedVal === null || before === startingValue) {
      return
    }
    value = numberWithCommas(formatUnits(startingValue, decimals))
  })
  const fontSize = $derived(
    fontSizeInput === undefined ? largeInputFontScaler(value?.length) : fontSizeInput,
  )
  const oninput: FormEventHandler<HTMLInputElement> = (e) => {
    const currentTextValue = (e.target as HTMLInputElement).value
    let bestGuess = untrack(() => startingValue)
    let failed = false
    const acceptableNonNumeric = currentTextValue.split(',').join('').split('.').join('')
    invalidCharacters = acceptableNonNumeric !== acceptableNonNumeric.replace(/[^0-9.]/g, '')
    try {
      const stripped = stripNonNumber(currentTextValue)
      bestGuess = parseUnits(stripped, decimals)
    } catch {
      failed = true
      return
    }
    // if the parsed value fails, then we use the previous value or the best guess
    // console.log(bestGuess, currentTextValue)
    value = currentTextValue
    const clamped = props.oninput?.({
      value: currentTextValue,
      int: bestGuess,
    })
    if (clamped !== undefined && clamped !== bestGuess) {
      const before = value
      value = numberWithCommas(formatUnits(clamped, decimals))
      console.log(before, startingValue, value)
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
