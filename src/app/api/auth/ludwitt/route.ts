import { NextResponse } from 'next/server'
import {
  buildAuthorizeUrl,
  createOAuthState,
  isOAuthConfigured,
  OAUTH_STATE_COOKIE,
  oauthCookieOptions,
  oauthConfig
} from '@/lib/ludwitt-oauth'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

export async function GET (request: Request) {
  if (!isOAuthConfigured()) {
    return NextResponse.json({ error: 'Ludwitt OAuth not configured' }, { status: 503 })
  }

  const url = new URL(request.url)
  const origin = SITE.siteUrl.replace(/\/$/, '') || url.origin
  const redirectUri = `${origin}/auth/callback`
  const state = createOAuthState()
  const authorize = buildAuthorizeUrl({ redirectUri, state })

  const res = NextResponse.redirect(authorize)
  res.cookies.set(
    OAUTH_STATE_COOKIE,
    state,
    oauthCookieOptions(600)
  )
  // Ensure client id is present for debugging without leaking secret
  void oauthConfig().clientId
  return res
}
