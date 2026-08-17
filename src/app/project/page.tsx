import { redirect } from 'next/navigation'
import { ProjectStudio } from '@/components/ProjectStudio'
import { FIRST_PROJECT } from '@/lib/first-project'
import { getLearnerProgress } from '@/lib/progress'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: FIRST_PROJECT.title,
  description: FIRST_PROJECT.summary
}

export default async function ProjectPage () {
  const session = await getSession()
  if (!session) redirect('/login')

  const progress = await getLearnerProgress(session.userId)

  return (
    <ProjectStudio
      unlocked={progress.projectUnlocked}
      completedModuleCount={progress.completedModuleIds.length}
      initialStepIds={progress.projectStepIds}
      initiallyComplete={progress.projectCompleted}
    />
  )
}
