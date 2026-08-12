import { describe, expect, it } from 'vitest'
import { listModules, totalTrackXp, TRACK } from '../src/lib/modules'

describe('modules track', () => {
  it('has an ordered Ship with AI tools path with enough depth', () => {
    const modules = listModules()
    expect(TRACK.id).toBe('ship-with-ai')
    expect(modules.length).toBeGreaterThanOrEqual(8)
    expect(modules.every((m) => m.quiz.length >= 3)).toBe(true)
    expect(modules.every((m) => m.skill && m.order > 0)).toBe(true)
    const orders = modules.map((m) => m.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
    expect(totalTrackXp()).toBeGreaterThan(300)
  })
})
