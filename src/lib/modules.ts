import modulesJson from '../../data/modules.json'

export type QuizItem = {
  id: string
  prompt: string
  choices: string[]
  answer: number
  explain: string
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
}

export const TRACK = {
  id: 'ship-with-ai',
  title: 'Ship with AI tools',
  outcome:
    'By the end of this path you can brief an agent, wire auth and APIs safely, instrument sessions, deploy with a smoke check, and place the work in a product suite — the operating skills for shipping as an AI-era builder.'
} as const

export function listModules (): LearnModule[] {
  return [...(modulesJson as LearnModule[])].sort((a, b) => a.order - b.order)
}

export function getModule (id: string): LearnModule | undefined {
  return listModules().find((m) => m.id === id)
}

export function totalTrackXp (modules = listModules()): number {
  return modules.reduce((sum, m) => sum + m.xp, 0)
}
