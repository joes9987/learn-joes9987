import { describe, expect, it } from 'vitest'
import { DEMO_LIVE_EVENTS, DEMO_STOPS, demoFixtureProgress, demoPostsLiveEvents } from '../src/lib/demo'

describe('investor demo helpers', () => {
  it('does not schedule live learning events', () => {
    expect(DEMO_LIVE_EVENTS).toEqual([])
    expect(demoPostsLiveEvents()).toBe(false)
  })

  it('exposes shareable stop ids for hash links', () => {
    expect(DEMO_STOPS.map((stop) => stop.id)).toEqual([
      'wedge',
      'access',
      'practice',
      'project',
      'progress',
      'suite'
    ])
  })

  it('fixture XP is below the full path total', () => {
    const fixture = demoFixtureProgress()
    expect(fixture.modulesCompleted).toBe(2)
    expect(fixture.xpEarned).toBeGreaterThan(0)
    expect(fixture.xpEarned).toBeLessThan(fixture.xpTotal)
  })
})
