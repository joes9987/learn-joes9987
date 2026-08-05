# AGENTS.md — EudaLearn

Week 4 learning app. Ludwitt JWT launch is the auth path for counted sessions.

## Do

- Keep `api_key` server-side (`/api/events`)
- Reject invalid/expired launch tokens with “Launch from Ludwitt”
- Fire ≥1 non-heartbeat event per practice session

## Do not

- Commit Ludwitt secrets
- Enable `ALLOW_DEV_LAUNCH` in production
- Claim silent SSO with EudaPM/Chat/Market
