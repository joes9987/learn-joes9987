# Reviewer guide — EudaLearn

Production: https://learn-joes9987.vercel.app  
Marketplace: https://www.ludwitt.com/dashboard/marketplace/eudalearn  
Client ID: `le_d0e87dbc215bdf4d90eaa7`

## Smoke

| Check | Where |
|-------|-------|
| Landing | `/` — Start practicing + Investor demo + marketplace link |
| Investor demo | `/demo` — no login; `#practice` / `#project` hashes; does **not** POST `/api/events` or `/api/coach` |
| Health | `/api/health` → `app: "eudalearn"`, `oauthConfigured: true`, `oauthBase: pitchrise…` |
| OAuth gate | `/learn` without session → Sign in to practice |
| OAuth | `/api/auth/ludwitt` → Ludwitt authorize → `/auth/callback` → `/learn` |
| Privacy | `/privacy` |
| Practice | `/learn/[moduleId]` — lesson → quiz → summary |
| Events | Server proxy `POST /api/events` (api keys never in browser); metadata includes `campaign: p2-venture` |
| Coach | After quiz answer, `POST /api/coach` via Ludwitt AI proxy |

## OAuth note

Creator app is **approved**. Token exchange accepts the client (`invalid_grant` on a fake code; previously `invalid_client`). Prefer **Sign in with Ludwitt**. Mint-test-token remains under “Having trouble signing in?” for graders only.

## Integration contract

- **Primary:** Ludwitt Creator OAuth (`profile credits:read credits:spend`) at `pitchrise.ludwitt.com`
- Session cookie keyed on Ludwitt `sub` + email
- Events: `lesson_started`, `quiz_submitted`, `lesson_completed`, optional `session_heartbeat`
- Metrics: `GET /api/platform/v1/apps/{appId}/metrics` (app-owned Supabase store)
- Env: `LUDWITT_CLIENT_ID`, `LUDWITT_CLIENT_SECRET`, `SESSION_SECRET`, `NEXT_PUBLIC_LUDWITT_LISTING_URL`, `LUDWITT_OAUTH_BASE`
