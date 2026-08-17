import { describe, expect, it } from 'vitest'
import { FIRST_PROJECT } from '../src/lib/first-project'
import { EXERCISE_XP, listModules } from '../src/lib/modules'
import { collectProgressFromEvents } from '../src/lib/progress'

describe('collectProgressFromEvents', () => {
  it('unlocks the project after two modules and awards exercise plus project XP', () => {
    const modules = listModules()
    const first = modules[0]
    const second = modules[1]
    const progress = collectProgressFromEvents([
      { event: 'lesson_completed', metadata: { moduleId: first.id, scorePct: 100 } },
      { event: 'exercise_completed', metadata: { moduleId: first.id } },
      { event: 'lesson_completed', metadata: { moduleId: second.id, scorePct: 66 } }
    ])

    expect(progress.completedModuleIds).toEqual([first.id, second.id])
    expect(progress.exerciseCompletedIds).toEqual([first.id])
    expect(progress.projectUnlocked).toBe(true)
    expect(progress.xpEarned).toBe(first.xp + second.xp + EXERCISE_XP)
    expect(progress.modules[0].exerciseCompleted).toBe(true)
    expect(progress.modules[1].bestScorePct).toBe(66)
  })

  it('completes the project when every step is recorded', () => {
    const progress = collectProgressFromEvents(
      FIRST_PROJECT.steps.map((step) => ({
        event: 'project_step_completed',
        metadata: { stepId: step.id }
      }))
    )
    expect(progress.projectCompleted).toBe(true)
    expect(progress.xpEarned).toBe(FIRST_PROJECT.xp)
    expect(progress.projectStepIds).toHaveLength(FIRST_PROJECT.steps.length)
  })
})
