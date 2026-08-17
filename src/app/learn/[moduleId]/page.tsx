import { notFound, redirect } from 'next/navigation'
import { PracticeClient } from '@/components/PracticeClient'
import { getModule, listModules, nextIncompleteModule } from '@/lib/modules'
import { getLearnerProgress } from '@/lib/progress'
import { getSession } from '@/lib/session'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ moduleId: string }> }

export async function generateMetadata ({ params }: Props) {
  const { moduleId } = await params
  const mod = getModule(moduleId)
  return { title: mod?.title ?? 'Module' }
}

export default async function ModulePage ({ params }: Props) {
  const session = await getSession()
  if (!session) redirect('/learn')

  const { moduleId } = await params
  const mod = getModule(moduleId)
  if (!mod) notFound()

  const progress = await getLearnerProgress(session.userId)
  const remaining = progress.modules.filter((row) => row.module.id !== mod.id)
  const next = nextIncompleteModule(remaining) ?? listModules().find((m) => m.id !== mod.id) ?? null
  const row = progress.modules.find((item) => item.module.id === mod.id)

  return (
    <PracticeClient
      module={mod}
      nextModule={next ? { id: next.id, title: next.title } : null}
      projectUnlocked={progress.projectUnlocked}
      exerciseAlreadyDone={row?.exerciseCompleted ?? false}
      listingUrl={SITE.listingUrl}
    />
  )
}
