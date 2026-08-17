import { DEMO_STOP_MARK, SpotMark } from '@/components/brand/illustrations'
import { DEMO_STOPS } from '@/lib/demo'
import { ui } from '@/lib/ui'

export function DemoWalkthrough () {
  return (
    <nav aria-label="Demo stops">
      <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Jump to a stop</h2>
      <ol className="mt-3 flex list-none flex-wrap items-start gap-3 p-0">
        {DEMO_STOPS.map((stop, index) => (
          <li key={stop.id} className="list-none">
            <a href={`#${stop.id}`} className={`inline-flex items-center gap-2 ${ui.btnSecondary}`}>
              <SpotMark kind={DEMO_STOP_MARK[stop.id] ?? 'brief'} className="h-8 w-8" />
              <span>
                {index + 1}. {stop.title}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
