import Link from 'next/link'
import { listModules } from '@/lib/modules'
import { isOAuthConfigured } from '@/lib/ludwitt-oauth'
import { getSession } from '@/lib/session'
import { SITE } from '@/lib/site'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Learn' }

export default async function LearnIndexPage () {
  const session = await getSession()
  const modules = listModules()
  const oauthReady = isOAuthConfigured()

  if (!session) {
    return (
      <div className={ui.cardElevated}>
        <h1 className={ui.pageTitle}>Sign in with Ludwitt</h1>
        <p className={`mt-3 ${ui.pageSubtitle}`}>
          Counted sessions use your Ludwitt account. Sign in to start practice and attribute learning
          events.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/login" className={ui.btnPrimaryLg}>
            Sign in with Ludwitt
          </a>
          {!oauthReady ? (
            <p className="text-sm text-[var(--muted)]">OAuth credentials not configured.</p>
          ) : null}
          {SITE.listingUrl ? (
            <a
              href={SITE.listingUrl}
              target="_blank"
              rel="noreferrer"
              className={ui.btnSecondary}
            >
              Marketplace listing
            </a>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-[var(--muted)]">Signed in via Ludwitt · {session.email}</p>
        <h1 className="font-display mt-1 text-3xl font-bold text-[var(--foreground)]">
          Choose a module
        </h1>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <li key={m.id}>
            <Link
              href={`/learn/${m.id}`}
              className={`${ui.card} block transition hover:border-[var(--primary)]`}
            >
              <p className="text-xs text-[var(--muted)]">
                {m.minutes} min · {m.xp} XP
              </p>
              <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">{m.title}</h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{m.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
