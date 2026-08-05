import { NextResponse } from 'next/server'
import { ludwittConfig, signLaunchToken } from '@/lib/ludwitt'
import { createSession, encodeSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/session'

/** Local/demo launch when ALLOW_DEV_LAUNCH=true — not for production metrics. */
export async function POST () {
  const cfg = ludwittConfig()
  if (!cfg.allowDevLaunch) {
    return NextResponse.json({ error: 'Dev launch disabled' }, { status: 403 })
  }

  const appId = cfg.appId || 'dev-app'
  const session = createSession({
    userId: `dev-${Date.now()}`,
    email: 'dev@eudalearn.local',
    appId
  })

  // Optionally mint a token shape matching Ludwitt for local /launch tests.
  if (cfg.jwtSecret) {
    const token = signLaunchToken(
      { sub: session.userId, email: session.email, app_id: appId },
      cfg.jwtSecret
    )
    return NextResponse.json({
      ok: true,
      sessionId: session.sessionId,
      launchPath: `/launch?token=${token}`
    })
  }

  const res = NextResponse.json({ ok: true, sessionId: session.sessionId, path: '/learn' })
  res.cookies.set(SESSION_COOKIE, encodeSession(session), sessionCookieOptions())
  return res
}
