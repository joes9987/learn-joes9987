import { cookies } from 'next/headers'
import {
  decodeTokenBundle,
  encodeTokenBundle,
  LUDWITT_TOKEN_COOKIE,
  oauthCookieOptions,
  refreshAccessToken,
  type LudwittTokenBundle
} from '@/lib/ludwitt-oauth'

/** Returns a usable access token, refreshing when within 60s of expiry. */
export async function getValidAccessToken (): Promise<{
  accessToken: string
  refreshed: boolean
  bundle: LudwittTokenBundle
} | null> {
  const jar = await cookies()
  const bundle = decodeTokenBundle(jar.get(LUDWITT_TOKEN_COOKIE)?.value)
  if (!bundle) return null

  const now = Math.floor(Date.now() / 1000)
  if (bundle.expiresAt > now + 60) {
    return { accessToken: bundle.accessToken, refreshed: false, bundle }
  }

  // Creator mint / test tokens may not include a real refresh_token.
  if (bundle.refreshToken.startsWith('test_refresh_')) {
    if (bundle.expiresAt > now) {
      return { accessToken: bundle.accessToken, refreshed: false, bundle }
    }
    return null
  }

  const refreshed = await refreshAccessToken(bundle.refreshToken)
  if (!refreshed.ok) {
    if (bundle.expiresAt > now) {
      return { accessToken: bundle.accessToken, refreshed: false, bundle }
    }
    return null
  }

  jar.set(
    LUDWITT_TOKEN_COOKIE,
    encodeTokenBundle(refreshed.tokens),
    oauthCookieOptions(60 * 60 * 24 * 30)
  )
  return {
    accessToken: refreshed.tokens.accessToken,
    refreshed: true,
    bundle: refreshed.tokens
  }
}
