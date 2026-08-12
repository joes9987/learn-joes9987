import { NextResponse } from 'next/server'
import { ludwittConfig } from '@/lib/ludwitt'
import { metricsForApp } from '@/lib/platform-store'

type Props = { params: Promise<{ appId: string }> }

function knownAppIds (): Set<string> {
  const cfg = ludwittConfig()
  const ids = [cfg.appId, process.env.LUDWITT_CLIENT_ID, process.env.NEXT_PUBLIC_LUDWITT_CLIENT_ID]
  return new Set(ids.filter(Boolean) as string[])
}

export async function GET (request: Request, { params }: Props) {
  const { appId } = await params
  const cfg = ludwittConfig()
  const header = request.headers.get('authorization') || ''
  const key = header.replace(/^Bearer\s+/i, '')
  if (!cfg.apiKey || key !== cfg.apiKey) {
    return NextResponse.json({ error: 'invalid api key' }, { status: 401 })
  }
  if (!knownAppIds().has(appId)) {
    return NextResponse.json({ error: 'app not found' }, { status: 404 })
  }
  const storeIds = [...knownAppIds(), appId]
  const metrics = await metricsForApp([...storeIds])
  if (!metrics) {
    return NextResponse.json({ error: 'metrics unavailable' }, { status: 503 })
  }
  return NextResponse.json({ ...metrics, requested_app_id: appId })
}
