import { NextResponse } from 'next/server'
import { parseEventBody, postLudwittEvent } from '@/lib/ludwitt'
import { getSession } from '@/lib/session'
import { withVentureMetadata } from '@/lib/venture'

export async function POST (request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Sign in with Ludwitt to start a session' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = parseEventBody(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  // Bind events to the launched session — ignore spoofed ids from the client.
  const payload = {
    ...parsed.data,
    user_id: session.userId,
    session_id: session.sessionId,
    metadata: withVentureMetadata(parsed.data.metadata)
  }

  const result = await postLudwittEvent(payload)
  if (!result.ok) {
    return NextResponse.json(
      { error: 'Failed to record event', upstream: result.body },
      { status: result.status === 503 ? 503 : 502 }
    )
  }
  return NextResponse.json({ ok: true, upstream: result.body })
}
