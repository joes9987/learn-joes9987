import { NextResponse } from 'next/server'
import { fetchSpendableCents, postAiMessage } from '@/lib/ludwitt-oauth'
import { getValidAccessToken } from '@/lib/ludwitt-tokens'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST (request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Session required' }, { status: 401 })
  }

  const token = await getValidAccessToken()
  if (!token) {
    return NextResponse.json(
      {
        error: 'Ludwitt access token missing. Sign in with Ludwitt again.',
        code: 'NO_ACCESS_TOKEN'
      },
      { status: 401 }
    )
  }

  let body: { prompt?: string; context?: string } = {}
  try {
    body = (await request.json()) as { prompt?: string; context?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const prompt =
    typeof body.prompt === 'string' && body.prompt.trim()
      ? body.prompt.trim().slice(0, 1200)
      : typeof body.context === 'string' && body.context.trim()
        ? `Give one short coaching tip for this practice moment: ${body.context.trim().slice(0, 800)}`
        : ''

  if (!prompt) {
    return NextResponse.json({ error: 'prompt or context required' }, { status: 400 })
  }

  const balance = await fetchSpendableCents(token.accessToken)
  if (balance.ok && balance.spendableCents <= 0) {
    // Still attempt — Creator Test mode tokens may bypass paid balance checks.
    // If AI returns 402 we surface that cleanly below.
  }

  const ai = await postAiMessage({ accessToken: token.accessToken, prompt })
  if (!ai.ok) {
    if (ai.status === 402 || ai.code === 'INSUFFICIENT_PAID_CREDITS') {
      return NextResponse.json(
        {
          error:
            "You're out of Ludwitt credits for third-party apps — top up at https://pitchrise.ludwitt.com/account/credits",
          code: 'INSUFFICIENT_PAID_CREDITS',
          spendableCents: balance.ok ? balance.spendableCents : undefined
        },
        { status: 402 }
      )
    }
    return NextResponse.json(
      { error: ai.error, code: ai.code },
      { status: ai.status ?? 502 }
    )
  }

  return NextResponse.json({
    tip: ai.text,
    credits: ai.credits,
    spendableCents: balance.ok ? balance.spendableCents : undefined
  })
}
