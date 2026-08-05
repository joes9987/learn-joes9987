# Reviewer guide — EudaLearn

Production: https://learn-joes9987.vercel.app  
Marketplace: https://www.ludwitt.com/dashboard/marketplace/eudalearn  
Client ID: `le_d0e87dbc215bdf4d90eaa7`

## Smoke

| Check | Where |
|-------|-------|
| Landing | `/` — Sign in with Ludwitt + marketplace link |
| Health | `/api/health` → `app: "eudalearn"`, `oauthConfigured: true` |
| OAuth gate | `/learn` without session → Sign in with Ludwitt |
| OAuth | `/api/auth/ludwitt` → Ludwitt authorize → `/auth/callback` → `/learn` |
| Practice | `/learn/[moduleId]` — lesson → quiz → summary |
| Events | Server proxy `POST /api/events` (api keys never in browser) |
| Coach | After quiz answer, `POST /api/coach` via Ludwitt AI proxy (Test mode or paid credits) |

## Integration contract

- **Primary:** Ludwitt Creator OAuth (`profile credits:read credits:spend`) at `pitchrise.ludwitt.com`
- Session cookie keyed on Ludwitt `sub` + email
- Events: `lesson_started`, `quiz_submitted`, `lesson_completed`, optional `session_heartbeat`
- Env: `LUDWITT_CLIENT_ID`, `LUDWITT_CLIENT_SECRET`, `SESSION_SECRET`, `NEXT_PUBLIC_LUDWITT_LISTING_URL`
- Optional legacy JWT launch still supported when `LUDWITT_JWT_SECRET` / `LUDWITT_APP_ID` are set
