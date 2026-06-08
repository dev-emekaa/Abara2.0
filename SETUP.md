# Abara — setup & integration guide

Everything here uses **free tiers / local sandboxes**. The app runs fully
without the AI and email keys (it degrades gracefully); they only enrich
later phases. Copy `.env.example` to `.env` before filling anything in.

---

## 1. Local prerequisites

- **Node 20+** (developed on Node 22) and **pnpm** via `corepack enable pnpm`.
- **Docker** (for the local Postgres + Mailpit, from Phase 3 onward).

```bash
corepack enable pnpm
pnpm install
pnpm dev          # http://localhost:3000  (Phase 1 needs nothing else)
```

---

## 2. Local database & email (Docker) — needed from Phase 3

```bash
docker compose up -d      # starts dev DB (5434), test DB (5435), Mailpit (8026)
```

Then in `.env`:

```
DATABASE_URL="postgresql://abara:abara@localhost:5434/abara?schema=public"
DATABASE_URL_TEST="postgresql://abara:abara@localhost:5435/abara_test?schema=public"
```

- Dev DB → host port **5434**
- Test DB → host port **5435** (disposable; integration tests reset it)
- Mailpit web UI → **http://localhost:8026** (captured nudge emails appear here)

Stop with `docker compose down` (add `-v` to wipe the dev DB volume).

---

## 3. Gemini API key (Google AI Studio) — free tier

1. Go to **https://aistudio.google.com/apikey**.
2. Sign in with a Google account → **Create API key** → copy it.
3. Put it in `.env`:
   ```
   GEMINI_API_KEY="your-key-here"
   GEMINI_MODEL="gemini-2.5-flash"
   ```
4. Model string: use **`gemini-2.5-flash`** (fast, capable, free-tier friendly).
   Confirm it's listed for your key in Google AI Studio. If the key is missing,
   rate-limited, or the model name isn't accepted, the Care Companion falls back
   to a safe canned reply that still respects the escalation rule.

> Keep prompts short to conserve the free quota. All Gemini calls are
> server-side only — the key never reaches the browser.

---

## 4. Render Postgres (production database) — free tier

1. Create an account at **https://render.com**.
2. **New → Postgres** → choose the **Free** instance type → create.
3. On the database page, copy the **External Database URL** (starts with
   `postgresql://`).
4. Use it as the production `DATABASE_URL` (in Vercel env vars, see §6).
5. Apply schema + seed against it:
   ```bash
   DATABASE_URL="<render-external-url>" pnpm prisma migrate deploy
   DATABASE_URL="<render-external-url>" pnpm db:seed
   ```

For a separate **test** DB you can create a second free Render Postgres and use
its URL as `DATABASE_URL_TEST`, or just use the local Docker test DB.

---

## 5. Email (nudge delivery)

The email service is provider-selected via `EMAIL_PROVIDER`:

- **`mailpit`** (local, recommended): captures mail in the Mailpit UI at
  http://localhost:8026 — no account, no real sending.
- **`resend`** (production): create a free account at **https://resend.com**,
  verify a domain (or use the sandbox sender), create an API key, then set:
  ```
  EMAIL_PROVIDER="resend"
  RESEND_API_KEY="re_..."
  EMAIL_FROM="Abara <care@yourdomain>"
  ```
- **`console`** / unset: sending **no-ops to a console + in-app preview**, so the
  app and tests always run keyless. A nudge preview is always viewable at
  `/app/nudges/[id]` regardless of provider.

> WhatsApp is the production channel in the real product and is **out of scope**
> here; email is the prototype stand-in.

---

## 6. Deploy to Vercel + Render

1. Push this repo to GitHub.
2. In **Vercel → New Project**, import the repo. Framework auto-detects as
   Next.js; no build-setting changes needed.
3. Add environment variables in Vercel (Project → Settings → Environment
   Variables):
   - `DATABASE_URL` → the Render **External** Postgres URL
   - `JWT_SECRET` → a long random string
   - `GEMINI_API_KEY`, `GEMINI_MODEL`
   - `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM`
   - `NEXT_PUBLIC_APP_URL` → your Vercel URL
4. Run migrations + seed against the Render DB (from your machine, one-off):
   ```bash
   DATABASE_URL="<render-external-url>" pnpm prisma migrate deploy
   DATABASE_URL="<render-external-url>" pnpm db:seed
   ```
5. Deploy. The result is a public URL a grader can open and sign into with the
   demo account.

> Generate `JWT_SECRET`:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
