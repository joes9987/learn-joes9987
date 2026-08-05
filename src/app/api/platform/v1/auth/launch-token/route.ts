import { NextResponse } from 'next/server'
import { ludwittConfig, signLaunchToken } from '@/lib/ludwitt'

export async function POST (request: Request) {
  const cfg = ludwittConfig()
  const header = request.headers.get('authorization') || ''
  const key = header.replace(/^Bearer\s+/i, '')
  if (!cfg.apiKey || key !== cfg.apiKey) {
    return NextResponse.json({ error: 'invalid api key' }, { status: 401 })
  }
  if (!cfg.appId || !cfg.jwtSecret) {
    return NextResponse.json({ error: 'app not configured' }, { status: 503 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    app_id?: string
    user_id?: string
    email?: string
  }
  if (body.app_id && body.app_id !== cfg.appId) {
    return NextResponse.json({ error: 'app not found' }, { status: 404 })
  }
  if (!body.user_id || !body.email) {
    return NextResponse.json({ error: 'user_id and email required' }, { status: 400 })
  }

  const token = signLaunchToken(
    { sub: body.user_id, email: body.email, app_id: cfg.appId },
    cfg.jwtSecret
  )
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return NextResponse.json({
    token,
    launch_url: `${site.replace(/\/$/, '')}/launch?token=${token}`
  })
}
