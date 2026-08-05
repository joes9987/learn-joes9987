# Reviewer guide — EudaLearn

Production: https://learn-joes9987.vercel.app

## Smoke

| Check | Where |
|-------|-------|
| Landing | `/` |
| Health | `/api/health` → `app: "eudalearn"` |
| Launch gate | `/learn` without session asks to launch from Ludwitt |
| Launch | `/launch?token=` (valid HS256 JWT from Ludwitt) → `/learn` |
| Practice | `/learn/[moduleId]` — lesson → quiz → summary |
| Events | Server proxy `POST /api/events` (api_key never in browser) |

## Integration contract

- JWT claims: `sub`, `email`, `app_id`, `exp`
- Events: `lesson_started`, `quiz_submitted`, `lesson_completed`, optional `session_heartbeat`
- Env: `LUDWITT_APP_ID`, `LUDWITT_API_KEY`, `LUDWITT_JWT_SECRET`, `LUDWITT_API_BASE`
