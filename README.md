# Abara — the retention layer for telemedicine

Abara turns a one-time consultation into an ongoing health relationship. This
repo is the **retention layer** built on top of an existing Nigerian
telemedicine app, focused on three features:

1. **Care Companion** — a proactive AI check-in after a consultation, with a
   hard-coded safety guardrail that hands the user to a real doctor on any
   red-flag signal (never diagnoses, never prescribes).
2. **Health Timeline & Care Streaks** — the health record as a living timeline,
   plus a gentle streak that rewards returning.
3. **Smart Health Nudges** — context-aware re-engagement messages drawn from the
   user's own history, with an in-app inbox and email preview.

Consultations, payments, video, and WhatsApp are **out of scope** (booking is a
visual stub).

## Status: full working core

Every screen is wired to a real backend: email+password auth (JWT in an httpOnly
cookie, middleware-protected routes), Prisma + Postgres, server actions, RSC data
fetching, and a streaming Gemini-backed Care Companion with a deterministic,
server-enforced safety guardrail. New accounts (and the demo) are auto-seeded so
the app is never empty. See [`SETUP.md`](./SETUP.md) for integration and deploy
guides. Out of scope: real booking, payments, video, WhatsApp.

## Tech

Next.js 16 (App Router) · TypeScript (strict) · Tailwind v4 · Framer Motion ·
Zustand · React Hook Form + Zod · Prisma + PostgreSQL · jose + bcryptjs ·
Google Gemini (free tier) · Jest + RTL.

## Run it

```bash
corepack enable pnpm        # one-time: makes pnpm available
pnpm install
docker compose up -d        # local Postgres (5434), test DB (5435), Mailpit (8026)
cp .env.example .env        # then fill JWT_SECRET (+ optional GEMINI/RESEND keys)
pnpm db:migrate             # apply schema
pnpm db:seed                # create the demo account + starter data
pnpm dev                    # http://localhost:3000
```

The app runs fully **without** a Gemini or email key — the companion falls back
to safe canned replies and email no-ops to an in-app preview.

### Demo login

The landing page has a one-tap **“Enter as demo”** button. Credentials (used
once auth is wired in Phase 3):

```
demo@abara.health  /  demo1234
```

### Routes

| Screen            | Path                  |
| ----------------- | --------------------- |
| Landing           | `/`                   |
| Log in            | `/login`              |
| Sign up           | `/signup`             |
| Dashboard         | `/app`                |
| Care Companion    | `/app/companion`      |
| Health Timeline   | `/app/timeline`       |
| Nudges inbox      | `/app/nudges`         |
| Nudge detail      | `/app/nudges/[id]`    |
| Consultation stub | `/app/consult`        |
| Profile           | `/app/profile`        |

## Scripts

| Script                  | What it does                                  |
| ----------------------- | --------------------------------------------- |
| `pnpm dev`              | Start the dev server                          |
| `pnpm build` / `start`  | Production build / serve                      |
| `pnpm lint`             | ESLint                                        |
| `pnpm typecheck`        | `tsc --noEmit`                                |
| `pnpm test`             | Jest (added in test phases)                   |
| `pnpm test:unit`        | Service-layer + component unit tests          |
| `pnpm test:integration` | Full-flow tests against the test DB           |
| `pnpm db:migrate`       | Prisma migrate (Phase 3)                      |
| `pnpm db:seed`          | Seed demo data (Phase 3)                      |

> Integration tests need the Docker test DB running (`docker compose up -d`).
