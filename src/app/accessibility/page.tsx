import type { Metadata } from 'next'
import Link from 'next/link'
import { ACCESS_MARKS, SpotMark } from '@/components/brand/illustrations'
import { SITE } from '@/lib/site'
import { ui } from '@/lib/ui'

export const metadata: Metadata = {
  title: 'Accessibility',
  description:
    'How to use EudaLearn with a keyboard and a screen reader. WCAG 2.2 AA intent — not a certified audit.'
}

export default function AccessibilityPage () {
  return (
    <article className={`${ui.cardElevated} max-w-3xl space-y-6`}>
      <p className={ui.eyebrow}>Access</p>
      <h1 className={`${ui.pageTitle} text-3xl leading-tight`}>Built for keyboard and screen readers</h1>
      <p className={ui.pageSubtitle}>
        {SITE.name} is practice you can finish without a mouse. We aim for WCAG 2.2 Level AA on
        structure, names, focus, and announcements. This is an honest intent statement — not a
        certified audit.
      </p>
      <ul className="grid gap-4 sm:grid-cols-3">
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

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Skip and landmarks</h2>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          Tab once to hear <strong className="text-[var(--foreground)]">Skip to main content</strong>.
          It moves focus to <span className="font-mono text-xs">#main-content</span>. Primary
          navigation uses <span className="font-mono text-xs">aria-current=&quot;page&quot;</span> on
          the active route.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Headings</h2>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          Use the <kbd className="rounded border border-[var(--border-strong)] px-1">H</kbd> key to
          jump headings, or{' '}
          <kbd className="rounded border border-[var(--border-strong)] px-1">1</kbd>–
          <kbd className="rounded border border-[var(--border-strong)] px-1">3</kbd> for levels.
          Each practice view has one <span className="font-mono text-xs">h1</span> (module or
          project title) and visible <span className="font-mono text-xs">h2</span> sections for
          lesson, quiz, apply, and summary.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Practice controls</h2>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          Quiz choices are a radiogroup. Submit, hints, and “mark done” are named buttons — not
          icon-only. Theme toggle announces light or dark and uses{' '}
          <span className="font-mono text-xs">aria-pressed</span>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Live results</h2>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          Correct / Not quite, coach tips, and project step saves are announced in a polite live
          region. Form errors use <span className="font-mono text-xs">role=&quot;alert&quot;</span>.
          Success uses <span className="font-mono text-xs">role=&quot;status&quot;</span>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">First project</h2>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          The first project is entirely in this app. You do not need GitHub, Vercel, or a visual
          deploy to complete it. Unlock it after any two modules.
        </p>
      </section>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/learn" className={ui.btnPrimaryLg}>
          Start the path
        </Link>
        <Link href="/project" className={ui.btnSecondary}>
          First project
        </Link>
      </div>
    </article>
  )
}
