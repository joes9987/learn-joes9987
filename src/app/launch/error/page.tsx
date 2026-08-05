import Link from 'next/link'
import { SITE } from '@/lib/site'

type Props = { searchParams: Promise<{ reason?: string }> }

export default async function LaunchErrorPage ({ searchParams }: Props) {
  const { reason } = await searchParams
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Sign-in blocked</p>
      <h1 className="mt-2 text-2xl font-bold">Sign in with Ludwitt</h1>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">
        EudaLearn starts counted learning sessions via Ludwitt OAuth (or a valid platform launch token).
        {reason ? (
          <>
            {' '}
            Detail: <span className="font-mono text-[var(--foreground)]">{reason}</span>
          </>
        ) : null}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/api/auth/ludwitt"
          className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]"
        >
          Sign in with Ludwitt
        </a>
        {SITE.listingUrl ? (
          <a
            href={SITE.listingUrl}
            className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold"
          >
            Marketplace listing
          </a>
        ) : null}
        <Link
          href="/"
          className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold"
        >
          Home
        </Link>
      </div>
    </div>
  )
}
