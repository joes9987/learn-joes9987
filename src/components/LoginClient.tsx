'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PracticeLoopFigure } from '@/components/brand/illustrations'
import { NewTabHint } from '@/components/NewTabHint'
import { ui } from '@/lib/ui'

export function LoginClient ({
  oauthReady,
  listingUrl,
  intent = 'signin'
}: {
  oauthReady: boolean
  listingUrl: string
  intent?: 'signin' | 'signup'
}) {
  const isSignup = intent === 'signup'
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
      <section className={`${ui.cardElevated} px-6 py-10 sm:px-10`}>
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div>
        <p className={ui.eyebrow}>Ludwitt</p>
        <h1 className={`${ui.pageTitle} mt-2 text-3xl leading-tight`}>
          {isSignup ? 'Create your account' : 'Sign in'}
        </h1>
        <p className={`mt-3 ${ui.pageSubtitle}`}>
          {isSignup
            ? 'New to EudaLearn? Create a free Ludwitt account on the next screen. You will come back here so practice sessions, XP, and coach tips are attributed to you.'
            : 'EudaLearn is listed on the Ludwitt marketplace. Sign in with Ludwitt so practice sessions and coach tips are attributed to you.'}
        </p>

        {oauthReady ? (
          <a href="/api/auth/ludwitt" className={`mt-6 inline-flex ${ui.btnPrimaryLg}`}>
            {isSignup ? 'Sign up with Ludwitt' : 'Sign in with Ludwitt'}
          </a>
        ) : (
          <p className="mt-6 text-sm text-[var(--muted)]">
            {isSignup ? 'Sign-up' : 'Sign-in'} isn&apos;t available right now. Try again later, or
            use the option below if you have a Creator test token.
          </p>
        )}

        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          {isSignup ? (
            <>
              Already have a Ludwitt account?{' '}
              <a href="/login" className={ui.linkAccent}>
                Sign in
              </a>
            </>
          ) : (
            <>
              New here?{' '}
              <a href="/signup" className={ui.linkAccent}>
                Create an account
              </a>
            </>
          )}
        </p>
          </div>
          <PracticeLoopFigure idPrefix="auth-loop" />
        </div>

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
                  <NewTabHint />
                </a>
              </li>
              <li>
                Click <strong>Mint test token</strong>, copy the value
              </li>
              <li>Paste it below and continue</li>
            </ol>
            <div>
              <label htmlFor="ludwitt-test-token" className="text-sm font-medium text-[var(--foreground)]">
                Creator test token
              </label>
              <textarea
                id="ludwitt-test-token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="lt_…"
                rows={3}
                className={`${ui.field} font-mono text-sm`}
                autoComplete="off"
              />
            </div>
            {error ? (
              <p role="alert" className={ui.alertError}>
                {error}
              </p>
            ) : null}
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
              <NewTabHint />
            </a>
          </p>
        ) : null}
      </section>
    </div>
  )
}
