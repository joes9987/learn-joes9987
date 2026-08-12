import Link from 'next/link'
import { listModules, TRACK, totalTrackXp } from '@/lib/modules'
import { isOAuthConfigured } from '@/lib/ludwitt-oauth'
import { getLearnerProgress } from '@/lib/progress'
import { getSession } from '@/lib/session'
import { SITE } from '@/lib/site'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Learn',
  description: SITE.description
}

export default async function LearnIndexPage () {
  const session = await getSession()
  const modules = listModules()
  const oauthReady = isOAuthConfigured()
  const first = modules[0]
  const xpTotal = totalTrackXp(modules)

  if (!session) {
    return (
      <div className={ui.cardElevated}>
        <p className={ui.eyebrow}>Path</p>
        <h1 className={ui.pageTitle}>{TRACK.title}</h1>
        <p className={`mt-3 ${ui.pageSubtitle}`}>{TRACK.outcome}</p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {modules.length} modules · ~{modules.reduce((s, m) => s + m.minutes, 0)} min · {xpTotal} XP
          total. Sign in with Ludwitt so practice sessions count.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href="/login" className={ui.btnPrimaryLg}>
            Sign in with Ludwitt
          </a>
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
        {!oauthReady ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Sign-in isn&apos;t available right now. Open Sign in for an alternate path if you have a
            Creator test token.
          </p>
        ) : null}
      </div>
    )
  }

  const progress = await getLearnerProgress(session.userId)

  return (
    <div className="space-y-8">
      <section className={ui.cardElevated}>
        <p className={ui.eyebrow}>Path</p>
        <h1 className="font-display mt-1 text-3xl font-bold text-[var(--foreground)]">
          {TRACK.title}
        </h1>
        <p className={`mt-3 max-w-2xl ${ui.pageSubtitle}`}>{TRACK.outcome}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
          <p className="text-[var(--muted)]">
            Signed in via Ludwitt · {session.email}
          </p>
          <Link href="/profile" className={ui.linkAccent}>
            View profile & XP →
          </Link>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[var(--foreground)]">
              {progress.xpEarned} / {progress.xpTotal} XP
            </span>
            <span className="text-[var(--muted)]">{progress.percentComplete}% of path</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all"
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Recommended next:{' '}
          <span className="text-[var(--foreground)]">
            {progress.modules.find((m) => !m.completed)?.module.title ??
              'Path complete — revisit any module'}
          </span>
          {!progress.completedModuleIds.length && first
            ? ` (${first.minutes} min · ${first.skill}).`
            : '.'}
        </p>
      </section>

      <section>
        <h2 className={ui.pageTitle}>Modules</h2>
        <p className={`mt-1 ${ui.pageSubtitle}`}>
          Work in order for the full path, or jump to a skill you need now.
        </p>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2">
          {progress.modules.map(({ module: m, completed, bestScorePct }, idx) => (
            <li key={m.id}>
              <Link
                href={`/learn/${m.id}`}
                className={`${ui.card} block transition hover:border-[var(--primary)]`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-[var(--muted)]">
                    {idx + 1}. {m.skill} · {m.minutes} min · {m.xp} XP
                  </p>
                  {completed ? (
                    <span className="rounded-md bg-[var(--success-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--success-fg)]">
                      Done{bestScorePct != null ? ` · ${bestScorePct}%` : ''}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--muted)]">Not started</span>
                  )}
                </div>
                <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">{m.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{m.summary}</p>
                <p className="mt-3 text-sm font-semibold text-[var(--primary)]">
                  {completed ? 'Practice again →' : 'Practice →'}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
