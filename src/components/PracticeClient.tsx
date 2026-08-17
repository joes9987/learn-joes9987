'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { SkillMark, SpotMark, STAGE_MARK } from '@/components/brand/illustrations'
import { NewTabHint } from '@/components/NewTabHint'
import type { LearnModule } from '@/lib/modules'
import { EXERCISE_XP } from '@/lib/modules'
import { ui } from '@/lib/ui'

type Stage = 'lesson' | 'quiz' | 'feedback' | 'apply' | 'summary'

type PracticeClientProps = {
  module: LearnModule
  nextModule: { id: string; title: string } | null
  projectUnlocked: boolean
  exerciseAlreadyDone: boolean
  listingUrl?: string
  demo?: boolean
  demoCoachTip?: string
}

export function PracticeClient ({
  module,
  nextModule,
  projectUnlocked,
  exerciseAlreadyDone,
  listingUrl,
  demo = false,
  demoCoachTip
}: PracticeClientProps) {
  const [stage, setStage] = useState<Stage>('lesson')
  const [qi, setQi] = useState(0)
  const [choice, setChoice] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [pending, startTransition] = useTransition()
  const [eventError, setEventError] = useState<string | null>(null)
  const [coachTip, setCoachTip] = useState<string | null>(null)
  const [coachNote, setCoachNote] = useState<string | null>(null)
  const [exerciseText, setExerciseText] = useState('')
  const [hintCount, setHintCount] = useState(0)
  const [exerciseDone, setExerciseDone] = useState(exerciseAlreadyDone)
  const [applyStatus, setApplyStatus] = useState('')

  const question = module.quiz[qi]
  const total = demo ? 1 : module.quiz.length
  const exercise = module.exercise
  const TitleTag = demo ? 'h2' : 'h1'

  const scorePct = useMemo(
    () => (total === 0 ? 0 : Math.round((correctCount / total) * 100)),
    [correctCount, total]
  )

  const stageAnnouncement = useMemo(() => {
    if (stage === 'lesson') return `Lesson: ${module.title}`
    if (stage === 'quiz') return `Question ${qi + 1} of ${total}`
    if (stage === 'feedback') {
      const verdict = lastCorrect ? 'Correct' : 'Not quite'
      return `${verdict}. ${question?.explain ?? ''}`
    }
    if (stage === 'apply' && exercise) return `Apply: ${exercise.title}`
    return `Module complete. Score ${correctCount} of ${total}, ${scorePct} percent. Plus ${module.xp} XP.${
      exerciseDone && exercise ? ` Exercise complete, plus ${EXERCISE_XP} XP.` : ''
    }`
  }, [
    stage,
    module.title,
    module.xp,
    qi,
    total,
    lastCorrect,
    question?.explain,
    correctCount,
    scorePct,
    exercise,
    exerciseDone
  ])

  useEffect(() => {
    if (demo) return
    void postEvent('lesson_started', { moduleId: module.id })
  }, [demo, module.id])

  useEffect(() => {
    if (demo) return
    const id = window.setInterval(() => {
      void postEvent('session_heartbeat', { moduleId: module.id, stage })
    }, 60_000)
    return () => window.clearInterval(id)
  }, [demo, module.id, stage])

  async function postEvent (event: string, metadata?: Record<string, unknown>) {
    if (demo) return
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
    if (demo) {
      setCoachTip(demoCoachTip ?? null)
      setCoachNote(null)
      return
    }
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

  function goToSummary () {
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
  }

  function nextAfterFeedback () {
    if (qi + 1 >= total) {
      if (exercise && !exerciseDone) {
        setStage('apply')
        return
      }
      goToSummary()
      return
    }
    setQi((i) => i + 1)
    setChoice(null)
    setLastCorrect(null)
    setStage('quiz')
  }

  function completeExercise () {
    if (!exercise || !exerciseText.trim()) return
    startTransition(async () => {
      await postEvent('exercise_completed', { moduleId: module.id })
      setExerciseDone(true)
      setApplyStatus('Exercise saved.')
      goToSummary()
    })
  }

  const eyebrow =
    stage === 'lesson'
      ? 'Lesson'
      : stage === 'apply'
        ? 'Apply'
        : stage === 'summary'
          ? 'Summary'
          : `Question ${qi + 1} of ${total}`

  return (
    <div className="space-y-6">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {stageAnnouncement}
        {coachTip ? ` Ludwitt coach tip: ${coachTip}` : ''}
        {coachNote ? ` ${coachNote}` : ''}
        {applyStatus}
      </div>

      <div className={ui.card}>
        <div className="flex items-start gap-4">
          <SkillMark skill={module.skill} className="h-12 w-12 shrink-0" />
          <div className="min-w-0">
            <p className={`${ui.eyebrow} inline-flex items-center gap-2`}>
              <SpotMark kind={STAGE_MARK[stage] ?? 'brief'} className="h-6 w-6" />
              {eyebrow}
            </p>
            <TitleTag className="font-display mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">
              {module.title}
            </TitleTag>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{module.summary}</p>
          </div>
        </div>
        {eventError ? (
          <p role="status" className={`mt-3 ${ui.alertWarning}`}>
            Practice is still available — session sync hit a snag. You can continue.
          </p>
        ) : null}
      </div>

      {stage === 'lesson' ? (
        <section className={ui.cardSolid} aria-labelledby="lesson-heading">
          <h2 id="lesson-heading" className="font-display inline-flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
            <SpotMark kind="brief" className="h-8 w-8" />
            Lesson
          </h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
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
        <section className={ui.cardSolid} aria-labelledby={`q-${question.id}`}>
          <h2 id={`q-${question.id}`} className="text-base font-medium text-[var(--foreground)]">
            {question.prompt}
          </h2>
          <div
            role="radiogroup"
            aria-labelledby={`q-${question.id}`}
            className="mt-4 space-y-2"
          >
            {question.choices.map((c, idx) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={choice === idx}
                onClick={() => setChoice(idx)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                  choice === idx
                    ? 'border-[var(--primary)] bg-[var(--accent-soft)] text-[var(--foreground)]'
                    : 'border-[var(--border)] bg-[var(--card-solid)] text-[var(--foreground)] hover:border-[var(--primary)]/50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
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
        <section className={ui.cardSolid} aria-labelledby="feedback-heading">
          <h2
            id="feedback-heading"
            className={`text-lg font-semibold ${lastCorrect ? 'text-[var(--primary)]' : 'text-[var(--warning-fg)]'}`}
          >
            {lastCorrect ? 'Correct' : 'Not quite'}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{question.explain}</p>
          {coachTip ? (
            <p className="mt-4 rounded-xl border border-[var(--primary)]/30 bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--primary)]">Ludwitt coach · </span>
              {coachTip}
            </p>
          ) : null}
          {coachNote ? (
            <p role="status" className="mt-3 text-xs text-[var(--muted)]">
              {coachNote}
            </p>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={nextAfterFeedback}
            className={`mt-6 ${ui.btnPrimaryLg}`}
          >
            {qi + 1 >= total ? (exercise && !exerciseDone ? 'Apply this skill' : 'See summary') : 'Next question'}
          </button>
        </section>
      ) : null}

      {stage === 'apply' && exercise ? (
        <section className={ui.cardSolid} aria-labelledby="apply-heading">
          <h2 id="apply-heading" className="font-display inline-flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
            <SpotMark kind="project" className="h-8 w-8" />
            {exercise.title}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{exercise.prompt}</p>
          <div className="mt-4">
            <button
              type="button"
              className={ui.btnSecondary}
              aria-expanded={hintCount > 0}
              aria-controls="exercise-hints"
              onClick={() => setHintCount((n) => Math.min(n + 1, exercise.hints.length))}
              disabled={hintCount >= exercise.hints.length}
            >
              {hintCount >= exercise.hints.length
                ? 'All hints shown'
                : hintCount === 0
                  ? 'Show a hint'
                  : 'Show next hint'}
            </button>
            {hintCount > 0 ? (
              <ol id="exercise-hints" className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
                {exercise.hints.slice(0, hintCount).map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ol>
            ) : null}
          </div>
          <label className="mt-4 block text-sm font-medium text-[var(--foreground)]" htmlFor="exercise-response">
            Your response
          </label>
          <textarea
            id="exercise-response"
            rows={5}
            value={exerciseText}
            onChange={(e) => setExerciseText(e.target.value)}
            className={ui.field}
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending || !exerciseText.trim()}
              onClick={completeExercise}
              className={ui.btnPrimaryLg}
            >
              {exercise.doneLabel}
            </button>
            <button type="button" disabled={pending} onClick={goToSummary} className={ui.btnSecondary}>
              Skip for now
            </button>
          </div>
        </section>
      ) : null}

      {stage === 'summary' ? (
        <section className={ui.cardSolid} aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="inline-flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
            <SpotMark kind="xp" className="h-8 w-8" />
            Module complete
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Score {correctCount}/{total} ({scorePct}%). +{module.xp} XP toward{' '}
            <span className="text-[var(--foreground)]">Ship with AI tools</span>
            {module.skill ? ` · ${module.skill}` : ''}.
            {exerciseDone ? ` Apply exercise done (+${EXERCISE_XP} XP).` : ''}
          </p>
          <p className="mt-3 text-xs text-[var(--muted)]">
            {demo
              ? 'Demo only — this walkthrough does not record a session or count toward metrics.'
              : 'Session recorded for your Ludwitt practice. XP appears on your profile once.'}
          </p>
          {exerciseDone && listingUrl ? (
            <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
              Enjoying the app?{' '}
              <a
                href={listingUrl}
                target="_blank"
                rel="noreferrer"
                className={ui.linkAccent}
              >
                Leave a review on the Ludwitt listing
                <NewTabHint />
              </a>
              . It helps other builders find counted practice.
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {demo ? (
              <>
                <a href="#project" className={ui.btnPrimaryLg}>
                  Next: first project
                </a>
                <a href="/signup" className={ui.btnSecondary}>
                  Continue in the live app
                </a>
              </>
            ) : nextModule ? (
              <a href={`/learn/${nextModule.id}`} className={ui.btnPrimaryLg}>
                Next: {nextModule.title}
              </a>
            ) : (
              <a href="/profile" className={ui.btnPrimaryLg}>
                View profile & XP
              </a>
            )}
            {!demo && projectUnlocked ? (
              <a href="/project" className={ui.btnSecondary}>
                First project
              </a>
            ) : null}
            {!demo && !projectUnlocked ? (
              <a href="/learn" className={ui.btnSecondary}>
                Back to path
              </a>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  )
}
