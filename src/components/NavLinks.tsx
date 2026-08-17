'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ui } from '@/lib/ui'

export function NavLinks ({
  items,
  ariaLabel
}: {
  items: { href: string; label: string }[]
  ariaLabel: string
}) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-wrap items-center gap-1" aria-label={ariaLabel}>
      {items.map((item) => {
        const current =
          pathname === item.href ||
          (item.href !== '/' && pathname.startsWith(`${item.href}/`))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={ui.navLink}
            aria-current={current ? 'page' : undefined}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
