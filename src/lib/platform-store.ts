import { createClient } from '@supabase/supabase-js'

function admin () {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function recordPlatformEvent (input: {
  app_id: string
  event: string
  user_id: string
  session_id: string
  metadata?: Record<string, unknown>
}) {
  const sb = admin()
  if (!sb) return { ok: false as const, error: 'Platform store not configured' }
  const { error } = await sb.from('eudalearn_events').insert({
    app_id: input.app_id,
    event: input.event,
    user_id: input.user_id,
    session_id: input.session_id,
    metadata: input.metadata ?? {}
  })
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}

export async function metricsForApp (appId: string) {
  const sb = admin()
  if (!sb) return null
  const { data, error } = await sb
    .from('eudalearn_events')
    .select('user_id, event, session_id')
    .eq('app_id', appId)
  if (error) return null
  const rows = data ?? []
  const users = new Set(rows.map((r) => r.user_id))
  const qualifiedUsers = new Set(
    rows.filter((r) => r.event !== 'session_heartbeat').map((r) => r.user_id)
  )
  const qualifiedSessions = new Set(
    rows
      .filter((r) => r.event !== 'session_heartbeat')
      .map((r) => `${r.user_id}:${r.session_id}`)
  )
  return {
    app_id: appId,
    unique_users: users.size,
    qualified_users: qualifiedUsers.size,
    qualified_sessions: qualifiedSessions.size,
    events: rows.length,
    snapshot_at: new Date().toISOString()
  }
}
