import { createHmac, timingSafeEqual } from 'crypto'

export type LudwittEventName =
  | 'lesson_started'
  | 'lesson_completed'
  | 'quiz_submitted'
  | 'session_heartbeat'

export type LaunchClaims = {
  sub: string
  email: string
  app_id: string
  iat?: number
  exp?: number
}

export function ludwittConfig () {
  return {
    appId: process.env.LUDWITT_APP_ID ?? '',
    apiKey: process.env.LUDWITT_API_KEY ?? '',
    jwtSecret: process.env.LUDWITT_JWT_SECRET ?? '',
    apiBase: (process.env.LUDWITT_API_BASE ?? 'https://api.ludwitt.hult/v1').replace(/\/$/, ''),
    allowDevLaunch: process.env.ALLOW_DEV_LAUNCH === 'true'
  }
}

export function isLudwittConfigured (): boolean {
  const c = ludwittConfig()
  return Boolean(c.appId && c.apiKey && c.jwtSecret)
}

/** Minimal HS256 JWT verify (no external runtime deps beyond Node crypto). */
export function verifyLaunchToken (
  token: string,
  secret: string,
  expectedAppId: string
): { ok: true; claims: LaunchClaims } | { ok: false; error: string } {
  const parts = token.split('.')
  if (parts.length !== 3) return { ok: false, error: 'Malformed token' }

  const [headerB64, payloadB64, sigB64] = parts
  let header: { alg?: string }
  try {
    header = JSON.parse(b64urlToString(headerB64))
  } catch {
    return { ok: false, error: 'Invalid token header' }
  }
  if (header.alg !== 'HS256') return { ok: false, error: 'Unsupported algorithm' }

  const data = `${headerB64}.${payloadB64}`
  const expected = createHmac('sha256', secret).update(data).digest()
  const actual = Buffer.from(b64urlToBytes(sigB64))
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, error: 'Invalid signature' }
  }

  let claims: LaunchClaims
  try {
    claims = JSON.parse(b64urlToString(payloadB64)) as LaunchClaims
  } catch {
    return { ok: false, error: 'Invalid token payload' }
  }

  if (!claims.sub || !claims.email || !claims.app_id) {
    return { ok: false, error: 'Token missing required claims' }
  }
  if (expectedAppId && claims.app_id !== expectedAppId) {
    return { ok: false, error: 'Token app_id mismatch' }
  }
  if (typeof claims.exp === 'number' && claims.exp * 1000 < Date.now()) {
    return { ok: false, error: 'Token expired' }
  }

  return { ok: true, claims }
}

export function signLaunchToken (
  claims: Omit<LaunchClaims, 'iat' | 'exp'> & { expSec?: number },
  secret: string
): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub: claims.sub,
    email: claims.email,
    app_id: claims.app_id,
    iat: now,
    exp: now + (claims.expSec ?? 3600)
  }
  const headerB64 = toB64url(JSON.stringify(header))
  const payloadB64 = toB64url(JSON.stringify(payload))
  const data = `${headerB64}.${payloadB64}`
  const sig = createHmac('sha256', secret).update(data).digest()
  return `${data}.${Buffer.from(sig).toString('base64url')}`
}

export type EventPayload = {
  event: LudwittEventName
  user_id: string
  session_id: string
  metadata?: Record<string, unknown>
}

export function parseEventBody (body: unknown): { ok: true; data: EventPayload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid JSON body' }
  const b = body as Record<string, unknown>
  const event = b.event
  const allowed: LudwittEventName[] = [
    'lesson_started',
    'lesson_completed',
    'quiz_submitted',
    'session_heartbeat'
  ]
  if (typeof event !== 'string' || !allowed.includes(event as LudwittEventName)) {
    return { ok: false, error: 'Invalid event type' }
  }
  if (typeof b.user_id !== 'string' || !b.user_id.trim()) {
    return { ok: false, error: 'user_id required' }
  }
  if (typeof b.session_id !== 'string' || !b.session_id.trim()) {
    return { ok: false, error: 'session_id required' }
  }
  return {
    ok: true,
    data: {
      event: event as LudwittEventName,
      user_id: b.user_id.trim(),
      session_id: b.session_id.trim(),
      metadata:
        b.metadata && typeof b.metadata === 'object'
          ? (b.metadata as Record<string, unknown>)
          : undefined
    }
  }
}

export async function postLudwittEvent (
  payload: EventPayload
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const { appId, apiKey, apiBase } = ludwittConfig()
  if (!appId || !apiKey) {
    return { ok: false, status: 503, body: { error: 'Ludwitt not configured' } }
  }
  const res = await fetch(`${apiBase}/apps/${appId}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    cache: 'no-store'
  })
  const text = await res.text()
  let body: unknown = text
  try {
    body = JSON.parse(text)
  } catch {
    /* keep text */
  }
  return { ok: res.ok || res.status === 202, status: res.status, body }
}

function b64urlToString (input: string): string {
  return Buffer.from(b64urlToBytes(input)).toString('utf8')
}

function b64urlToBytes (input: string): Uint8Array {
  const pad = '='.repeat((4 - (input.length % 4)) % 4)
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64')
}

function toB64url (input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url')
}
