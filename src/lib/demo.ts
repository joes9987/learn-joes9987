import { FIRST_PROJECT } from '@/lib/first-project'
import { EXERCISE_XP, listModules, totalTrackXp } from '@/lib/modules'

/** Walkthrough never posts these. Kept empty so tests can lock the contract. */
export const DEMO_LIVE_EVENTS: readonly string[] = []

export const DEMO_COACH_TIP =
  'Name the route and the success check — agents guess when the brief is only vibes.'

export const DEMO_STOPS = [
  { id: 'wedge', title: 'The wedge' },
  { id: 'access', title: 'Keyboard and screen readers' },
  { id: 'practice', title: 'Practice loop' },
  { id: 'project', title: 'First project' },
  { id: 'progress', title: 'XP and proof' },
  { id: 'suite', title: 'Suite and listing' }
] as const

export type DemoStopId = (typeof DEMO_STOPS)[number]['id']

export function demoFixtureProgress () {
  const modules = listModules()
  const first = modules[0]
  const second = modules[1]
  const earned = (first?.xp ?? 0) + (second?.xp ?? 0) + EXERCISE_XP
  const total = totalTrackXp(modules) + FIRST_PROJECT.xp
  return {
    modulesCompleted: 2,
    exercisesCompleted: 1,
    projectSteps: 0,
    projectTotal: FIRST_PROJECT.steps.length,
    xpEarned: earned,
    xpTotal: total,
    percent: total === 0 ? 0 : Math.round((earned / total) * 100)
  }
}

export function demoPostsLiveEvents (): boolean {
  return DEMO_LIVE_EVENTS.length > 0
}
