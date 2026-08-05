'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import type { LearnModule } from '@/lib/modules'
import { ui } from '@/lib/ui'

type Stage = 'lesson' | 'quiz' | 'feedback' | 'summary'

export function PracticeClient ({ module }: { module: LearnModule }) {
  const [stage, setStage] = useState<Stage>('lesson')
  const [qi, setQi] = useState(0)
  const [choice, setChoice] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [pending, startTransition] = useTransition()
  const [eventError, setEventError] = useState<string | null>(null)
  const [coachTip, setCoachTip] = useState<string | null>(null)
  const [coachNote, setCoachNote] = useState<string | null>(null)

  const question = module.quiz[qi]
  const total = module.quiz.length

  const scorePct = useMemo(
    () => (total === 0 ? 0 : Math.round((correctCount / total) * 100)),
    [correctCount, total]
  )

  useEffect(() => {
    void postEvent('lesson_started', { moduleId: module.id })
  }, [module.id])

  useEffect(() => {
    const id = window.setInterval(() => {
      void postEvent('session_heartbeat', { moduleId: module.id, stage })
    }, 60_000)
    return () => window.clearInterval(id)
  }, [module.id, stage])

  async function postEvent (event: string, metadata?: Record<string, unknown>) {
    setEventError(null)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, user_id: 'client', session_id: 'client', metadata })
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setEventError(data.error ?? `Event failed (${res.status})`)
      }
    } catch {
      setEventError('Network error posting event')
    }
  }

  async function fetchCoachTip (context: string) {
    setCoachNote(null)
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context })
      })
      const data = (await res.json().catch(() => ({}))) as {
        tip?: string
        error?: string
        code?: string
      }
      if (!res.ok) {
        setCoachTip(null)
        if (data.code === 'INSUFFICIENT_PAID_CREDITS' || res.status === 402) {
          setCoachNote('Coach tip unavailable — top up Ludwitt credits to enable tips.')
        } else {
          setCoachNote('Coach tip unavailable right now. Keep going with the explanation above.')
        }
        return
      }
      setCoachTip(data.tip ?? null)
    } catch {
      setCoachNote('Coach tip unavailable right now. Keep going with the explanation above.')
    }
  }

  function submitAnswer () {
    if (choice === null || !question) return
    const ok = choice === question.answer
    setLastCorrect(ok)
    if (ok) setCorrectCount((c) => c + 1)
    startTransition(async () => {
      await postEvent('quiz_submitted', {
        moduleId: module.id,
        questionId: question.id,
        correct: ok,
        choice
      })
      await fetchCoachTip(
        `Module ${module.title}. Question: ${question.prompt}. Learner was ${ok ? 'correct' : 'incorrect'}. Explanation: ${question.explain}`
      )
      setStage('feedback')
    })
  }

  function nextAfterFeedback () {
    if (qi + 1 >= total) {
      const finalCorrect = correctCount
      startTransition(async () => {
        await postEvent('lesson_completed', {
          moduleId: module.id,
          correctCount: finalCorrect,
          total,
          scorePct: total ? Math.round((finalCorrect / total) * 100) : 0
        })
        setStage('summary')
      })
      return
    }
    setQi((i) => i + 1)
    setChoice(null)
    setLastCorrect(null)
    setStage('quiz')
  }

  return (
    <div className="space-y-6">
      <div className={ui.card}>
        <p className={ui.eyebrow}>
          {stage === 'lesson' ? 'Lesson' : stage === 'summary' ? 'Summary' : `Question ${qi + 1}/${total}`}
        </p>
        <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">
          {module.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{module.summary}</p>
        {eventError ? (
          <p className={`mt-3 ${ui.alertWarning}`}>
            Practice is still available — session sync hit a snag. You can continue.
          </p>
        ) : null}
      </div>

      {stage === 'lesson' ? (
        <section className={ui.cardSolid}>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {module.lesson.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <button type="button" className={`mt-6 ${ui.btnPrimaryLg}`} onClick={() => setStage('quiz')}>
            Start quiz
          </button>
        </section>
      ) : null}

      {stage === 'quiz' && question ? (
        <section className={ui.cardSolid}>
          <p className="text-base font-medium text-[var(--foreground)]">{question.prompt}</p>
          <ul className="mt-4 space-y-2">
            {question.choices.map((c, idx) => (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => setChoice(idx)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    choice === idx
                      ? 'border-[var(--primary)] bg-[var(--accent-soft)] text-[var(--foreground)]'
                      : 'border-[var(--border)] bg-[var(--card-solid)] text-[var(--foreground)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={choice === null || pending}
            onClick={submitAnswer}
            className={`mt-6 ${ui.btnPrimaryLg}`}
          >
            Submit answer
          </button>
        </section>
      ) : null}

      {stage === 'feedback' && question ? (
        <section className={ui.cardSolid}>
          <p
            className={`text-lg font-semibold ${lastCorrect ? 'text-[var(--primary)]' : 'text-[var(--warning-fg)]'}`}
          >
            {lastCorrect ? 'Correct' : 'Not quite'}
          </p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{question.explain}</p>
          {coachTip ? (
            <p className="mt-4 rounded-xl border border-[var(--primary)]/30 bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--primary)]">Ludwitt coach · </span>
              {coachTip}
            </p>
          ) : null}
          {coachNote ? <p className="mt-3 text-xs text-[var(--muted)]">{coachNote}</p> : null}
          <button
            type="button"
            disabled={pending}
            onClick={nextAfterFeedback}
            className={`mt-6 ${ui.btnPrimaryLg}`}
          >
            {qi + 1 >= total ? 'See summary' : 'Next question'}
          </button>
        </section>
      ) : null}

      {stage === 'summary' ? (
        <section className={ui.cardSolid}>
          <p className="text-lg font-semibold text-[var(--foreground)]">Module complete</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Score {correctCount}/{total} ({scorePct}%). +{module.xp} XP for this module.
          </p>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Session recorded for your Ludwitt practice.
          </p>
          <a href="/learn" className={`mt-6 inline-flex ${ui.btnPrimaryLg}`}>
            Back to modules
          </a>
        </section>
      ) : null}
    </div>
  )
}
