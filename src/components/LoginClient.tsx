'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

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
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
          Ludwitt
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          EudaLearn uses your Ludwitt identity so practice events and coach tips are attributed
          correctly.
        </p>

        {oauthReady ? (
          <a
            href="/api/auth/ludwitt"
            className="mt-6 inline-flex rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
          >
            Sign in with Ludwitt
          </a>
        ) : (
          <p className="mt-6 text-sm text-[var(--muted)]">OAuth credentials not configured.</p>
        )}

        <p className="mt-4 text-xs text-[var(--muted)]">
          If Ludwitt shows <span className="font-mono">invalid_client</span>, their OAuth authorize
          endpoint is currently rejecting Creator-registered apps (including freshly created ones).
          Use a Creator Test mode token below — it is a real Ludwitt access token and powers{' '}
          <span className="font-mono">/api/coach</span>.
        </p>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card-solid)] p-8 shadow-sm">
        <h2 className="font-display text-lg font-semibold">Creator Test mode token</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
          <li>
            Open your app in{' '}
            <a
              className="font-semibold text-[var(--primary)] underline"
              href="https://www.ludwitt.com/creator/apps"
              target="_blank"
              rel="noreferrer"
            >
              Ludwitt Creator
            </a>
          </li>
          <li>Click <strong>Mint test token</strong>, copy the <span className="font-mono">lt_…</span> value</li>
          <li>Paste it here and continue</li>
        </ol>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="lt_…"
          rows={3}
          className="mt-4 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 font-mono text-sm text-[var(--foreground)] outline-none ring-[var(--primary)] focus:ring-2"
        />
        {error ? (
          <p className="mt-3 text-sm text-red-700">{error}</p>
        ) : null}
        <button
          type="button"
          disabled={pending || !token.trim()}
          onClick={submitToken}
          className="mt-4 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          {pending ? 'Signing in…' : 'Continue with test token'}
        </button>
        {listingUrl ? (
          <p className="mt-4 text-xs text-[var(--muted)]">
            Listing:{' '}
            <a className="text-[var(--primary)] underline" href={listingUrl} target="_blank" rel="noreferrer">
              {listingUrl}
            </a>
          </p>
        ) : null}
      </section>
    </div>
  )
}
