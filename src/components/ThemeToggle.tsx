'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

export function ThemeToggle ({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  if (!mounted) {
    return <div className={`h-9 w-9 rounded-xl border border-transparent ${className}`} aria-hidden />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--card-solid)] text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] ${className}`}
    >
      {isDark ? '☀' : '☾'}
    </button>
  )
}
