import { describe, expect, it } from 'vitest'
import {
  buildAuthorizeUrl,
  createOAuthState,
  decodeTokenBundle,
  encodeTokenBundle,
  signCookiePayload,
  verifyCookiePayload
} from '../src/lib/ludwitt-oauth'

describe('oauth helpers', () => {
  it('creates high-entropy state', () => {
    const a = createOAuthState()
    const b = createOAuthState()
    expect(a).not.toBe(b)
    expect(a.length).toBeGreaterThan(20)
  })

  it('round-trips signed cookie payloads', () => {
    process.env.SESSION_SECRET = 'test-session-secret'
    const raw = signCookiePayload({ hello: 'world' })
    const parsed = verifyCookiePayload<{ hello: string }>(raw)
    expect(parsed?.hello).toBe('world')
  })

  it('round-trips token bundles', () => {
    process.env.SESSION_SECRET = 'test-session-secret'
    const encoded = encodeTokenBundle({
      accessToken: 'lt_test',
      refreshToken: 'lr_test',
      expiresAt: 9999999999,
      scope: 'profile'
    })
    const decoded = decodeTokenBundle(encoded)
    expect(decoded?.accessToken).toBe('lt_test')
    expect(decoded?.refreshToken).toBe('lr_test')
  })

  it('builds authorize URL with required params', () => {
    process.env.LUDWITT_CLIENT_ID = 'le_test'
    process.env.LUDWITT_OAUTH_BASE = 'https://pitchrise.ludwitt.com'
    const url = buildAuthorizeUrl({
      redirectUri: 'http://localhost:3000/auth/callback',
      state: 'abc'
    })
    const u = new URL(url)
    expect(u.origin + u.pathname).toBe('https://pitchrise.ludwitt.com/oauth/authorize')
    expect(u.searchParams.get('client_id')).toBe('le_test')
    expect(u.searchParams.get('response_type')).toBe('code')
    expect(u.searchParams.get('state')).toBe('abc')
    expect(u.searchParams.get('scope')).toContain('profile')
  })
})
