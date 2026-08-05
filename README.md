# EudaLearn

Week 4 Ludwitt learning app for the Hult Summer Pilot — short builder-skills modules with a validated Ludwitt JWT launch and learning events.

**Production:** https://learn-joes9987.vercel.app  
**Repo:** https://github.com/joes9987/learn-joes9987

## Week 4 bar

1. App registered on Ludwitt
2. `/launch?token=` validates the platform JWT and opens a session
3. Practice loop posts ≥1 non-heartbeat event per session (`lesson_started` / `quiz_submitted` / `lesson_completed`)
4. Proof PR in the cohort repo with app ID, listing URL, metrics snapshot, promotion channels

≥25 external users is a later snapshot gate — not required to merge the Sunday proof PR.

## Local

```bash
cp .env.example .env.local
npm install
npm run dev
```

With `ALLOW_DEV_LAUNCH=true` and Ludwitt secrets set, `POST /api/dev-launch` returns a `/launch?token=…` path for local wiring tests.

## Scripts

```bash
npm test
npm run build
```

## Reviewer

See [docs/REVIEWER.md](docs/REVIEWER.md).
