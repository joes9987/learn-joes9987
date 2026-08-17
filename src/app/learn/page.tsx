import Link from 'next/link'
import { PracticeLoopFigure, SkillMark } from '@/components/brand/illustrations'
import { FIRST_PROJECT } from '@/lib/first-project'
import { listModules, nextIncompleteModule, TRACK, totalTrackXp } from '@/lib/modules'
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
  const xpTotal = totalTrackXp(modules) + FIRST_PROJECT.xp
  const minutes = modules.reduce((s, m) => s + m.minutes, 0)

  if (!session) {
    return (
      <section className={`${ui.cardElevated} px-6 py-10 sm:px-10`}>
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div>
            <p className={ui.eyebrow}>Path</p>
            <h1 className={ui.pageTitle}>{TRACK.title}</h1>
            <p className={`mt-3 ${ui.pageSubtitle}`}>{TRACK.blurb}</p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {modules.length} modules · ~{minutes} min · {xpTotal} XP including the first project.
              Create a Ludwitt account or sign in so practice sessions count.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="/signup" className={ui.btnPrimaryLg}>
                Sign up with Ludwitt
              </a>
              <a href="/login" className={ui.btnSecondary}>
                Sign in
              </a>
              <Link href="/accessibility" className={ui.btnSecondary}>
                Accessibility
              </Link>
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
          <PracticeLoopFigure idPrefix="learn-gate" />
        </div>
      </section>
    )
  }

  const progress = await getLearnerProgress(session.userId)
  const next = nextIncompleteModule(progress.modules)

  return (
    <div className="space-y-8">
      <section className={`${ui.cardElevated} px-6 py-10 sm:px-10`}>
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div>
            <p className={ui.eyebrow}>Path</p>
            <h1 className="font-display mt-1 text-3xl font-bold leading-tight text-[var(--foreground)]">
              {TRACK.title}
            </h1>
            <p className={`mt-3 max-w-2xl ${ui.pageSubtitle}`}>{TRACK.blurb}</p>
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
                  className="progress-fill h-full rounded-full transition-all"
                  style={{ width: `${progress.percentComplete}%` }}
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              Recommended next:{' '}
              <span className="text-[var(--foreground)]">
                {next?.title ?? 'Path complete — revisit any module or finish the first project'}
              </span>
              {!progress.completedModuleIds.length && first
                ? ` (${first.minutes} min · ${first.skill}).`
                : '.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {next ? (
                <Link href={`/learn/${next.id}`} className={ui.btnPrimaryLg}>
                  Continue: {next.title}
                </Link>
              ) : (
                <Link href="/project" className={ui.btnPrimaryLg}>
                  Open first project
                </Link>
              )}
              <Link href="/project" className={ui.btnSecondary}>
                {progress.projectCompleted
                  ? 'Project complete'
                  : progress.projectUnlocked
                    ? `Project · ${progress.projectStepIds.length}/${FIRST_PROJECT.steps.length}`
                    : 'First project'}
              </Link>
            </div>
          </div>
          <PracticeLoopFigure idPrefix="learn-path" />
        </div>
      </section>

      <section>
        <h2 className={ui.pageTitle}>Modules</h2>
        <p className={`mt-1 ${ui.pageSubtitle}`}>
          Work in order for the full path, or jump to a skill you need now. Each module has a short
          apply exercise after the quiz.
        </p>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2">
          {progress.modules.map(({ module: m, completed, exerciseCompleted, bestScorePct }, idx) => (
            <li key={m.id}>
              <Link
                href={`/learn/${m.id}`}
                className={`${ui.card} block transition hover:border-[var(--primary)]`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <SkillMark skill={m.skill} />
                    <p className="text-xs text-[var(--muted)]">
                      {idx + 1}. {m.skill} · {m.minutes} min · {m.xp} XP
                    </p>
                  </div>
                  {completed ? (
                    <span className="rounded-md bg-[var(--success-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--success-fg)]">
                      Done{bestScorePct != null ? ` · ${bestScorePct}%` : ''}
                      {exerciseCompleted ? ' · applied' : ''}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--muted)]">Not started</span>
                  )}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{m.title}</h3>
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
