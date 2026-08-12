export const SITE = {
  name: 'EudaLearn',
  tagline: 'Ship with AI tools — a short path from briefs to deploy and suite thinking.',
  description:
    'Eight practice modules on briefing, APIs, auth, launch trust, telemetry, deploy smoke, suite handoffs, and feedback loops. Sign in with Ludwitt so your XP and sessions count.',
  cohort: 'Hult Summer Pilot 2026',
  marketUrl: process.env.NEXT_PUBLIC_EUDA_MARKET_URL ?? 'https://showcase-joes9987.vercel.app',
  pmUrl: process.env.NEXT_PUBLIC_EUDA_PM_URL ?? 'https://pm-joes9987.vercel.app',
  chatUrl: process.env.NEXT_PUBLIC_EUDA_CHAT_URL ?? 'https://comms-joes9987.vercel.app',
  listingUrl: process.env.NEXT_PUBLIC_LUDWITT_LISTING_URL ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
} as const
