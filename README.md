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

## Status: Phase 1 (UI-first)

This commit is the **UI built on mock data** — every screen, the full design
system, and motion are in place; the backend (Prisma, server actions, Gemini
streaming, auth) lands in later phases. See
[`SETUP.md`](./SETUP.md) for integration and deploy guides.

## Tech

Next.js (App Router) · TypeScript (strict) · Tailwind v4 · Framer Motion ·
Zustand · React Hook Form + Zod · (later) Prisma + Postgres + Gemini.

## Run it

```bash
corepack enable pnpm   # one-time: makes pnpm available
pnpm install
pnpm dev               # http://localhost:3000
```

No environment variables or database are needed for Phase 1.

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

> Test and DB scripts are wired now but exercised from Phase 2/3 onward.
