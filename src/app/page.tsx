import Link from 'next/link'
import { listModules, TRACK, totalTrackXp } from '@/lib/modules'
import { SITE } from '@/lib/site'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default function HomePage () {
  const modules = listModules()
  const listing = SITE.listingUrl
  const minutes = modules.reduce((s, m) => s + m.minutes, 0)

  return (
    <div className="space-y-10">
      <section className={`${ui.cardElevated} px-6 py-12 sm:px-10`}>
        <p className={ui.eyebrow}>{SITE.cohort}</p>
        <h1 className="font-display mt-3 max-w-2xl text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">
          <span className="text-gradient">{SITE.name}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--muted-foreground)]">{SITE.tagline}</p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          {TRACK.outcome} {modules.length} modules · ~{minutes} min · {totalTrackXp()} XP. Prefer the
          marketplace listing when sharing with peers.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/learn" className={ui.btnPrimaryLg}>
            Start practicing
          </Link>
          <a href="/login" className={ui.btnSecondary}>
            Sign in with Ludwitt
          </a>
          {listing ? (
            <a href={listing} target="_blank" rel="noreferrer" className={ui.btnSecondary}>
              Marketplace listing
            </a>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className={ui.pageTitle}>{TRACK.title}</h2>
        <p className={`mt-2 ${ui.pageSubtitle}`}>
          Skills in order: {modules.map((m) => m.skill).join(' → ')}.
        </p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href="/learn"
                className={`${ui.card} block transition hover:border-[var(--primary)]`}
              >
                <p className="text-xs text-[var(--muted)]">
                  {m.order}. {m.skill} · {m.minutes} min · {m.xp} XP
                </p>
                <h3 className="mt-1 font-semibold text-[var(--foreground)]">{m.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{m.summary}</p>
                <p className="mt-3 text-sm font-semibold text-[var(--primary)]">Practice →</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
