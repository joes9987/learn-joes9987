'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ui } from '@/lib/ui'

export function LoginClient ({
  oauthReady,
  listingUrl
}: {
  oauthReady: boolean
  listingUrl: string
}) {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submitToken () {
    setError(null)
    startTransition(async () => {
      const res = await fetch('/api/auth/ludwitt-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token.trim() })
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? `Sign-in failed (${res.status})`)
        return
      }
      router.replace('/learn')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <section className={ui.cardElevated}>
        <p className={ui.eyebrow}>Ludwitt</p>
        <h1 className={`${ui.pageTitle} mt-2 text-3xl`}>Sign in</h1>
        <p className={`mt-3 ${ui.pageSubtitle}`}>
          EudaLearn uses your Ludwitt identity so practice events and coach tips are attributed
          correctly.
        </p>

        {oauthReady ? (
          <a href="/api/auth/ludwitt" className={`mt-6 inline-flex ${ui.btnPrimaryLg}`}>
            Sign in with Ludwitt
          </a>
        ) : (
          <p className="mt-6 text-sm text-[var(--muted)]">OAuth credentials not configured.</p>
        )}

        <p className="mt-4 text-xs text-[var(--muted)]">
          If Ludwitt shows <span className="font-mono">invalid_client</span>, their OAuth authorize
          endpoint is currently rejecting Creator-registered apps. Use a Creator Test mode token
          below — it is a real Ludwitt access token and powers{' '}
          <span className="font-mono">/api/coach</span>.
        </p>
      </section>

      <section className={ui.cardSolid}>
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
          Creator Test mode token
        </h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
          <li>
            Open your app in{' '}
            <a
              className={ui.linkAccent}
              href="https://www.ludwitt.com/creator/apps"
              target="_blank"
              rel="noreferrer"
            >
              Ludwitt Creator
            </a>
          </li>
          <li>
            Click <strong>Mint test token</strong>, copy the <span className="font-mono">lt_…</span>{' '}
            value
          </li>
          <li>Paste it here and continue</li>
        </ol>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="lt_…"
          rows={3}
          className={`${ui.field} font-mono text-sm`}
        />
        {error ? <p className={`mt-3 ${ui.alertError}`}>{error}</p> : null}
        <button
          type="button"
          disabled={pending || !token.trim()}
          onClick={submitToken}
          className={`mt-4 ${ui.btnPrimary}`}
        >
          {pending ? 'Signing in…' : 'Continue with test token'}
        </button>
        {listingUrl ? (
          <p className="mt-4 text-xs text-[var(--muted)]">
            Listing:{' '}
            <a className={ui.linkAccent} href={listingUrl} target="_blank" rel="noreferrer">
              {listingUrl}
            </a>
          </p>
        ) : null}
      </section>
    </div>
  )
}
