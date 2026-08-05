import { notFound, redirect } from 'next/navigation'
import { PracticeClient } from '@/components/PracticeClient'
import { getModule } from '@/lib/modules'
import { getSession } from '@/lib/session'

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

  return <PracticeClient module={mod} />
}
