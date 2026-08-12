import Link from 'next/link'
import { redirect } from 'next/navigation'
import { TRACK } from '@/lib/modules'
import { getLearnerProgress } from '@/lib/progress'
import { getSession } from '@/lib/session'
import { SITE } from '@/lib/site'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Profile',
  description: 'Your EudaLearn XP, path progress, and suite links.'
}

export default async function ProfilePage () {
  const session = await getSession()
  if (!session) redirect('/login')

  const progress = await getLearnerProgress(session.userId)
  const suite = [
    {
      name: 'EudaMarket',
      href: SITE.marketUrl,
      blurb: 'Showcase + suite directory — claim or view your public card when available.'
    },
    {
      name: 'EudaPM',
      href: SITE.pmUrl,
      blurb: 'Project work and tickets for the cohort.'
    },
    {
      name: 'EudaChat',
      href: SITE.chatUrl,
      blurb: 'Channels and DMs for the pilot.'
    },
    {
      name: 'Ludwitt listing',
      href: SITE.listingUrl || SITE.siteUrl,
      blurb: 'Canonical entry for counted Learn sessions.'
    }
  ]

  return (
    <div className="space-y-8">
      <section className={ui.cardElevated}>
        <p className={ui.eyebrow}>Profile</p>
        <h1 className="font-display mt-1 text-3xl font-bold text-[var(--foreground)]">
          {session.email}
        </h1>
        <p className={`mt-2 ${ui.pageSubtitle}`}>
          Ludwitt identity synced · user id{' '}
          <span className="font-mono text-xs text-[var(--foreground)]">{session.userId}</span>
        </p>
        <p className="mt-4 max-w-2xl text-sm text-[var(--muted-foreground)]">
          Path: <span className="text-[var(--foreground)]">{TRACK.title}</span> — {TRACK.outcome}
        </p>
      </section>

      <section className={ui.card}>
        <h2 className={ui.pageTitle}>XP progression</h2>
        <p className={`mt-1 ${ui.pageSubtitle}`}>
          XP is awarded once per module when you reach the summary (lesson completed).
        </p>
        <div className="mt-5">
          <div className="flex items-end justify-between gap-3">
            <p className="font-display text-4xl font-bold text-[var(--foreground)]">
              {progress.xpEarned}
              <span className="text-lg font-semibold text-[var(--muted)]">
                {' '}
                / {progress.xpTotal} XP
              </span>
            </p>
            <p className="text-sm text-[var(--muted)]">{progress.percentComplete}% complete</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--primary)]"
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
        </div>
        <ul className="mt-6 space-y-2">
          {progress.modules.map(({ module: m, completed, bestScorePct }) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium text-[var(--foreground)]">{m.title}</span>
                <span className="ml-2 text-[var(--muted)]">
                  {m.skill} · {m.xp} XP
                </span>
              </div>
              <div className="flex items-center gap-3">
                {completed ? (
                  <span className="text-[var(--success-fg)]">
                    +{m.xp} XP{bestScorePct != null ? ` · best ${bestScorePct}%` : ''}
                  </span>
                ) : (
                  <span className="text-[var(--muted)]">Locked XP</span>
                )}
                <Link href={`/learn/${m.id}`} className={ui.linkAccent}>
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/learn" className={`mt-6 inline-flex ${ui.btnPrimary}`}>
          Back to path
        </Link>
      </section>

      <section className={ui.card}>
        <h2 className={ui.pageTitle}>Euda profile sync</h2>
        <p className={`mt-1 ${ui.pageSubtitle}`}>
          Learn sessions use your Ludwitt account. Other Euda apps keep their own host sessions —
          open them below to sync your work across the suite (no silent cross-site SSO).
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {suite.map((app) => (
            <li key={app.name}>
              <a
                href={app.href}
                target="_blank"
                rel="noreferrer"
                className={`${ui.cardSm} block transition hover:border-[var(--primary)]`}
              >
                <p className="font-semibold text-[var(--foreground)]">{app.name}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{app.blurb}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--primary)]">Open →</p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
