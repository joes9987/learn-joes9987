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
          EudaLearn is listed on the Ludwitt marketplace. Sign in with Ludwitt so practice sessions
          and coach tips are attributed to you.
        </p>

        {oauthReady ? (
          <a href="/api/auth/ludwitt" className={`mt-6 inline-flex ${ui.btnPrimaryLg}`}>
            Sign in with Ludwitt
          </a>
        ) : (
          <p className="mt-6 text-sm text-[var(--muted)]">
            Sign-in isn&apos;t available right now. Try again later, or use the option below if you
            have a Creator test token.
          </p>
        )}

        <details className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card-solid)] px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-[var(--foreground)]">
            Having trouble signing in?
          </summary>
          <div className="mt-3 space-y-3">
            <p className="text-sm text-[var(--muted-foreground)]">
              Prefer the Ludwitt button above. If you need a Creator test token (starts with{' '}
              <span className="font-mono">lt_</span>) for grading or local checks, mint one from your
              app settings, paste it here, then continue.
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
              <li>
                Open{' '}
                <a
                  className={ui.linkAccent}
                  href="https://pitchrise.ludwitt.com/learning-engineers"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ludwitt Creator
                </a>
              </li>
              <li>
                Click <strong>Mint test token</strong>, copy the value
              </li>
              <li>Paste it below and continue</li>
            </ol>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="lt_…"
              rows={3}
              className={`${ui.field} font-mono text-sm`}
            />
            {error ? <p className={ui.alertError}>{error}</p> : null}
            <button
              type="button"
              disabled={pending || !token.trim()}
              onClick={submitToken}
              className={ui.btnPrimary}
            >
              {pending ? 'Signing in…' : 'Continue with test token'}
            </button>
          </div>
        </details>

        {listingUrl ? (
          <p className="mt-4 text-xs text-[var(--muted)]">
            Marketplace:{' '}
            <a className={ui.linkAccent} href={listingUrl} target="_blank" rel="noreferrer">
              {listingUrl}
            </a>
          </p>
        ) : null}
      </section>
    </div>
  )
}
