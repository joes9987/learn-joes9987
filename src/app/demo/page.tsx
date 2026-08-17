import Link from 'next/link'
import {
  ACCESS_MARKS,
  PracticeLoopFigure,
  SpotMark
} from '@/components/brand/illustrations'
import { DemoWalkthrough } from '@/components/DemoWalkthrough'
import { NewTabHint } from '@/components/NewTabHint'
import { PracticeClient } from '@/components/PracticeClient'
import { ProjectStudio } from '@/components/ProjectStudio'
import { DEMO_COACH_TIP, demoFixtureProgress } from '@/lib/demo'
import { FIRST_PROJECT } from '@/lib/first-project'
import { getModule, listModules, TRACK, totalTrackXp } from '@/lib/modules'
import { SITE } from '@/lib/site'
import { ui } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Investor demo',
  description:
    'Eight-minute walkthrough of EudaLearn — practice loop, accessible first project, XP, and Ludwitt listing. No account required.'
}

const SCRIPT_STEPS = [
  { label: 'Skip + Access', detail: 'Open this page, Tab to Skip to main content, then jump to Access.' },
  { label: 'Quiz', detail: 'On Practice, answer one quiz question — hear Correct or Not quite.' },
  { label: 'Apply hint', detail: 'Show an apply hint and the Ludwitt listing review line on the summary.' },
  { label: 'Project hint', detail: 'On First project, open one hint. No GitHub or Vercel deploy.' },
  { label: 'Suite', detail: 'Suite stop: listing + Market / PM / Chat.' },
  { label: 'Sign up', detail: 'Offer Sign up only if they want a counted session.' }
] as const

export default function DemoPage () {
  const modules = listModules()
  const brief = getModule('prompt-briefs')
  const fixture = demoFixtureProgress()
  const minutes = modules.reduce((sum, m) => sum + m.minutes, 0)

  return (
    <div className="space-y-10">
      <section className={`${ui.cardElevated} px-6 py-10 sm:px-10`}>
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div>
            <p className={ui.eyebrow}>Investor demo</p>
            <h1 className="font-display mt-1 text-3xl font-bold leading-tight text-[var(--foreground)] sm:text-4xl">
              EudaLearn in eight minutes
            </h1>
            <p className={`mt-3 max-w-xl ${ui.pageSubtitle}`}>
              Click through the real practice UI. No Ludwitt account, no counted events.
            </p>
            <p role="status" className={`mt-4 ${ui.alertWarning}`}>
              Demo mode only — no learning events are recorded. Sign up afterward if you want a
              counted session.
            </p>
          </div>
          <PracticeLoopFigure idPrefix="demo-loop" />
        </div>

        <div id="wedge" tabIndex={-1} className="mt-8 border-t border-[var(--border)] pt-6">
          <h2 className={ui.pageTitle}>1. The wedge</h2>
          <p className="mt-2 text-[var(--foreground)]">{TRACK.blurb}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {modules.length} modules · ~{minutes} min · {totalTrackXp() + FIRST_PROJECT.xp} XP
            including the first project.
          </p>
        </div>

        <div id="access" tabIndex={-1} className="mt-6">
          <h2 className={ui.pageTitle}>2. Keyboard and screen readers</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
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
          <p className="mt-4">
            <Link href="/accessibility" className={ui.linkAccent}>
              Full accessibility how-to →
            </Link>
          </p>
        </div>
      </section>

      <section aria-labelledby="script-heading">
        <h2 id="script-heading" className={ui.pageTitle}>
          Live-call script
        </h2>
        <ol className="mt-4 flex list-none flex-wrap items-start gap-2 p-0">
          {SCRIPT_STEPS.map((step, index) => (
            <li key={step.label}>
              <span className="inline-flex rounded-xl border border-[var(--border-strong)] bg-[var(--card-solid)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)]">
                {index + 1}. {step.label}
              </span>
            </li>
          ))}
        </ol>
        <details className="mt-3 text-sm text-[var(--muted-foreground)]">
          <summary className="cursor-pointer font-medium text-[var(--foreground)]">
            Full caller notes
          </summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {SCRIPT_STEPS.map((step) => (
              <li key={step.label}>{step.detail}</li>
            ))}
          </ol>
        </details>
      </section>

      <DemoWalkthrough />

      <section id="practice" className="space-y-4" tabIndex={-1} aria-labelledby="practice-heading">
        <div>
          <h2 id="practice-heading" className={ui.pageTitle}>
            3. Practice loop
          </h2>
          <p className={`mt-2 ${ui.pageSubtitle}`}>
            One question, then apply, then summary — events and the credit coach are off.
          </p>
        </div>
        {brief ? (
          <PracticeClient
            module={brief}
            nextModule={null}
            projectUnlocked
            exerciseAlreadyDone={false}
            listingUrl={SITE.listingUrl}
            demo
            demoCoachTip={DEMO_COACH_TIP}
          />
        ) : null}
      </section>

      <section id="project" className="space-y-4" tabIndex={-1} aria-labelledby="project-heading">
        <div>
          <h2 id="project-heading" className={ui.pageTitle}>
            4. First project
          </h2>
          <p className={`mt-2 ${ui.pageSubtitle}`}>
            In-app studio with labeled fields. Saves stay in this tab.
          </p>
        </div>
        <ProjectStudio
          unlocked
          completedModuleCount={2}
          initialStepIds={[]}
          initiallyComplete={false}
          demo
        />
      </section>

      <section id="progress" className={ui.card} tabIndex={-1} aria-labelledby="progress-heading">
        <div className="flex items-start gap-4">
          <SpotMark kind="xp" className="h-16 w-16 shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 id="progress-heading" className={ui.pageTitle}>
              5. XP and proof
            </h2>
            <p className={`mt-2 ${ui.pageSubtitle}`}>
              Fixture snapshot — live XP writes only after Ludwitt sign-in.
            </p>
            <div className="mt-5">
              <div className="flex items-end justify-between gap-3">
                <p className="font-display text-4xl font-bold leading-tight text-[var(--foreground)]">
                  {fixture.xpEarned}
                  <span className="text-lg font-semibold text-[var(--muted)]">
                    {' '}
                    / {fixture.xpTotal} XP
                  </span>
                </p>
                <p className="text-sm text-[var(--muted)]">{fixture.percent}% complete</p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className="progress-fill h-full rounded-full"
                  style={{ width: `${fixture.percent}%` }}
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              {fixture.modulesCompleted} modules · {fixture.exercisesCompleted} exercise · project{' '}
              {fixture.projectSteps}/{fixture.projectTotal}
            </p>
          </div>
        </div>
      </section>

      <section id="suite" className={ui.card} tabIndex={-1} aria-labelledby="suite-heading">
        <div className="flex items-start gap-4">
          <SpotMark kind="suite" className="h-16 w-16 shrink-0" />
          <div>
            <h2 id="suite-heading" className={ui.pageTitle}>
              6. Suite and listing
            </h2>
            <p className={`mt-2 ${ui.pageSubtitle}`}>
              Learn is counted practice. Market, PM, and Chat prove we can ship.
            </p>
          </div>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li>
            <a
              href={SITE.listingUrl}
              target="_blank"
              rel="noreferrer"
              className={`${ui.cardSm} block transition hover:border-[var(--primary)]`}
            >
              <p className="font-semibold text-[var(--foreground)]">Ludwitt listing</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Canonical entry and reviews.
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                Open listing
                <NewTabHint />
              </p>
            </a>
          </li>
          <li>
            <a
              href={SITE.marketUrl}
              target="_blank"
              rel="noreferrer"
              className={`${ui.cardSm} block transition hover:border-[var(--primary)]`}
            >
              <p className="font-semibold text-[var(--foreground)]">EudaMarket</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Showcase and suite directory.</p>
              <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                Open Market
                <NewTabHint />
              </p>
            </a>
          </li>
          <li>
            <a
              href={SITE.pmUrl}
              target="_blank"
              rel="noreferrer"
              className={`${ui.cardSm} block transition hover:border-[var(--primary)]`}
            >
              <p className="font-semibold text-[var(--foreground)]">EudaPM</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Tasks and deadlines.</p>
              <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                Open PM
                <NewTabHint />
              </p>
            </a>
          </li>
          <li>
            <a
              href={SITE.chatUrl}
              target="_blank"
              rel="noreferrer"
              className={`${ui.cardSm} block transition hover:border-[var(--primary)]`}
            >
              <p className="font-semibold text-[var(--foreground)]">EudaChat</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Channels and DMs.</p>
              <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                Open Chat
                <NewTabHint />
              </p>
            </a>
          </li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/signup" className={ui.btnPrimaryLg}>
            Sign up for a counted session
          </Link>
          <Link href="/" className={ui.btnSecondary}>
            Back to home
          </Link>
        </div>
      </section>
    </div>
  )
}
