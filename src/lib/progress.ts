import { listModules, totalTrackXp, type LearnModule } from '@/lib/modules'
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

export type ModuleProgress = {
  module: LearnModule
  completed: boolean
  bestScorePct: number | null
}

export type LearnerProgress = {
  completedModuleIds: string[]
  xpEarned: number
  xpTotal: number
  modules: ModuleProgress[]
  percentComplete: number
}

export async function getLearnerProgress (userId: string): Promise<LearnerProgress> {
  const modules = listModules()
  const xpTotal = totalTrackXp(modules)
  const empty: LearnerProgress = {
    completedModuleIds: [],
    xpEarned: 0,
    xpTotal,
    modules: modules.map((module) => ({ module, completed: false, bestScorePct: null })),
    percentComplete: 0
  }

  const sb = admin()
  const ids = storeAppIds()
  if (!sb || ids.length === 0) return empty

  const { data, error } = await sb
    .from('eudalearn_events')
    .select('event, metadata')
    .eq('user_id', userId)
    .in('app_id', ids)
    .eq('event', 'lesson_completed')

  if (error || !data) return empty

  const bestByModule = new Map<string, number>()
  for (const row of data) {
    const meta = (row.metadata ?? {}) as { moduleId?: string; scorePct?: number }
    const moduleId = typeof meta.moduleId === 'string' ? meta.moduleId : null
    if (!moduleId) continue
    const score = typeof meta.scorePct === 'number' ? meta.scorePct : 0
    const prev = bestByModule.get(moduleId)
    if (prev === undefined || score > prev) bestByModule.set(moduleId, score)
  }

  const completedModuleIds = [...bestByModule.keys()].filter((id) =>
    modules.some((m) => m.id === id)
  )
  const xpEarned = modules
    .filter((m) => completedModuleIds.includes(m.id))
    .reduce((sum, m) => sum + m.xp, 0)

  return {
    completedModuleIds,
    xpEarned,
    xpTotal,
    percentComplete: xpTotal === 0 ? 0 : Math.round((xpEarned / xpTotal) * 100),
    modules: modules.map((module) => ({
      module,
      completed: completedModuleIds.includes(module.id),
      bestScorePct: bestByModule.get(module.id) ?? null
    }))
  }
}
