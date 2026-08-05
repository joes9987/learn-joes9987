import Link from 'next/link'
import { SITE } from '@/lib/site'

export function SiteChrome ({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="font-display text-base font-bold tracking-tight">
            <span className="text-gradient">{SITE.name}</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted-foreground)]">
            <Link href="/learn" className="hover:text-[var(--foreground)]">
              Learn
            </Link>
            <Link href="/login" className="hover:text-[var(--foreground)]">
              Sign in
            </Link>
            <a href={SITE.marketUrl} target="_blank" rel="noreferrer" className="hover:text-[var(--foreground)]">
              EudaMarket
            </a>
            {SITE.listingUrl ? (
              <a
                href={SITE.listingUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[var(--primary)] px-3 py-1.5 font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
              >
                Marketplace
              </a>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">{children}</main>
      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--muted)]">
        {SITE.cohort} · {SITE.name} · part of the Euda suite
      </footer>
    </div>
  )
}
