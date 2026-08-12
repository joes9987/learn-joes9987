/** Week 5 venture campaign tag on learning events. */
export const VENTURE_CAMPAIGN = 'p2-venture'

/** User ids / emails that must never count toward external qualified users. */
export function isExcludedFromQualified (userId: string): boolean {
  const id = userId.toLowerCase()
  if (id.includes('joes9987')) return true
  if (id.includes('test@') || id.startsWith('test-')) return true
  return false
}

export function withVentureMetadata (
  metadata?: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...(metadata ?? {}),
    campaign: VENTURE_CAMPAIGN
  }
}
