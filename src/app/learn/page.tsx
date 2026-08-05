import Link from 'next/link'
import { listModules } from '@/lib/modules'
import { isOAuthConfigured } from '@/lib/ludwitt-oauth'
import { getSession } from '@/lib/session'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Learn' }

export default async function LearnIndexPage () {
  const session = await getSession()
  const modules = listModules()
  const oauthReady = isOAuthConfigured()

  if (!session) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8">
        <h1 className="text-2xl font-bold">Sign in with Ludwitt</h1>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          Counted sessions use your Ludwitt account. Sign in to start practice and attribute learning
          events.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {oauthReady ? (
            <a
              href="/api/auth/ludwitt"
              className="inline-flex rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]"
            >
              Sign in with Ludwitt
            </a>
          ) : (
            <p className="text-sm text-[var(--muted)]">OAuth credentials not configured.</p>
          )}
          {SITE.listingUrl ? (
            <a
              href={SITE.listingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--primary)]"
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
        <h1 className="mt-1 text-3xl font-bold">Choose a module</h1>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <li key={m.id}>
            <Link
              href={`/learn/${m.id}`}
              className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-[var(--primary)]"
            >
              <p className="text-xs text-[var(--muted)]">
                {m.minutes} min · {m.xp} XP
              </p>
              <h2 className="mt-1 text-lg font-semibold">{m.title}</h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{m.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
