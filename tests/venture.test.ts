import { describe, expect, it } from 'vitest'
import { isExcludedFromQualified, withVentureMetadata, VENTURE_CAMPAIGN } from '../src/lib/venture'

describe('venture helpers', () => {
  it('tags campaign metadata', () => {
    expect(withVentureMetadata({ moduleId: 'x' })).toEqual({
      moduleId: 'x',
      campaign: VENTURE_CAMPAIGN
    })
  })

  it('excludes own handle from qualified counts', () => {
    expect(isExcludedFromQualified('user-joes9987')).toBe(true)
    expect(isExcludedFromQualified('abc-external-sub')).toBe(false)
  })
})
