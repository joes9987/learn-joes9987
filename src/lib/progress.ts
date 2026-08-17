import { FIRST_PROJECT, projectUnlocked } from '@/lib/first-project'
import { EXERCISE_XP, listModules, totalTrackXp, type LearnModule } from '@/lib/modules'
import { createClient } from '@supabase/supabase-js'

function admin () {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function storeAppIds (): string[] {
  return [
    process.env.LUDWITT_CLIENT_ID,
    process.env.NEXT_PUBLIC_LUDWITT_CLIENT_ID,
    process.env.LUDWITT_APP_ID
  ].filter(Boolean) as string[]
}

export type ProgressEvent = {
  event: string
  metadata?: Record<string, unknown> | null
}

export type ModuleProgress = {
  module: LearnModule
  completed: boolean
  exerciseCompleted: boolean
  bestScorePct: number | null
}

export type LearnerProgress = {
  completedModuleIds: string[]
  exerciseCompletedIds: string[]
  projectStepIds: string[]
  projectCompleted: boolean
  projectUnlocked: boolean
  xpEarned: number
  xpTotal: number
  modules: ModuleProgress[]
  percentComplete: number
}

export function collectProgressFromEvents (
  events: ProgressEvent[],
  modules = listModules()
): LearnerProgress {
  const xpTotal = totalTrackXp(modules) + FIRST_PROJECT.xp
  const bestByModule = new Map<string, number>()
  const exerciseIds = new Set<string>()
  const projectStepIds = new Set<string>()
  let projectCompleted = false

  for (const row of events) {
    const meta = (row.metadata ?? {}) as {
      moduleId?: string
      scorePct?: number
      stepId?: string
    }
    if (row.event === 'lesson_completed') {
      const moduleId = typeof meta.moduleId === 'string' ? meta.moduleId : null
      if (!moduleId) continue
      const score = typeof meta.scorePct === 'number' ? meta.scorePct : 0
      const prev = bestByModule.get(moduleId)
      if (prev === undefined || score > prev) bestByModule.set(moduleId, score)
    }
    if (row.event === 'exercise_completed' && typeof meta.moduleId === 'string') {
      exerciseIds.add(meta.moduleId)
    }
    if (row.event === 'project_step_completed' && typeof meta.stepId === 'string') {
      projectStepIds.add(meta.stepId)
    }
    if (row.event === 'project_completed') projectCompleted = true
  }

  const completedModuleIds = [...bestByModule.keys()].filter((id) =>
    modules.some((m) => m.id === id)
  )
  const exerciseCompletedIds = [...exerciseIds].filter((id) =>
    modules.some((m) => m.id === id && m.exercise)
  )
  const knownSteps = new Set(FIRST_PROJECT.steps.map((step) => step.id))
  const validProjectSteps = [...projectStepIds].filter((id) => knownSteps.has(id))
  if (validProjectSteps.length >= FIRST_PROJECT.steps.length) projectCompleted = true

  const moduleXp = modules
    .filter((m) => completedModuleIds.includes(m.id))
    .reduce((sum, m) => sum + m.xp, 0)
  const exerciseXp = modules
    .filter((m) => m.exercise && exerciseCompletedIds.includes(m.id))
    .reduce((sum) => sum + EXERCISE_XP, 0)
  const projectXp = projectCompleted ? FIRST_PROJECT.xp : 0
  const xpEarned = moduleXp + exerciseXp + projectXp

  return {
    completedModuleIds,
    exerciseCompletedIds,
    projectStepIds: validProjectSteps,
    projectCompleted,
    projectUnlocked: projectUnlocked(completedModuleIds.length),
    xpEarned,
    xpTotal,
    percentComplete: xpTotal === 0 ? 0 : Math.round((xpEarned / xpTotal) * 100),
    modules: modules.map((module) => ({
      module,
      completed: completedModuleIds.includes(module.id),
      exerciseCompleted: exerciseCompletedIds.includes(module.id),
      bestScorePct: bestByModule.get(module.id) ?? null
    }))
  }
}

export async function getLearnerProgress (userId: string): Promise<LearnerProgress> {
  const empty = collectProgressFromEvents([])
  const sb = admin()
  const ids = storeAppIds()
  if (!sb || ids.length === 0) return empty

  const { data, error } = await sb
    .from('eudalearn_events')
    .select('event, metadata')
    .eq('user_id', userId)
    .in('app_id', ids)
    .in('event', [
      'lesson_completed',
      'exercise_completed',
      'project_step_completed',
      'project_completed'
    ])

  if (error || !data) return empty
  return collectProgressFromEvents(data as ProgressEvent[])
}
