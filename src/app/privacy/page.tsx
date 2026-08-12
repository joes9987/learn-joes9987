import type { Metadata } from 'next'
import { SITE } from '@/lib/site'
import { ui } from '@/lib/ui'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How EudaLearn handles account and practice data.'
}

export default function PrivacyPage () {
  return (
    <article className={`${ui.cardElevated} prose-invert max-w-3xl space-y-4`}>
      <p className={ui.eyebrow}>Legal</p>
      <h1 className={`${ui.pageTitle} text-3xl`}>Privacy</h1>
      <p className={ui.pageSubtitle}>
        {SITE.name} is a Hult Summer Pilot learning app. This page explains what we store and why.
      </p>
      <section className="space-y-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Accounts</h2>
        <p>
          Sign-in uses Ludwitt OAuth. We store your Ludwitt user id (`sub`), email, and a short-lived
          session cookie so practice can be attributed. We do not sell personal data.
        </p>
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Practice events</h2>
        <p>
          When you start a lesson, submit a quiz, or finish a module, we record learning events
          (event name, session id, timestamps, optional module metadata) in our app-owned store so
          cohort metrics can be computed. Heartbeats may be recorded while a module is open.
        </p>
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Coach tips</h2>
        <p>
          Optional coach tips call Ludwitt&apos;s AI proxy with your Ludwitt access token. Usage may
          consume Ludwitt credits per Ludwitt&apos;s terms.
        </p>
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Contact</h2>
        <p>
          Questions: open an issue on{' '}
          <a className={ui.linkAccent} href="https://github.com/joes9987/learn-joes9987">
            github.com/joes9987/learn-joes9987
          </a>
          .
        </p>
      </section>
    </article>
  )
}
