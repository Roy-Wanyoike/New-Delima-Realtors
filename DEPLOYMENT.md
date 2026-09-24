# Deployment Runbook — Vercel + Supabase

This document is the single source of truth for deploying Delima Realtors to
production. It explains what broke, how it was fixed, and the exact steps to
get a green deployment with live data.

---

## 1. What caused the failed deployment

Vercel reported:

> No Output Directory named "output" found after the Build completed.

**Root cause.** The Vercel project was originally imported while the repository
still contained the retired SvelteKit prototype (branches such as
`fix/build-adapter-vercel` date from that era). The project kept the old
Framework Preset ("Other") and an Output Directory of `output`. After the
Next.js 16 rebuild, `next build` produces `.next` — never `output` — so Vercel
failed after every successful build.

**Fix (committed, no dashboard changes needed).** `vercel.json` now pins the
framework explicitly, which overrides the stale dashboard preset:

```json
{
  "framework": "nextjs",
  "installCommand": "bun install --frozen-lockfile",
  "buildCommand": "prisma generate --schema prisma/schema.postgres.prisma && next build"
}
```

With `framework: "nextjs"`, Vercel auto-detects the `.next` output, runs
`next build` itself, and the Output Directory setting is no longer consulted.
The build command also generates the **Postgres** Prisma client (serverless
functions cannot talk to a local SQLite file).

`next.config.ts` additionally disables the `standalone` output on Vercel
(`output: process.env.VERCEL ? undefined : "standalone"`), since standalone is
only for self-hosting.

---

## 2. Deployments happen from `main` only

Three layers enforce this:

1. **Branch cleanup (done).** All 27 historical feature/fix branches were
   deleted after the platform was consolidated onto `main`, so no other branch
   can push a preview deployment. Repository setting
   *Automatically delete head branches* was also enabled, so future merged
   branches disappear immediately.
2. **vercel.json** declares `"git": { "deploymentEnabled": { "main": true } }`
   as the deployment intent.
3. **Recommended dashboard settings** (one-time, needs Vercel access):
   - Project → Settings → Git → **Production Branch: `main`**
   - Project → Settings → Git → **Preview Deployments: Disabled** (if you want
     strictly zero deployments from any future branch)
   - GitHub → repo → Settings → Branches → protect `main` (require PRs) if you
     want to prevent direct pushes.

---

## 3. Wire up Supabase (database)

The app ships two Prisma schemas that share identical models:

| Schema | Provider | Used by |
|---|---|---|
| `prisma/schema.prisma` | SQLite | Local dev & the sandbox (`bun run db:push`) |
| `prisma/schema.postgres.prisma` | PostgreSQL | Vercel build + production runtime |

If you previously connected Supabase (its integration may still inject
`SUPABASE_URL` / `SUPABASE_ANON_KEY`), note that **the app needs a Postgres
`DATABASE_URL`** — the Supabase *database connection string*, not the JS
client keys.

### Step-by-step

1. **Get the connection strings** — Supabase dashboard → Project Settings →
   **Database** → *Connection string → URI*. You will use two variants:
   - **Transaction pooler (port 6543)** — for the Vercel runtime.
     Append `?pgbouncer=true&connection_limit=1`.
   - **Session pooler (port 5432)** — for the one-time provisioning below.

2. **Provision schema + seed data once**, from your machine, with the
   *session* pooler URL in `.env`:

   ```bash
   # .env
   DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"

   npm install
   npm run db:pg:push     # creates tables
   npm run db:pg:seed     # loads 42 listings, 9 neighborhoods, 6 agents, 108 market stats
   ```

3. **Set environment variables in Vercel** — Project → Settings →
   Environment Variables, for *Production* (and *Preview* if enabled):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Transaction-pooler URI (port **6543**, `?pgbouncer=true&connection_limit=1`) |
   | `ADMIN_PASSCODE` | A long private string — unlocks the CRM at `/#admin` (footer → Staff Login) |

   `z-ai` credentials, if you use the Vercel integration for AI features,
   remain unchanged.

4. **Redeploy `main`** (push a commit or Vercel dashboard → Deployments →
   Redeploy). The build generates the Postgres client and `next build` runs.

5. **Verify** — open the deployment URL:
   - `/api/health` → `{"ok":true,…}`
   - `/` → listings render (hero search "Karen" → 6 homes)
   - If listings are empty, the seed step (2) was skipped or `DATABASE_URL`
     points at the wrong pooler/port.

---

## 4. Local development

Unchanged — SQLite keeps local work zero-setup:

```bash
cp .env.example .env      # defaults to file:./db/custom.db
bun install
bun run db:push && bun prisma/seed.ts
bun run dev
```

---

## 5. CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every push/PR to `main`:

1. `bun install --frozen-lockfile`
2. `bun run lint` (ESLint)
3. `bunx next typegen && bunx tsc --noEmit` (typecheck)
4. SQLite database push + seed, then the full Vitest suite
   (`bun run test`)

A green check on `main` is the gate that keeps the Vercel build from ever
seeing a regression.

---

## 6. Troubleshooting

| Symptom | Cause & fix |
|---|---|
| `No Output Directory named "output"` | Stale dashboard preset. Fixed by `vercel.json#framework`; also set Framework Preset to **Next.js** in dashboard settings for belt-and-braces. |
| `P1001: can't reach database` in functions | Wrong pooler/port. Runtime must use **port 6543 + pgbouncer=true**, not 5432. |
| `Error: PostgreSQL username must be URL-encoded` | Password contains special chars — URL-encode it (`@` → `%40`). |
| Site deploys but shows no listings | `DATABASE_URL` missing in Vercel env, or seed (`npm run db:pg:seed`) never ran. |
| CRM returns 401 | `x-admin-key` ≠ `ADMIN_PASSCODE` (Vercel env var). |
| Build fails at `prisma generate` | Both schemas must stay in sync — see the note in `schema.postgres.prisma`. |
