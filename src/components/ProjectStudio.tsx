'use client'

import { useMemo, useState, useTransition } from 'react'
import { SpotMark } from '@/components/brand/illustrations'
import { FIRST_PROJECT, type ProjectStep } from '@/lib/first-project'
import { ui } from '@/lib/ui'

type ProjectStudioProps = {
  unlocked: boolean
  completedModuleCount: number
  initialStepIds: string[]
  initiallyComplete: boolean
  demo?: boolean
}

export function ProjectStudio ({
  unlocked,
  completedModuleCount,
  initialStepIds,
  initiallyComplete,
  demo = false
}: ProjectStudioProps) {
  const [doneIds, setDoneIds] = useState<string[]>(initialStepIds)
  const [complete, setComplete] = useState(initiallyComplete)
  const [activeId, setActiveId] = useState(
    FIRST_PROJECT.steps.find((step) => !initialStepIds.includes(step.id))?.id ??
      FIRST_PROJECT.steps[0].id
  )
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [affirmed, setAffirmed] = useState(initialStepIds.includes('self-check'))
  const [hintCount, setHintCount] = useState(0)
  const [status, setStatus] = useState('')
  const [pending, startTransition] = useTransition()
  const [eventError, setEventError] = useState<string | null>(null)

  const active = FIRST_PROJECT.steps.find((step) => step.id === activeId) ?? FIRST_PROJECT.steps[0]

  const announcement = useMemo(() => {
    if (complete) return `${FIRST_PROJECT.title} complete. Plus ${FIRST_PROJECT.xp} XP.`
    return `Step ${FIRST_PROJECT.steps.findIndex((s) => s.id === active.id) + 1} of ${FIRST_PROJECT.steps.length}: ${active.title}. ${status}`
  }, [active, complete, status])

  async function postEvent (event: string, metadata?: Record<string, unknown>) {
    if (demo) return true
    setEventError(null)
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, user_id: 'client', session_id: 'client', metadata })
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      setEventError(data.error ?? `Event failed (${res.status})`)
      return false
    }
    return true
  }

  function selectStep (step: ProjectStep) {
    setActiveId(step.id)
    setHintCount(0)
    setStatus(`Moved to ${step.title}`)
  }

  function saveStep () {
    if (!unlocked || doneIds.includes(active.id)) return
    if (active.input === 'textarea' && !drafts[active.id]?.trim()) return
    if (active.input === 'affirm' && !affirmed) return

    startTransition(async () => {
      const ok = await postEvent('project_step_completed', {
        projectId: FIRST_PROJECT.id,
        stepId: active.id
      })
      if (!ok) return
      const nextDone = [...new Set([...doneIds, active.id])]
      setDoneIds(nextDone)
      setStatus(`${active.title} saved.`)
      const remaining = FIRST_PROJECT.steps.find((step) => !nextDone.includes(step.id))
      if (remaining) {
        setActiveId(remaining.id)
        setHintCount(0)
        return
      }
      const finished = await postEvent('project_completed', { projectId: FIRST_PROJECT.id })
      if (finished) {
        setComplete(true)
        setStatus(`${FIRST_PROJECT.title} complete.`)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <section className={ui.cardElevated}>
        <div className="flex items-start gap-4">
          <SpotMark kind="project" className="h-16 w-16 shrink-0" />
          <div>
        <p className={ui.eyebrow}>First project</p>
        {demo ? (
          <p className="font-display mt-1 text-2xl font-bold text-[var(--foreground)]">
            {FIRST_PROJECT.title}
          </p>
        ) : (
          <h1 className="font-display mt-1 text-3xl font-bold leading-tight text-[var(--foreground)]">
            {FIRST_PROJECT.title}
          </h1>
        )}
        <p className={`mt-3 max-w-2xl ${ui.pageSubtitle}`}>{FIRST_PROJECT.summary}</p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {FIRST_PROJECT.xp} XP · {doneIds.length} of {FIRST_PROJECT.steps.length} steps
          {complete ? ' · complete' : ''}
          {demo ? ' · demo save stays in this tab' : ''}
        </p>
        {!unlocked ? (
          <p role="status" className={`mt-4 ${ui.alertWarning}`}>
            Unlocks after any {FIRST_PROJECT.unlockAfterModules} modules. You have finished{' '}
            {completedModuleCount}. Keep practicing — you can still read the steps.
          </p>
        ) : null}
        {eventError ? (
          <p role="alert" className={`mt-4 ${ui.alertWarning}`}>
            {eventError}
          </p>
        ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <nav className={ui.card} aria-label="Project steps">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Steps</h2>
          <ol className="mt-3 space-y-1">
            {FIRST_PROJECT.steps.map((step, index) => {
              const current = step.id === active.id
              const done = doneIds.includes(step.id)
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => selectStep(step)}
                    aria-current={current ? 'step' : undefined}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                      current
                        ? 'bg-[var(--nav-active)] font-semibold text-[var(--nav-active-fg)]'
                        : 'text-[var(--foreground)] hover:bg-[var(--nav-active)]/50'
                    }`}
                  >
                    {index + 1}. {step.title}
                    {done ? ' (done)' : ''}
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>

        <section className={ui.cardSolid} aria-labelledby="step-heading">
          <h2 id="step-heading" className="font-display text-lg font-semibold text-[var(--foreground)]">
            {active.title}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{active.prompt}</p>

          <div className="mt-4">
            <button
              type="button"
              className={ui.btnSecondary}
              aria-expanded={hintCount > 0}
              aria-controls="project-hints"
              onClick={() => setHintCount((n) => Math.min(n + 1, active.hints.length))}
              disabled={hintCount >= active.hints.length}
            >
              {hintCount >= active.hints.length
                ? 'All hints shown'
                : hintCount === 0
                  ? 'Show a hint'
                  : 'Show next hint'}
            </button>
            {hintCount > 0 ? (
              <ol id="project-hints" className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
                {active.hints.slice(0, hintCount).map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ol>
            ) : null}
          </div>

          {active.input === 'textarea' ? (
            <div className="mt-4">
              <label htmlFor={`step-${active.id}`} className="text-sm font-medium text-[var(--foreground)]">
                Your notes
              </label>
              <textarea
                id={`step-${active.id}`}
                rows={6}
                value={drafts[active.id] ?? ''}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [active.id]: e.target.value }))}
                disabled={!unlocked || doneIds.includes(active.id)}
                className={ui.field}
              />
            </div>
          ) : (
            <label className="mt-4 flex items-start gap-2 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={affirmed}
                onChange={(e) => setAffirmed(e.target.checked)}
                disabled={!unlocked || doneIds.includes(active.id)}
                className="mt-1"
              />
              <span>{active.doneLabel}</span>
            </label>
          )}

          <button
            type="button"
            className={`mt-6 ${ui.btnPrimaryLg}`}
            disabled={
              pending ||
              !unlocked ||
              doneIds.includes(active.id) ||
              (active.input === 'textarea' && !drafts[active.id]?.trim()) ||
              (active.input === 'affirm' && !affirmed)
            }
            onClick={saveStep}
          >
            {doneIds.includes(active.id)
              ? 'Step saved'
              : active.input === 'affirm'
                ? 'Mark self-check done'
                : active.doneLabel}
          </button>
        </section>
      </div>
    </div>
  )
}
