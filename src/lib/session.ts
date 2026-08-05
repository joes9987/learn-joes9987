import { cookies } from 'next/headers'
import { createHmac, randomUUID, timingSafeEqual } from 'crypto'

export const SESSION_COOKIE = 'eudalearn_session'

export type LearnSession = {
  userId: string
  email: string
  appId: string
  sessionId: string
  exp: number
}

function sessionSecret (): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.LUDWITT_JWT_SECRET ||
    'dev-only-session-secret'
  )
}

export function createSession (partial: Omit<LearnSession, 'sessionId' | 'exp'> & { sessionId?: string }): LearnSession {
  return {
    userId: partial.userId,
    email: partial.email,
    appId: partial.appId,
    sessionId: partial.sessionId ?? randomUUID(),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
  }
}

export function encodeSession (session: LearnSession): string {
  const body = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')
  const sig = createHmac('sha256', sessionSecret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function decodeSession (raw: string | undefined): LearnSession | null {
  if (!raw) return null
  const [body, sig] = raw.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', sessionSecret()).update(body).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const session = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as LearnSession
    if (!session.userId || !session.sessionId || !session.email) return null
    if (session.exp * 1000 < Date.now()) return null
    return session
  } catch {
    return null
  }
}

export async function getSession (): Promise<LearnSession | null> {
  const jar = await cookies()
  return decodeSession(jar.get(SESSION_COOKIE)?.value)
}

export function sessionCookieOptions (maxAgeSec = 60 * 60 * 8) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSec
  }
}
