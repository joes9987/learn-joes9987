import { NextResponse } from 'next/server'
import { ludwittConfig, parseEventBody } from '@/lib/ludwitt'
import { recordPlatformEvent } from '@/lib/platform-store'

type Props = { params: Promise<{ appId: string }> }

export async function POST (request: Request, { params }: Props) {
  const { appId } = await params
  const cfg = ludwittConfig()
  const header = request.headers.get('authorization') || ''
  const key = header.replace(/^Bearer\s+/i, '')
  if (!cfg.apiKey || key !== cfg.apiKey) {
    return NextResponse.json({ error: 'invalid api key' }, { status: 401 })
  }
  if (appId !== cfg.appId) {
    return NextResponse.json({ error: 'app not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const parsed = parseEventBody(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  // Anti-gaming: ignore cohort handle in user_id
  const blocked = /joes9987/i.test(parsed.data.user_id)
  if (blocked) {
    return NextResponse.json({ accepted: true, counted: false }, { status: 202 })
  }

  const saved = await recordPlatformEvent({
    app_id: appId,
    event: parsed.data.event,
    user_id: parsed.data.user_id,
    session_id: parsed.data.session_id,
    metadata: parsed.data.metadata
  })
  if (!saved.ok) {
    return NextResponse.json({ error: saved.error }, { status: 503 })
  }
  return NextResponse.json({ accepted: true, counted: true }, { status: 202 })
}
