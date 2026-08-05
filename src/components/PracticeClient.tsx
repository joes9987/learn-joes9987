'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import type { LearnModule } from '@/lib/modules'

type Stage = 'lesson' | 'quiz' | 'feedback' | 'summary'

export function PracticeClient ({ module }: { module: LearnModule }) {
  const [stage, setStage] = useState<Stage>('lesson')
  const [qi, setQi] = useState(0)
  const [choice, setChoice] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [pending, startTransition] = useTransition()
  const [eventError, setEventError] = useState<string | null>(null)

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
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          {stage === 'lesson' ? 'Lesson' : stage === 'summary' ? 'Summary' : `Question ${qi + 1}/${total}`}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{module.title}</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{module.summary}</p>
        {eventError ? (
          <p className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            Event note: {eventError}
          </p>
        ) : null}
      </div>

      {stage === 'lesson' ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-6">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {module.lesson.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <button
            type="button"
            className="mt-6 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]"
            onClick={() => setStage('quiz')}
          >
            Start quiz
          </button>
        </section>
      ) : null}

      {stage === 'quiz' && question ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-6">
          <p className="text-base font-medium">{question.prompt}</p>
          <ul className="mt-4 space-y-2">
            {question.choices.map((c, idx) => (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => setChoice(idx)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    choice === idx
                      ? 'border-[var(--primary)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border)] hover:border-[var(--primary)]/50'
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
            className="mt-6 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-40"
          >
            Submit answer
          </button>
        </section>
      ) : null}

      {stage === 'feedback' && question ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-6">
          <p className={`text-lg font-semibold ${lastCorrect ? 'text-[var(--primary)]' : 'text-amber-300'}`}>
            {lastCorrect ? 'Correct' : 'Not quite'}
          </p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{question.explain}</p>
          <button
            type="button"
            disabled={pending}
            onClick={nextAfterFeedback}
            className="mt-6 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]"
          >
            {qi + 1 >= total ? 'See summary' : 'Next question'}
          </button>
        </section>
      ) : null}

      {stage === 'summary' ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-6">
          <p className="text-lg font-semibold">Module complete</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Score {correctCount}/{total} ({scorePct}%). +{module.xp} XP toward your builder streak.
          </p>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Events fired: lesson_started, quiz_submitted, lesson_completed (+ heartbeats while open).
          </p>
          <a
            href="/learn"
            className="mt-6 inline-flex rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]"
          >
            Back to modules
          </a>
        </section>
      ) : null}
    </div>
  )
}
