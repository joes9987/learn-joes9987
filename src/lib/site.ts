export const SITE = {
  name: 'EudaLearn',
  tagline: 'Short practice modules that sharpen how you brief, launch, and ship with AI.',
  description:
    'Practice prompt briefs, launch trust, event telemetry, and suite thinking in about 30 minutes. Sign in with Ludwitt so your sessions count.',
  cohort: 'Hult Summer Pilot 2026',
  marketUrl: process.env.NEXT_PUBLIC_EUDA_MARKET_URL ?? 'https://showcase-joes9987.vercel.app',
  pmUrl: process.env.NEXT_PUBLIC_EUDA_PM_URL ?? 'https://pm-joes9987.vercel.app',
  chatUrl: process.env.NEXT_PUBLIC_EUDA_CHAT_URL ?? 'https://comms-joes9987.vercel.app',
  listingUrl: process.env.NEXT_PUBLIC_LUDWITT_LISTING_URL ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
} as const
