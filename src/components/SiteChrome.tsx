import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SITE } from '@/lib/site'
import { ui } from '@/lib/ui'

const NAV = [
  { href: '/learn', label: 'Learn' },
  { href: '/login', label: 'Sign in' }
]

export function SiteChrome ({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="app-header sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="brand-mark" aria-hidden>
              EL
            </span>
            <span className="font-display text-base font-bold">
              <span className="text-gradient">{SITE.name}</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={ui.navLink}>
                {item.label}
              </Link>
            ))}
            <a href={SITE.marketUrl} target="_blank" rel="noreferrer" className={ui.navLink}>
              EudaMarket
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {SITE.listingUrl ? (
              <a
                href={SITE.listingUrl}
                target="_blank"
                rel="noreferrer"
                className={ui.btnPrimary}
              >
                Marketplace
              </a>
            ) : null}
          </div>
        </div>
        <nav
          className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 px-4 pb-3 sm:hidden sm:px-6"
          aria-label="Primary mobile"
        >
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={ui.navLink}>
              {item.label}
            </Link>
          ))}
          <a href={SITE.marketUrl} target="_blank" rel="noreferrer" className={ui.navLink}>
            EudaMarket
          </a>
        </nav>
      </header>
      <main className={`flex-1 ${ui.pageMain}`}>{children}</main>
      <footer className="mt-8 border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <p className="font-display text-lg font-semibold">
              <span className="text-gradient">{SITE.name}</span>
            </p>
            <p className="mt-1 max-w-sm text-sm text-[var(--muted)]">
              {SITE.cohort}. Part of the Euda suite with Market, PM, and Chat.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <a className={ui.linkAccent} href={SITE.marketUrl} target="_blank" rel="noreferrer">
              EudaMarket
            </a>
            <a className={ui.linkAccent} href={SITE.pmUrl} target="_blank" rel="noreferrer">
              EudaPM
            </a>
            <a className={ui.linkAccent} href={SITE.chatUrl} target="_blank" rel="noreferrer">
              EudaChat
            </a>
            {SITE.listingUrl ? (
              <a className={ui.linkAccent} href={SITE.listingUrl} target="_blank" rel="noreferrer">
                Ludwitt listing
              </a>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  )
}
