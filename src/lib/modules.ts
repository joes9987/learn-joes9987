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
  lesson: string[]
  quiz: QuizItem[]
}

export function listModules (): LearnModule[] {
  return modulesJson as LearnModule[]
}

export function getModule (id: string): LearnModule | undefined {
  return listModules().find((m) => m.id === id)
}
