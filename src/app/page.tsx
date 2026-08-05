import Link from 'next/link'
import { listModules } from '@/lib/modules'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default function HomePage () {
  const modules = listModules()
  const listing = SITE.listingUrl

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] px-6 py-12 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
          {SITE.cohort}
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          {SITE.name}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--muted-foreground)]">{SITE.tagline}</p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Short practice modules on prompt briefs, launch trust, event telemetry, and suite thinking —
          instrumented for Ludwitt. Sign in with your Ludwitt account so sessions and events are
          attributed correctly. Prefer the marketplace listing when sharing with peers.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/login"
            className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
          >
            Sign in with Ludwitt
          </a>
          {listing ? (
            <a
              href={listing}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--primary)]"
            >
              Marketplace listing
            </a>
          ) : (
            <span className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm text-[var(--muted)]">
              Marketplace listing pending
            </span>
          )}
          <Link
            href="/learn"
            className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--primary)]"
          >
            Modules
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Modules</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {modules.map((m) => (
            <li key={m.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-xs text-[var(--muted)]">
                {m.minutes} min · {m.xp} XP
              </p>
              <h3 className="mt-1 font-semibold">{m.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{m.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
