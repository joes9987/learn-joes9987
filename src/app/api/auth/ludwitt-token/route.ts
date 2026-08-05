import { NextResponse } from 'next/server'
import {
  encodeTokenBundle,
  fetchUserInfo,
  LUDWITT_TOKEN_COOKIE,
  oauthConfig,
  oauthCookieOptions
} from '@/lib/ludwitt-oauth'
import {
  createSession,
  encodeSession,
  SESSION_COOKIE,
  sessionCookieOptions
} from '@/lib/session'

export const dynamic = 'force-dynamic'

/**
 * Establish a session from a Ludwitt access token (Creator "Mint test token"
 * or a future OAuth access_token). Used while Ludwitt's /oauth/authorize
 * returns invalid_client for Creator-registered apps.
 */
export async function POST (request: Request) {
  let body: { access_token?: string; refresh_token?: string; expires_in?: number } = {}
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const accessToken =
    typeof body.access_token === 'string' ? body.access_token.trim() : ''
  if (!accessToken.startsWith('lt_')) {
    return NextResponse.json(
      { error: 'access_token required (Creator Mint test token starts with lt_)' },
      { status: 400 }
    )
  }

  const userinfo = await fetchUserInfo(accessToken)
  if (!userinfo.ok) {
    return NextResponse.json(
      { error: userinfo.error, status: userinfo.status },
      { status: userinfo.status ?? 401 }
    )
  }

  const clientId = oauthConfig().clientId || 'ludwitt'
  const session = createSession({
    userId: userinfo.user.sub,
    email: userinfo.user.email,
    appId: clientId
  })

  const expiresIn =
    typeof body.expires_in === 'number' && body.expires_in > 0
      ? body.expires_in
      : 3600
  const refreshToken =
    typeof body.refresh_token === 'string' && body.refresh_token.trim()
      ? body.refresh_token.trim()
      : `test_refresh_${userinfo.user.sub}`

  const res = NextResponse.json({
    ok: true,
    email: userinfo.user.email,
    sub: userinfo.user.sub
  })
  res.cookies.set(SESSION_COOKIE, encodeSession(session), sessionCookieOptions())
  res.cookies.set(
    LUDWITT_TOKEN_COOKIE,
    encodeTokenBundle({
      accessToken,
      refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + expiresIn
    }),
    oauthCookieOptions(60 * 60 * 24 * 30)
  )
  return res
}
