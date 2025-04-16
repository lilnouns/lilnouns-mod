/**
 * Utility functions for testing purposes.
 */

/**
 * The `replacer` method is used to replace BigInt values with their corresponding Number values.
 * @param key - The key of the property being processed.
 * @param value - The value of the property being processed.
 * @returns - The replacement value for the property. If it is a BigInt, then it is converted to a Number.
 */
export function replacer(key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return Number(value)
  }
  return value
}
