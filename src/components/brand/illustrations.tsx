/** Theme-aware SVGs. Strokes use CSS variables so light/dark both work. */

export type SpotKind = 'keyboard' | 'headings' | 'live' | 'brief' | 'xp' | 'suite' | 'project'
type GlyphKind = SpotKind | 'api' | 'auth' | 'launch' | 'telemetry' | 'deploy' | 'feedback' | 'structure'

export const ACCESS_MARKS = [
  { kind: 'keyboard' as const, title: 'Skip to main', text: 'First control on every page.' },
  { kind: 'headings' as const, title: 'Real headings', text: 'H and 1–3 jump the tree.' },
  { kind: 'live' as const, title: 'Live results', text: 'Quiz answers announce politely.' }
]

const SKILL_KIND: Record<string, GlyphKind> = {
  Briefing: 'brief',
  APIs: 'api',
  Auth: 'auth',
  Launch: 'launch',
  Telemetry: 'telemetry',
  Deploy: 'deploy',
  Suite: 'suite',
  Feedback: 'feedback',
  Structure: 'structure',
  Announcements: 'live'
}

function Halo ({ id }: { id: string }) {
  return (
    <radialGradient id={id} cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="var(--accent-soft)" />
      <stop offset="1" stopColor="transparent" />
    </radialGradient>
  )
}

export function PracticeLoopFigure ({
  className = 'mx-auto w-full max-w-sm',
  idPrefix = 'loop'
}: {
  className?: string
  idPrefix?: string
}) {
  const stem = `${idPrefix}-stem`
  const halo = `${idPrefix}-halo`

  return (
    <svg
      viewBox="0 0 360 360"
      className={className}
      fill="none"
      role="img"
      aria-label="Lesson, quiz, and apply connected in a practice loop"
    >
      <defs>
        <linearGradient id={stem} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
        <Halo id={halo} />
      </defs>

      <circle cx="180" cy="170" r="128" fill={`url(#${halo})`} />
      <ellipse
        cx="180"
        cy="178"
        rx="132"
        ry="52"
        stroke="var(--border)"
        strokeWidth="1.5"
        transform="rotate(-16 180 178)"
      />
      <ellipse
        cx="180"
        cy="178"
        rx="96"
        ry="36"
        stroke="var(--border)"
        strokeWidth="1.5"
        strokeDasharray="3 7"
        transform="rotate(-16 180 178)"
      />

      <circle cx="180" cy="178" r="58" stroke={`url(#${stem})`} strokeWidth="6" />
      <path
        d="M228 150 L 246 178 L 228 206"
        stroke={`url(#${stem})`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g transform="translate(48 48)">
        <rect width="72" height="56" rx="12" fill="var(--card)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <path d="M16 20 H 56 M 16 30 H 48 M 16 40 H 40" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform="translate(240 44)">
        <rect width="72" height="56" rx="12" fill="var(--card)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <circle cx="36" cy="28" r="10" stroke="var(--accent)" strokeWidth="3" />
        <path d="M36 24 V 30 H 40" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform="translate(144 248)">
        <rect width="72" height="56" rx="12" fill="var(--card)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <path
          d="M22 30 L 32 40 L 52 18"
          stroke="var(--success-fg)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <circle cx="56" cy="196" r="6" fill="var(--primary)" />
      <circle cx="312" cy="168" r="5" fill="var(--highlight)" opacity="0.85" />
      <circle cx="88" cy="88" r="4" fill="var(--highlight)" />
    </svg>
  )
}

function SpotGlyph ({ kind }: { kind: GlyphKind }) {
  const stroke = { stroke: 'var(--primary)', strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  switch (kind) {
    case 'keyboard':
      return (
        <g {...stroke}>
          <rect x="26" y="34" width="44" height="28" rx="6" />
          <path d="M34 44 H 38 M 44 44 H 48 M 54 44 H 58 M 38 54 H 58" />
        </g>
      )
    case 'headings':
      return (
        <g {...stroke}>
          <path d="M34 30 V 66 M 62 30 V 66 M 34 48 H 62" />
        </g>
      )
    case 'live':
      return (
        <g {...stroke}>
          <circle cx="48" cy="48" r="6" fill="var(--accent)" stroke="none" />
          <path d="M34 38 C 28 48 28 48 34 58" />
          <path d="M62 38 C 68 48 68 48 62 58" />
        </g>
      )
    case 'brief':
      return (
        <g {...stroke}>
          <rect x="30" y="26" width="36" height="44" rx="6" />
          <path d="M38 40 H 58 M 38 50 H 54" />
        </g>
      )
    case 'xp':
      return (
        <g {...stroke}>
          <path d="M48 26 L 56 42 H 40 Z" fill="var(--highlight)" stroke="var(--highlight)" />
          <path d="M32 62 H 64" />
        </g>
      )
    case 'suite':
      return (
        <g {...stroke}>
          <rect x="28" y="28" width="16" height="16" rx="3" />
          <rect x="52" y="28" width="16" height="16" rx="3" />
          <rect x="28" y="52" width="16" height="16" rx="3" />
          <rect x="52" y="52" width="16" height="16" rx="3" />
        </g>
      )
    case 'project':
      return (
        <g {...stroke}>
          <rect x="28" y="30" width="40" height="36" rx="6" />
          <path d="M36 30 V 26 H 60 V 30" />
          <path d="M36 48 H 60" />
        </g>
      )
    case 'api':
      return (
        <g {...stroke}>
          <circle cx="32" cy="48" r="8" />
          <circle cx="64" cy="36" r="7" />
          <circle cx="64" cy="60" r="7" />
          <path d="M40 48 H 56 M 58 40 L 42 50 M 58 56 L 42 46" />
        </g>
      )
    case 'auth':
      return (
        <g {...stroke}>
          <rect x="34" y="44" width="28" height="22" rx="4" />
          <path d="M40 44 V 38 C 40 32 56 32 56 38 V 44" />
        </g>
      )
    case 'launch':
      return (
        <g {...stroke}>
          <path d="M48 26 L 60 58 H 36 Z" />
          <path d="M48 58 V 70" />
        </g>
      )
    case 'telemetry':
      return (
        <g {...stroke}>
          <path d="M28 62 V 48 M 40 62 V 36 M 52 62 V 44 M 64 62 V 30" />
        </g>
      )
    case 'deploy':
      return (
        <g {...stroke}>
          <path d="M48 28 V 60 M 36 40 L 48 28 L 60 40" />
          <path d="M32 68 H 64" />
        </g>
      )
    case 'feedback':
      return (
        <g {...stroke}>
          <rect x="28" y="30" width="40" height="28" rx="8" />
          <path d="M40 58 L 40 68 L 50 58" />
        </g>
      )
    case 'structure':
      return (
        <g {...stroke}>
          <path d="M48 26 V 70 M 48 42 H 68 M 48 58 H 68 M 48 42 H 28" />
        </g>
      )
    default:
      return <circle cx="48" cy="48" r="8" fill="var(--primary)" />
  }
}

export function SpotMark ({
  kind,
  className = 'h-16 w-16',
  label
}: {
  kind: SpotKind
  className?: string
  label?: string
}) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <circle cx="48" cy="48" r="44" fill="var(--accent-soft)" />
      <SpotGlyph kind={kind} />
    </svg>
  )
}

export function SkillMark ({
  skill,
  className = 'h-8 w-8 shrink-0'
}: {
  skill: string
  className?: string
}) {
  const kind = SKILL_KIND[skill] ?? 'brief'
  return (
    <svg viewBox="0 0 96 96" className={className} fill="none" aria-hidden>
      <circle cx="48" cy="48" r="44" fill="var(--accent-soft)" />
      <SpotGlyph kind={kind} />
    </svg>
  )
}

export const DEMO_STOP_MARK: Record<string, SpotKind> = {
  wedge: 'brief',
  access: 'keyboard',
  practice: 'brief',
  project: 'project',
  progress: 'xp',
  suite: 'suite'
}

export const STAGE_MARK: Record<string, SpotKind> = {
  lesson: 'brief',
  quiz: 'live',
  feedback: 'live',
  apply: 'project',
  summary: 'xp'
}
