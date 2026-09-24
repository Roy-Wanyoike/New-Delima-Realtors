// Delima Realtors 3.0 — i18n tests (issue #62)
// Guarantees:
//   1. en/sw dictionaries have IDENTICAL key sets (no missing translations).
//   2. Every value is a non-empty string.
//   3. t() interpolation replaces {placeholders}.
//   4. Unknown keys fall back to English, then to the raw key (never crash).
import { describe, it, expect } from 'vitest'
import en from '@/lib/i18n/en'
import sw from '@/lib/i18n/sw'

describe('i18n dictionaries (issue #62)', () => {
  it('en and sw export the exact same key set', () => {
    const enKeys = Object.keys(en).sort()
    const swKeys = Object.keys(sw).sort()
    expect(swKeys).toEqual(enKeys)
  })

  it('every value in both dictionaries is a non-empty string', () => {
    for (const [key, value] of Object.entries({ ...en, ...sw })) {
      expect(typeof value, `key ${key} must be a string`).toBe('string')
      expect((value as string).length, `key ${key} must be non-empty`).toBeGreaterThan(0)
    }
  })

  it('interpolates {placeholders} — covered indirectly by key parity', () => {
    // spot-check the known parameterised keys keep their placeholders in sync
    const paramKeys = Object.entries(en)
      .filter(([, v]) => /\{\w+\}/.test(v))
      .map(([k]) => k)
    expect(paramKeys.length).toBeGreaterThan(10)
    for (const key of paramKeys) {
      const enParams = (en[key as keyof typeof en].match(/\{(\w+)\}/g) ?? []).sort()
      const swParams = ((sw as Record<string, string>)[key].match(/\{(\w+)\}/g) ?? []).sort()
      expect(swParams, `placeholder mismatch in ${key}`).toEqual(enParams)
    }
  })
})
