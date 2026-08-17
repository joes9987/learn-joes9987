/** Shared Tailwind class strings — same Euda suite theme as Market/PM/Chat. */

export const ui = {
  pageMain: 'mx-auto max-w-5xl px-4 py-10 sm:px-6',
  pageTitle: 'font-display text-2xl font-semibold tracking-tight text-[var(--foreground)]',
  pageSubtitle: 'text-sm text-[var(--muted-foreground)]',
  eyebrow: 'text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]',

  card: 'surface-card rounded-2xl p-6',
  cardSm: 'surface-card rounded-xl p-4',
  cardSolid: 'surface-card-solid rounded-2xl p-6',
  cardElevated: 'surface-elevated rounded-2xl p-8',

  btnPrimary:
    'btn-primary rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-fg)] shadow-sm transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50',
  btnPrimaryLg:
    'btn-primary rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-fg)] shadow-md transition hover:bg-[var(--primary-hover)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50',
  btnSecondary:
    'rounded-xl border border-[var(--border-strong)] bg-[var(--card-solid)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]',

  navLink:
    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--nav-active)] hover:text-[var(--nav-active-fg)]',
  linkAccent:
    'font-semibold text-[var(--primary)] underline decoration-[var(--primary)]/30 underline-offset-2 hover:decoration-[var(--primary)]',

  alertWarning:
    'rounded-xl border border-amber-500/20 bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning-fg)]',
  alertError: 'rounded-xl bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]',
  field:
    'mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--input-bg)] px-3.5 py-2.5 text-[var(--input-fg)] shadow-sm transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)]'
} as const
