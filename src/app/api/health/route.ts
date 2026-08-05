import { NextResponse } from 'next/server'
import { isLudwittConfigured, ludwittConfig } from '@/lib/ludwitt'
import { isOAuthConfigured, oauthConfig } from '@/lib/ludwitt-oauth'

export const dynamic = 'force-dynamic'

export async function GET () {
  const cfg = ludwittConfig()
  const oauth = oauthConfig()
  return NextResponse.json({
    ok: true,
    app: 'eudalearn',
    ludwittConfigured: isLudwittConfigured(),
    oauthConfigured: isOAuthConfigured(),
    clientIdPresent: Boolean(oauth.clientId),
    oauthBase: oauth.base,
    apiBase: cfg.apiBase,
    appIdPresent: Boolean(cfg.appId),
    allowDevLaunch: cfg.allowDevLaunch
  })
}
