/**
 * Asserts that a value is defined (not null, undefined, or falsy)
 * Throws a descriptive error if the value is falsy
 *
 * @param value - The value to check
 * @param context - Context description for the error message
 * @returns The value if defined
 * @throws Error if value is falsy
 */
export function ensureResult<T>(
  value: T | null | undefined | false | 0,
  context: string
): T {
  if (!value) {
    throw new Error(`${context}: Expected result but got ${value}`)
  }
  return value
}

/**
 * Type guard that asserts a value is defined
 * Similar to ensureResult but uses TypeScript's asserts syntax
 *
 * @param value - The value to check
 * @param message - Error message if assertion fails
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message)
  }
}
