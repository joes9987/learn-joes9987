import { NextResponse } from 'next/server'
import { ludwittConfig, verifyLaunchToken } from '@/lib/ludwitt'
import { createSession, encodeSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/session'

export async function GET (request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const cfg = ludwittConfig()

  if (!token) {
    return NextResponse.redirect(new URL('/launch/error?reason=missing_token', url.origin))
  }
  if (!cfg.jwtSecret || !cfg.appId) {
    return NextResponse.redirect(new URL('/launch/error?reason=not_configured', url.origin))
  }

  const verified = verifyLaunchToken(token, cfg.jwtSecret, cfg.appId)
  if (!verified.ok) {
    return NextResponse.redirect(
      new URL(`/launch/error?reason=${encodeURIComponent(verified.error)}`, url.origin)
    )
  }

  const session = createSession({
    userId: verified.claims.sub,
    email: verified.claims.email,
    appId: verified.claims.app_id
  })

  const res = NextResponse.redirect(new URL('/learn', url.origin))
  res.cookies.set(SESSION_COOKIE, encodeSession(session), sessionCookieOptions())
  return res
}
