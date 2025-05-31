import { describe, expect, it } from 'vitest'
import { replacer } from '@/utilities/test-utils'

describe('replacer', () => {
  it('should convert BigInt to Number', () => {
    const result = replacer('testKey', BigInt(123))
    expect(result).toBe(123)
    expect(typeof result).toBe('number')
  })

  it('should return other values unchanged', () => {
    expect(replacer('testKey', 'string value')).toBe('string value')
    expect(replacer('testKey', 42)).toBe(42)
    expect(replacer('testKey', true)).toBe(true)
    expect(replacer('testKey', null)).toBe(null)

    const obj = { a: 1, b: 2 }
    expect(replacer('testKey', obj)).toBe(obj)
  })
})
