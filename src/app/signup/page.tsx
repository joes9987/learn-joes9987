import { LoginClient } from '@/components/LoginClient'
import { isOAuthConfigured } from '@/lib/ludwitt-oauth'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Sign up',
  description: 'Create a Ludwitt account to practice EudaLearn modules and attribute your sessions.'
}

export default function SignupPage () {
  return (
    <LoginClient oauthReady={isOAuthConfigured()} listingUrl={SITE.listingUrl} intent="signup" />
  )
}
