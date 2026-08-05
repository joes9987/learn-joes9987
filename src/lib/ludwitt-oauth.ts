import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

export const OAUTH_STATE_COOKIE = 'eudalearn_oauth_state'
export const LUDWITT_TOKEN_COOKIE = 'eudalearn_ludwitt_tokens'

export type LudwittTokenBundle = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  scope?: string
}

export type LudwittUserInfo = {
  sub: string
  email: string
  name?: string
  picture?: string
}

export function oauthConfig () {
  // Creator docs host OAuth on pitchrise; www may alias the same APIs.
  const base = (process.env.LUDWITT_OAUTH_BASE ?? 'https://pitchrise.ludwitt.com').replace(/\/$/, '')
  return {
    clientId: process.env.LUDWITT_CLIENT_ID ?? process.env.NEXT_PUBLIC_LUDWITT_CLIENT_ID ?? '',
    clientSecret: process.env.LUDWITT_CLIENT_SECRET ?? '',
    base,
    authorizeUrl: `${base}/oauth/authorize`,
    tokenUrl: `${base}/api/oauth/token`,
    userinfoUrl: `${base}/api/oauth/userinfo`,
    creditsUrl: `${base}/api/v1/credits/balance`,
    aiUrl: `${base}/api/v1/ai/messages`,
    scopes: 'profile credits:read credits:spend'
  }
}

export function isOAuthConfigured (): boolean {
  const c = oauthConfig()
  return Boolean(c.clientId && c.clientSecret)
}

function signingSecret (): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.LUDWITT_CLIENT_SECRET ||
    process.env.LUDWITT_JWT_SECRET ||
    'dev-only-session-secret'
  )
}

export function createOAuthState (): string {
  return randomBytes(32).toString('base64url')
}

export function signCookiePayload (payload: unknown): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const sig = createHmac('sha256', signingSecret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyCookiePayload<T> (raw: string | undefined): T | null {
  if (!raw) return null
  const [body, sig] = raw.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', signingSecret()).update(body).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T
  } catch {
    return null
  }
}

export function encodeTokenBundle (bundle: LudwittTokenBundle): string {
  return signCookiePayload(bundle)
}

export function decodeTokenBundle (raw: string | undefined): LudwittTokenBundle | null {
  const bundle = verifyCookiePayload<LudwittTokenBundle>(raw)
  if (!bundle?.accessToken || !bundle.refreshToken || !bundle.expiresAt) return null
  return bundle
}

export function buildAuthorizeUrl (opts: {
  redirectUri: string
  state: string
}): string {
  const c = oauthConfig()
  const params = new URLSearchParams({
    client_id: c.clientId,
    redirect_uri: opts.redirectUri,
    response_type: 'code',
    scope: c.scopes,
    state: opts.state
  })
  return `${c.authorizeUrl}?${params.toString()}`
}

export async function exchangeAuthorizationCode (opts: {
  code: string
  redirectUri: string
}): Promise<{ ok: true; tokens: LudwittTokenBundle } | { ok: false; error: string; status?: number }> {
  const c = oauthConfig()
  if (!c.clientId || !c.clientSecret) {
    return { ok: false, error: 'OAuth not configured' }
  }
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: opts.code,
    redirect_uri: opts.redirectUri,
    client_id: c.clientId,
    client_secret: c.clientSecret
  })
  const res = await fetch(c.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store'
  })
  const text = await res.text()
  let json: Record<string, unknown> = {}
  try {
    json = JSON.parse(text) as Record<string, unknown>
  } catch {
    /* keep empty */
  }
  if (!res.ok) {
    return {
      ok: false,
      error: typeof json.error === 'string' ? json.error : `Token exchange failed (${res.status})`,
      status: res.status
    }
  }
  const accessToken = typeof json.access_token === 'string' ? json.access_token : ''
  const refreshToken = typeof json.refresh_token === 'string' ? json.refresh_token : ''
  const expiresIn = typeof json.expires_in === 'number' ? json.expires_in : 3600
  if (!accessToken || !refreshToken) {
    return { ok: false, error: 'Token response missing access_token or refresh_token' }
  }
  return {
    ok: true,
    tokens: {
      accessToken,
      refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      scope: typeof json.scope === 'string' ? json.scope : undefined
    }
  }
}

export async function refreshAccessToken (
  refreshToken: string
): Promise<{ ok: true; tokens: LudwittTokenBundle } | { ok: false; error: string; status?: number }> {
  const c = oauthConfig()
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: c.clientId,
    client_secret: c.clientSecret
  })
  const res = await fetch(c.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store'
  })
  const text = await res.text()
  let json: Record<string, unknown> = {}
  try {
    json = JSON.parse(text) as Record<string, unknown>
  } catch {
    /* keep empty */
  }
  if (!res.ok) {
    return {
      ok: false,
      error: typeof json.error === 'string' ? json.error : `Refresh failed (${res.status})`,
      status: res.status
    }
  }
  const accessToken = typeof json.access_token === 'string' ? json.access_token : ''
  const nextRefresh =
    typeof json.refresh_token === 'string' ? json.refresh_token : refreshToken
  const expiresIn = typeof json.expires_in === 'number' ? json.expires_in : 3600
  if (!accessToken) return { ok: false, error: 'Refresh response missing access_token' }
  return {
    ok: true,
    tokens: {
      accessToken,
      refreshToken: nextRefresh,
      expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      scope: typeof json.scope === 'string' ? json.scope : undefined
    }
  }
}

export async function fetchUserInfo (
  accessToken: string
): Promise<{ ok: true; user: LudwittUserInfo } | { ok: false; error: string; status?: number }> {
  const c = oauthConfig()
  const res = await fetch(c.userinfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store'
  })
  const text = await res.text()
  let json: Record<string, unknown> = {}
  try {
    json = JSON.parse(text) as Record<string, unknown>
  } catch {
    /* keep empty */
  }
  if (!res.ok) {
    return {
      ok: false,
      error: typeof json.error === 'string' ? json.error : `Userinfo failed (${res.status})`,
      status: res.status
    }
  }
  const sub = typeof json.sub === 'string' ? json.sub : ''
  const email = typeof json.email === 'string' ? json.email : ''
  if (!sub || !email) return { ok: false, error: 'Userinfo missing sub or email' }
  return {
    ok: true,
    user: {
      sub,
      email,
      name: typeof json.name === 'string' ? json.name : undefined,
      picture: typeof json.picture === 'string' ? json.picture : undefined
    }
  }
}

export async function fetchSpendableCents (
  accessToken: string
): Promise<{ ok: true; spendableCents: number } | { ok: false; error: string; status?: number; code?: string }> {
  const c = oauthConfig()
  const res = await fetch(c.creditsUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store'
  })
  const text = await res.text()
  let json: Record<string, unknown> = {}
  try {
    json = JSON.parse(text) as Record<string, unknown>
  } catch {
    /* keep empty */
  }
  if (!res.ok) {
    return {
      ok: false,
      error: typeof json.error === 'string' ? json.error : `Balance failed (${res.status})`,
      status: res.status,
      code: typeof json.code === 'string' ? json.code : undefined
    }
  }
  const spendableCents =
    typeof json.spendableCents === 'number' ? json.spendableCents : 0
  return { ok: true, spendableCents }
}

export async function postAiMessage (opts: {
  accessToken: string
  prompt: string
  system?: string
}): Promise<
  | { ok: true; text: string; credits?: unknown }
  | { ok: false; error: string; status?: number; code?: string }
> {
  const c = oauthConfig()
  const res = await fetch(c.aiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system:
        opts.system ??
        'You are a concise coach for builder-skills practice. Reply in 1-3 short sentences.',
      messages: [{ role: 'user', content: opts.prompt }]
    }),
    cache: 'no-store'
  })
  const text = await res.text()
  let json: Record<string, unknown> = {}
  try {
    json = JSON.parse(text) as Record<string, unknown>
  } catch {
    /* keep empty */
  }
  if (!res.ok) {
    return {
      ok: false,
      error:
        typeof json.message === 'string'
          ? json.message
          : typeof json.error === 'string'
            ? json.error
            : `AI proxy failed (${res.status})`,
      status: res.status,
      code: typeof json.code === 'string' ? json.code : undefined
    }
  }
  const content = json.content
  let reply = ''
  if (Array.isArray(content)) {
    for (const part of content) {
      if (
        part &&
        typeof part === 'object' &&
        (part as { type?: string }).type === 'text' &&
        typeof (part as { text?: string }).text === 'string'
      ) {
        reply += (part as { text: string }).text
      }
    }
  }
  if (!reply.trim()) {
    return { ok: false, error: 'Empty AI response' }
  }
  return { ok: true, text: reply.trim(), credits: json['x-ludwitt-credits'] }
}

export function oauthCookieOptions (maxAgeSec = 600) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSec
  }
}
