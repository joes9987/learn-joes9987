import projectJson from '../../data/first-project.json'

export type ProjectStep = {
  id: string
  title: string
  prompt: string
  hints: string[]
  input: 'textarea' | 'affirm'
  doneLabel: string
}

export type FirstProject = {
  id: string
  title: string
  summary: string
  xp: number
  unlockAfterModules: number
  steps: ProjectStep[]
}

export const FIRST_PROJECT = projectJson as FirstProject

export function projectUnlocked (completedModuleCount: number): boolean {
  return completedModuleCount >= FIRST_PROJECT.unlockAfterModules
}
