import Link from 'next/link'
import { ACCESS_MARKS, PracticeLoopFigure, SkillMark, SpotMark } from '@/components/brand/illustrations'
import { NewTabHint } from '@/components/NewTabHint'
import { FIRST_PROJECT } from '@/lib/first-project'
import { listModules, nextIncompleteModule, TRACK, totalTrackXp } from '@/lib/modules'
import { getLearnerProgress } from '@/lib/progress'
import { getSession } from '@/lib/session'
import { SITE } from '@/lib/site'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function HomePage () {
  const modules = listModules()
  const listing = SITE.listingUrl
  const minutes = modules.reduce((s, m) => s + m.minutes, 0)
  const session = await getSession()
  const progress = session ? await getLearnerProgress(session.userId) : null
  const next = progress ? nextIncompleteModule(progress.modules) : null

  return (
    <div className="space-y-10">
      <section className={`${ui.cardElevated} px-6 py-10 sm:px-10`}>
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div>
            <p className={ui.eyebrow}>{SITE.cohort}</p>
            <h1 className="font-display mt-3 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
              <span className="text-gradient">{SITE.name}</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-[var(--muted-foreground)]">{SITE.tagline}</p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {modules.length} modules · ~{minutes} min · {totalTrackXp() + FIRST_PROJECT.xp} XP
              including the first project.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/learn" className={ui.btnPrimaryLg}>
                Start practicing
              </Link>
              <Link href="/demo" className={ui.btnSecondary}>
                Investor demo
              </Link>
              {session ? (
                <Link href="/project" className={ui.btnSecondary}>
                  First project
                </Link>
              ) : (
                <>
                  <a href="/signup" className={ui.btnSecondary}>
                    Sign up with Ludwitt
                  </a>
                  <a href="/login" className={ui.btnSecondary}>
                    Sign in
                  </a>
                </>
              )}
              {listing ? (
                <a href={listing} target="_blank" rel="noreferrer" className={ui.btnSecondary}>
                  Marketplace listing
                  <NewTabHint />
                </a>
              ) : null}
            </div>
          </div>
          <PracticeLoopFigure idPrefix="home-loop" />
        </div>
      </section>

      <section className={ui.card}>
        <h2 className={ui.pageTitle}>Works with keyboard and screen readers</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {ACCESS_MARKS.map((mark) => (
            <li key={mark.kind} className="flex gap-3">
              <SpotMark kind={mark.kind} className="h-14 w-14 shrink-0" />
              <div>
                <p className="font-semibold text-[var(--foreground)]">{mark.title}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{mark.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5">
          <Link href="/accessibility" className={ui.linkAccent}>
            How to use EudaLearn with a screen reader →
          </Link>
        </p>
      </section>

      {session && progress ? (
        <section className={ui.cardSolid}>
          <h2 className={ui.pageTitle}>{FIRST_PROJECT.title}</h2>
          <p className={`mt-2 ${ui.pageSubtitle}`}>{FIRST_PROJECT.summary}</p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {progress.projectCompleted
              ? 'Project complete.'
              : progress.projectUnlocked
                ? `${progress.projectStepIds.length} of ${FIRST_PROJECT.steps.length} steps done.`
                : `Unlocks after any ${FIRST_PROJECT.unlockAfterModules} modules. ${progress.completedModuleIds.length} done so far.`}
            {next ? ` Recommended next module: ${next.title}.` : ''}
          </p>
          <Link href="/project" className={`mt-4 inline-flex ${ui.btnPrimary}`}>
            {progress.projectUnlocked ? 'Open first project' : 'View project'}
          </Link>
        </section>
      ) : null}

      <section>
        <h2 className={ui.pageTitle}>{TRACK.title}</h2>
        <p className={`mt-2 ${ui.pageSubtitle}`}>{TRACK.blurb}</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {modules.map((m) => (
            <li key={m.id}>
              <Link
                href={session ? `/learn/${m.id}` : '/learn'}
                className={`${ui.card} block transition hover:border-[var(--primary)]`}
              >
                <div className="flex items-center gap-3">
                  <SkillMark skill={m.skill} />
                  <p className="text-xs text-[var(--muted)]">
                    {m.order}. {m.skill} · {m.minutes} min · {m.xp} XP
                  </p>
                </div>
                <h3 className="mt-2 font-semibold text-[var(--foreground)]">{m.title}</h3>
                <p className="mt-3 text-sm font-semibold text-[var(--primary)]">Practice →</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
