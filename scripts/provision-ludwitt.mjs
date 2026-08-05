/**
 * Generate Ludwitt-compatible app credentials and print Vercel env commands.
 * Official api.ludwitt.hult DNS is not live — EudaLearn hosts a curriculum-compatible
 * platform shim at /api/platform/v1 and stores events in Supabase.
 */
import { randomUUID } from 'crypto'
import { writeFileSync } from 'fs'

const appId = randomUUID()
const apiKey = `elk_${randomUUID().replace(/-/g, '')}`
const jwtSecret = `jwt_${randomUUID().replace(/-/g, '')}${randomUUID().replace(/-/g, '')}`
const sessionSecret = randomUUID().replace(/-/g, '')
const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://learn-joes9987.vercel.app'
const apiBase = `${site.replace(/\/$/, '')}/api/platform/v1`

const creds = {
  LUDWITT_APP_ID: appId,
  LUDWITT_API_KEY: apiKey,
  LUDWITT_JWT_SECRET: jwtSecret,
  LUDWITT_API_BASE: apiBase,
  SESSION_SECRET: sessionSecret,
  NEXT_PUBLIC_SITE_URL: site,
  NEXT_PUBLIC_LUDWITT_LISTING_URL: `${site}/`
}

writeFileSync('.ludwitt-creds.json', `${JSON.stringify(creds, null, 2)}\n`)
console.log('Wrote .ludwitt-creds.json (gitignored)')
console.log(JSON.stringify(creds, null, 2))
console.log('\nAdd to Vercel with: npx vercel env add <NAME> production < value')
