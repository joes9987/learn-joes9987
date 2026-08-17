import modulesJson from '../../data/modules.json'

export type QuizItem = {
  id: string
  prompt: string
  choices: string[]
  answer: number
  explain: string
}

export type ModuleExercise = {
  title: string
  prompt: string
  hints: string[]
  doneLabel: string
}

export type LearnModule = {
  id: string
  title: string
  minutes: number
  xp: number
  summary: string
  skill: string
  order: number
  lesson: string[]
  quiz: QuizItem[]
  exercise?: ModuleExercise
}

export const EXERCISE_XP = 10

export const TRACK = {
  id: 'ship-with-ai',
  title: 'Ship with AI tools',
  blurb: 'Counted practice you can finish with a keyboard and a screen reader.',
  outcome:
    'By the end of this path you can brief an agent, wire auth and APIs safely, instrument sessions, deploy with a smoke check, and place the work in a product suite — practice built so keyboard and screen-reader users can complete every step.'
} as const

export function listModules (): LearnModule[] {
  return [...(modulesJson as LearnModule[])].sort((a, b) => a.order - b.order)
}

export function getModule (id: string): LearnModule | undefined {
  return listModules().find((m) => m.id === id)
}

export function totalTrackXp (modules = listModules()): number {
  return modules.reduce((sum, m) => sum + m.xp + (m.exercise ? EXERCISE_XP : 0), 0)
}

export function nextIncompleteModule (
  modules: { module: LearnModule; completed: boolean }[]
): LearnModule | null {
  return modules.find((row) => !row.completed)?.module ?? null
}
