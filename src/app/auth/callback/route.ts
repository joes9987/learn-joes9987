import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  encodeTokenBundle,
  exchangeAuthorizationCode,
  fetchUserInfo,
  LUDWITT_TOKEN_COOKIE,
  OAUTH_STATE_COOKIE,
  oauthConfig,
  oauthCookieOptions
} from '@/lib/ludwitt-oauth'
import {
  createSession,
  encodeSession,
  SESSION_COOKIE,
  sessionCookieOptions
} from '@/lib/session'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

export async function GET (request: Request) {
  const url = new URL(request.url)
  const origin = SITE.siteUrl.replace(/\/$/, '') || url.origin
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const err = url.searchParams.get('error')

  if (err) {
    return NextResponse.redirect(
      new URL(`/launch/error?reason=${encodeURIComponent(`oauth_${err}`)}`, origin)
    )
  }
  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/launch/error?reason=oauth_missing_code', origin)
    )
  }

  const jar = await cookies()
  const stateCookie = jar.get(OAUTH_STATE_COOKIE)?.value
  if (!stateCookie || stateCookie !== state) {
    return NextResponse.redirect(
      new URL('/launch/error?reason=oauth_state_mismatch', origin)
    )
  }

  const redirectUri = `${origin}/auth/callback`
  const exchanged = await exchangeAuthorizationCode({ code, redirectUri })
  if (!exchanged.ok) {
    return NextResponse.redirect(
      new URL(
        `/launch/error?reason=${encodeURIComponent(exchanged.error)}`,
        origin
      )
    )
  }

  const userinfo = await fetchUserInfo(exchanged.tokens.accessToken)
  if (!userinfo.ok) {
    return NextResponse.redirect(
      new URL(
        `/launch/error?reason=${encodeURIComponent(userinfo.error)}`,
        origin
      )
    )
  }

  const clientId = oauthConfig().clientId
  const session = createSession({
    userId: userinfo.user.sub,
    email: userinfo.user.email,
    appId: clientId || 'ludwitt-oauth'
  })

  const res = NextResponse.redirect(new URL('/learn', origin))
  res.cookies.set(SESSION_COOKIE, encodeSession(session), sessionCookieOptions())
  res.cookies.set(
    LUDWITT_TOKEN_COOKIE,
    encodeTokenBundle(exchanged.tokens),
    oauthCookieOptions(60 * 60 * 24 * 30)
  )
  res.cookies.set(OAUTH_STATE_COOKIE, '', { ...oauthCookieOptions(0), maxAge: 0 })
  return res
}
