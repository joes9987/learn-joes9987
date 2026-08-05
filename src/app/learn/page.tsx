import Link from 'next/link'
import { listModules } from '@/lib/modules'
import { getSession } from '@/lib/session'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Learn' }

export default async function LearnIndexPage () {
  const session = await getSession()
  const modules = listModules()

  if (!session) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8">
        <h1 className="text-2xl font-bold">Launch required</h1>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          Open EudaLearn from the Ludwitt launcher so we can validate your JWT and attribute events.
        </p>
        {SITE.listingUrl ? (
          <a
            href={SITE.listingUrl}
            className="mt-6 inline-flex rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]"
          >
            Open via Ludwitt
          </a>
        ) : (
          <p className="mt-6 text-sm text-[var(--muted)]">Listing URL not configured yet.</p>
        )}
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
