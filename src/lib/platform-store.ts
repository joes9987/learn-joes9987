import { createClient } from '@supabase/supabase-js'
import { isExcludedFromQualified, VENTURE_CAMPAIGN } from '@/lib/venture'

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

type EventRow = {
  user_id: string
  event: string
  session_id: string
  metadata?: Record<string, unknown> | null
}

function tally (rows: EventRow[]) {
  const external = rows.filter((r) => !isExcludedFromQualified(r.user_id))
  const qualified = external.filter((r) => r.event !== 'session_heartbeat')
  const ventureQualified = qualified.filter(
    (r) => (r.metadata as { campaign?: string } | null)?.campaign === VENTURE_CAMPAIGN
  )
  return {
    unique_users: new Set(external.map((r) => r.user_id)).size,
    qualified_users: new Set(qualified.map((r) => r.user_id)).size,
    qualified_sessions: new Set(qualified.map((r) => `${r.user_id}:${r.session_id}`)).size,
    venture_qualified_users: new Set(ventureQualified.map((r) => r.user_id)).size,
    events: external.length
  }
}

export async function metricsForApp (appId: string | string[]) {
  const sb = admin()
  if (!sb) return null
  const ids = (Array.isArray(appId) ? appId : [appId]).filter(Boolean)
  if (ids.length === 0) return null
  const { data, error } = await sb
    .from('eudalearn_events')
    .select('user_id, event, session_id, metadata')
    .in('app_id', ids)
  if (error) return null
  const rows = (data ?? []) as EventRow[]
  const t = tally(rows)
  return {
    app_id: ids[0],
    app_ids: ids,
    unique_users: t.unique_users,
    qualified_users: t.qualified_users,
    qualified_sessions: t.qualified_sessions,
    venture_qualified_users: t.venture_qualified_users,
    venture_campaign: VENTURE_CAMPAIGN,
    events: t.events,
    snapshot_at: new Date().toISOString()
  }
}
