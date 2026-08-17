import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SpotMark } from '@/components/brand/illustrations'
import { NewTabHint } from '@/components/NewTabHint'
import { FIRST_PROJECT } from '@/lib/first-project'
import { EXERCISE_XP, TRACK } from '@/lib/modules'
import { getLearnerProgress } from '@/lib/progress'
import { getSession } from '@/lib/session'
import { SITE } from '@/lib/site'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Profile',
  description: 'Your EudaLearn XP, path progress, exercises, and first project.'
}

export default async function ProfilePage () {
  const session = await getSession()
  if (!session) redirect('/login')

  const progress = await getLearnerProgress(session.userId)
  const exerciseTotal = progress.modules.filter((row) => row.module.exercise).length
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
        <h1 className="font-display mt-1 text-3xl font-bold leading-tight text-[var(--foreground)]">
          {session.email}
        </h1>
        <p className={`mt-2 ${ui.pageSubtitle}`}>
          Ludwitt identity synced · user id{' '}
          <span className="font-mono text-xs text-[var(--foreground)]">{session.userId}</span>
        </p>
        <p className="mt-4 max-w-2xl text-sm text-[var(--muted-foreground)]">
          Path: <span className="text-[var(--foreground)]">{TRACK.title}</span> — {TRACK.blurb}
        </p>
      </section>

      <section className={ui.card}>
        <div className="flex items-start gap-4">
          <SpotMark kind="xp" className="h-16 w-16 shrink-0" />
          <div>
            <h2 className={ui.pageTitle}>XP progression</h2>
            <p className={`mt-1 ${ui.pageSubtitle}`}>
              Module XP once per lesson completed. Apply exercises add {EXERCISE_XP} XP each. First
              project adds {FIRST_PROJECT.xp} XP when every step is done.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex items-end justify-between gap-3">
            <p className="font-display text-4xl font-bold leading-tight text-[var(--foreground)]">
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
              className="progress-fill h-full rounded-full"
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Exercises {progress.exerciseCompletedIds.length} / {exerciseTotal}
        </p>
        <ul className="mt-6 space-y-2">
          {progress.modules.map(({ module: m, completed, exerciseCompleted, bestScorePct }) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium text-[var(--foreground)]">{m.title}</span>
                <span className="ml-2 text-[var(--muted)]">
                  {m.skill} · {m.xp} XP
                  {m.exercise ? ` + ${EXERCISE_XP} apply` : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {completed ? (
                  <span className="text-[var(--success-fg)]">
                    +{m.xp} XP{bestScorePct != null ? ` · best ${bestScorePct}%` : ''}
                    {exerciseCompleted ? ' · applied' : ''}
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
        <h2 className={ui.pageTitle}>{FIRST_PROJECT.title}</h2>
        <p className={`mt-1 ${ui.pageSubtitle}`}>{FIRST_PROJECT.summary}</p>
        <ol className="mt-4 space-y-2">
          {FIRST_PROJECT.steps.map((step, index) => {
            const done = progress.projectStepIds.includes(step.id)
            return (
              <li
                key={step.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              >
                <span className="text-[var(--foreground)]">
                  {index + 1}. {step.title}
                </span>
                <span className={done ? 'text-[var(--success-fg)]' : 'text-[var(--muted)]'}>
                  {done ? 'Done' : 'Open'}
                </span>
              </li>
            )
          })}
        </ol>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {progress.projectCompleted
            ? `Complete · +${FIRST_PROJECT.xp} XP`
            : progress.projectUnlocked
              ? `${progress.projectStepIds.length} of ${FIRST_PROJECT.steps.length} steps`
              : `Unlocks after ${FIRST_PROJECT.unlockAfterModules} modules`}
        </p>
        <Link href="/project" className={`mt-4 inline-flex ${ui.btnPrimary}`}>
          Open project
        </Link>
      </section>

      <section className={ui.card}>
        <div className="flex items-start gap-4">
          <SpotMark kind="suite" className="h-16 w-16 shrink-0" />
          <div>
            <h2 className={ui.pageTitle}>Euda profile sync</h2>
            <p className={`mt-1 ${ui.pageSubtitle}`}>
              Learn sessions use your Ludwitt account. Other Euda apps keep their own host sessions —
              open them below to sync your work across the suite (no silent cross-site SSO).
            </p>
          </div>
        </div>
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
                <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                  Open
                  <NewTabHint />
                  {' →'}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
