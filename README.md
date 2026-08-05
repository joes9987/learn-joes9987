# EudaLearn

Week 4 Ludwitt learning app for the Hult Summer Pilot — short builder-skills modules with **Ludwitt Creator OAuth**, practice events, and an optional Ludwitt AI coach tip.

**Production:** https://learn-joes9987.vercel.app  
**Marketplace:** https://www.ludwitt.com/dashboard/marketplace/eudalearn  
**Repo:** https://github.com/joes9987/learn-joes9987  
**Client ID:** `le_d0e87dbc215bdf4d90eaa7`

## Week 4 bar

1. App registered on Ludwitt Creator (`LUDWITT_CLIENT_ID` / `LUDWITT_CLIENT_SECRET`)
2. `Sign in with Ludwitt` → `/auth/callback` → session cookie → `/learn`
3. Practice loop posts ≥1 non-heartbeat event per session (`lesson_started` / `quiz_submitted` / `lesson_completed`)
4. Ludwitt AI coach via `POST /api/coach` (Creator Test mode or paid credits)
5. Proof PR in the cohort repo with client id, marketplace listing URL, metrics snapshot, promotion channels

≥25 external users is a later snapshot gate (≈ Aug 19) — not required to merge the Sunday proof PR.

### Platform note

Curriculum host `api.ludwitt.hult` does not resolve in DNS. **Identity and listing** use Ludwitt Creator OAuth at `pitchrise.ludwitt.com`. **Learning-event telemetry** is app-owned (Supabase + `/api/platform/v1` metrics) until an official Hult events API is live.

## Ludwitt docs (offline)

Creator LE docs are gitignored under `.ludwitt/`. Re-fetch when integrating or after Ludwitt releases:

```bash
mkdir -p .ludwitt
curl -sSfL https://pitchrise.ludwitt.com/docs/le/llms.txt -o .ludwitt/llms.txt
curl -sSfL https://pitchrise.ludwitt.com/docs/le/quickstart.md -o .ludwitt/quickstart.md
curl -sSfL https://pitchrise.ludwitt.com/docs/le/oauth.md -o .ludwitt/oauth.md
curl -sSfL https://pitchrise.ludwitt.com/docs/le/credits.md -o .ludwitt/credits.md
curl -sSfL https://pitchrise.ludwitt.com/docs/le/security.md -o .ludwitt/security.md
curl -sSfL https://pitchrise.ludwitt.com/docs/le/rate-limits.md -o .ludwitt/rate-limits.md
curl -sSfL https://pitchrise.ludwitt.com/docs/le/errors.md -o .ludwitt/errors.md
curl -sSfL https://pitchrise.ludwitt.com/docs/le/openapi.yaml -o .ludwitt/openapi.yaml
```

Start agents on `.ludwitt/llms.txt`. OAuth base: `LUDWITT_OAUTH_BASE=https://pitchrise.ludwitt.com`.

## Local

```bash
cp .env.example .env.local
# set LUDWITT_CLIENT_ID, LUDWITT_CLIENT_SECRET, SESSION_SECRET, NEXT_PUBLIC_SITE_URL
npm install
npm run dev
```

Open http://localhost:3000 and use **Sign in with Ludwitt** (redirect URI must include `http://localhost:3000/auth/callback` on the Creator app).

## Scripts

```bash
npm test
npm run build
```

## Reviewer

See [docs/REVIEWER.md](docs/REVIEWER.md).
