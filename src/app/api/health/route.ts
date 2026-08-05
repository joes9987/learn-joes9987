import { NextResponse } from 'next/server'
import { isLudwittConfigured, ludwittConfig } from '@/lib/ludwitt'

export const dynamic = 'force-dynamic'

export async function GET () {
  const cfg = ludwittConfig()
  return NextResponse.json({
    ok: true,
    app: 'eudalearn',
    ludwittConfigured: isLudwittConfigured(),
    apiBase: cfg.apiBase,
    appIdPresent: Boolean(cfg.appId),
    allowDevLaunch: cfg.allowDevLaunch
  })
}
