import Link from 'next/link'
import { SITE } from '@/lib/site'
import { ui } from '@/lib/ui'

type Props = { searchParams: Promise<{ reason?: string }> }

export default async function LaunchErrorPage ({ searchParams }: Props) {
  const { reason } = await searchParams
  return (
    <div className={`${ui.cardElevated} mx-auto max-w-lg`}>
      <p className={ui.eyebrow}>Couldn&apos;t start session</p>
      <h1 className={`${ui.pageTitle} mt-2`}>Sign in with Ludwitt</h1>
      <p className={`mt-3 ${ui.pageSubtitle}`}>
        This launch link wasn&apos;t accepted. Sign in with Ludwitt to start a counted practice
        session.
        {reason ? (
          <>
            {' '}
            Detail: <span className="font-mono text-[var(--foreground)]">{reason}</span>
          </>
        ) : null}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/login" className={ui.btnPrimaryLg}>
          Sign in with Ludwitt
        </a>
        {SITE.listingUrl ? (
          <a href={SITE.listingUrl} className={ui.btnSecondary}>
            Marketplace listing
          </a>
        ) : null}
        <Link href="/" className={ui.btnSecondary}>
          Home
        </Link>
      </div>
    </div>
  )
}
