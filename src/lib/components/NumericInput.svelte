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
    decimals?: number | null
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
    decimals,
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
  const parsedValue = () => {
    try {
      return stripNonNumber(value)
    } catch {
      return null
    }
  }
  const updateValue = (val: string) => {
    value = val
    updateInvalidCharacters(val)
  }
  const updateInvalidCharacters = (val: string) => {
    const acceptableNonNumeric = val.split(',').join('').split('.').join('')
    invalidCharacters = acceptableNonNumeric !== acceptableNonNumeric.replace(/[^0-9.]/g, '')
  }
  let inputRef: HTMLInputElement | null = null
  let invalidCharacters = $state(false)
  let value = $state('')
  let focused = $state(false)
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
  $effect.pre(() => {
    if (_.isNil(decimals)) {
      return
    }
    if (startingValue === null) {
      return
    }
    const parsedVal = untrack(() => parsedValue())
    const before = parseUnits(parsedVal ?? '0', decimals)
    if (parsedVal === null || before === startingValue) {
      return
    }
    updateValue(formatUnits(startingValue, decimals))
  })
  const fontSize = $derived(
    fontSizeInput === undefined ? largeInputFontScaler(value?.length) : fontSizeInput,
  )
  const oninput: FormEventHandler<HTMLInputElement> = (e) => {
    if (_.isNil(decimals)) {
      return
    }
    const currentTextValue = (e.target as HTMLInputElement).value
    if (currentTextValue === '.') {
      updateValue('0.')
      return
    }
    let bestGuess = untrack(() => startingValue)
    try {
      const stripped = stripNonNumber(currentTextValue)
      bestGuess = parseUnits(stripped, decimals)
    } catch {
      return
    }
    // if the parsed value fails, then we use the previous value or the best guess
    updateValue(currentTextValue)
    const clamped = props.oninput?.({
      value: currentTextValue,
      int: bestGuess,
    })
    if (clamped !== undefined && clamped !== bestGuess) {
      updateValue(formatUnits(clamped, decimals))
    }
  }
  const onfocus: FormEventHandler<HTMLInputElement> = (e) => {
    focused = true
    props.onfocus?.(e)
  }
  const onblur: FormEventHandler<HTMLInputElement> = (e) => {
    focused = false
    updateValue(value)
    props.onblur?.(e)
  }
  const val = $derived(focused ? value : numberWithCommas(value))
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
  value={val}
  {oninput}
  {onblur}
  {onfocus} />
