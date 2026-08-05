import { LoginClient } from '@/components/LoginClient'
import { isOAuthConfigured } from '@/lib/ludwitt-oauth'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Sign in',
  description: 'Sign in with Ludwitt to practice EudaLearn modules and attribute your sessions.'
}

export default function LoginPage () {
  return (
    <LoginClient oauthReady={isOAuthConfigured()} listingUrl={SITE.listingUrl} />
  )
}
