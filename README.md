# Delima Realtors 3.0

A luxury real-estate experience for Nairobi — AI-powered property search, an interactive
hand-drawn map, live market intelligence, a finance desk and a modern lead CRM, built as a
single-page Next.js application.

**3.0 is a ground-up visual revamp**: a modern evergreen + amber design system
(`#0C3B2E` brand, `#E8A33D` sun) with Plus Jakarta Sans typography, rounded glass surfaces,
scroll-reveal motion and a light, paper-warm aesthetic — replacing the old serif/gold theme.
It ships with a rich demo dataset: **42 listings across 9 Nairobi neighborhoods** (27 for sale,
8 for rent, 3 sold, 4 new developments), 12 months of market statistics per neighborhood,
6 agents, 16 seeded CRM leads and newsletter subscribers.

> Status: 3.0 UI revamp complete — all 9 experience areas, 8 API routes, the demo data platform
> and a 75-test green suite are live. Roadmap and open work:
> [issue tracker](https://github.com/Roy-Wanyoike/New-Delima-Realtors/issues).

## What is Delima Realtors?

Delima Realtors is a Nairobi brokerage; 3.0 is its digital storefront and back office.
It serves two audiences at once:

- **Buyers & renters** browse and compare residences, explore neighborhoods on a map, study
  price trends, calculate mortgages, get instant AI valuations and talk to an AI concierge.
- **Agents** capture every enquiry in a CRM pipeline, score and assign leads, and move them
  across stages with drag-and-drop.

The nine experience areas (all rendered inside one single-page shell):

| View | One-liner |
| --- | --- |
| **Home** | Cinematic hero with natural-language search, featured residences, neighborhood spotlight, testimonials. |
| **Properties** | Searchable, filterable collection — type, status, price range, beds, neighborhood, featured-only, five sort orders, favorites and compare. |
| **Property detail** | Gallery with lightbox, specs and amenities, agent card, viewing-request form (posts a lead), similar homes. |
| **Map search** | Bespoke SVG map of Nairobi — pan/zoom, price-band neighborhood shading, cluster pins, hover-synced results list. |
| **Market insights** | "Nairobi Price Atlas" — KPI cards, 12-month price/volume charts, neighborhood heat table. |
| **Agents** | Advisor roster derived from live listings, with call / WhatsApp / email actions. |
| **Finance desk** | KES mortgage calculator with amortization chart and a ⅓-income affordability tool. |
| **AI valuation** | 3-step wizard → estimate range with confidence score, comparable sales and a written narrative. |
| **Agent CRM (demo)** | Passcode-gated kanban pipeline with drag-and-drop, notes, assignment and analytics. |

App-wide extras: AI concierge widget, favorites + compare tray, WhatsApp float, newsletter signup.

## The problem it solves

Legacy brokerage sites are static brochures: listings without real search, no map, no market
context, and enquiries lost in email inboxes. 3.0 closes that loop — every enquiry path
(property detail, AI valuation, newsletter, concierge) lands in the same scored CRM pipeline, and
every discovery path (search, filters, map, insights) reads from one live data platform.

## Architecture

**Single-route SPA.** The app exposes one user-visible route (`/`) and switches between nine
client-side views via a Zustand store. This keeps navigation instant, lets search filters,
favorites and the map↔list hover sync be shared state across views, and mounts app-wide
furniture (header, footer, compare bar, AI concierge, theme toggle) exactly once.

**Data flow.**

```
SQLite (db/custom.db)
  → Prisma client (src/lib/db.ts)
  → DTO serializers (src/lib/data.ts)        ← row ↔ PropertyDTO/LeadDTO/… contracts in src/lib/types.ts
  → API routes (src/app/api/*/route.ts)      ← force-dynamic, zod-validated
  → data hooks (src/hooks/use-delima-data.ts)← module-cached useProperties/useInsights + shared filter engine
  → views (src/components/delima/*)
```

**AI layer.** The `z-ai-web-dev-sdk` is imported **server-side only**, in exactly two routes:
`/api/assistant` (concierge chat that can return listing cards + search filters) and
`/api/valuation` (LLM-written valuation narrative on top of deterministic comparables math).
Both degrade gracefully — the assistant falls back to featured listings, the valuation to a
template narrative — so the UI never breaks when the model is unavailable.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, `output: "standalone"`) |
| UI | React 19 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui (Radix) |
| State | Zustand 5 with `persist` (favorites, compare, view) |
| Data | Prisma 6 ORM · SQLite (`db/custom.db`) |
| AI | `z-ai-web-dev-sdk` (server-side only) |
| Validation | Zod 4 |
| Charts / DnD / motion | Recharts · @dnd-kit · Framer Motion |
| Icons & fonts | lucide-react · Plus Jakarta Sans + Geist Mono via `next/font` |
| Runtime & package manager | Bun 1.1+ (developed and tested on Bun 1.3) |

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── assistant/route.ts    # AI concierge (chat → reply + listing cards + filters)
│   │   ├── health/route.ts       # liveness + DB connectivity probe
│   │   ├── leads/route.ts        # CRM intake (public POST) + admin GET/PATCH
│   │   ├── og/route.tsx          # static 1200×630 social share card (next/og)
│   │   ├── properties/route.ts   # listing feed, ?slug= for a single residence
│   │   ├── stats/route.ts        # market insights + neighborhood catalogue
│   │   ├── subscribe/route.ts    # newsletter signup (idempotent)
│   │   └── valuation/route.ts    # AI estimate → ValuationResult
│   ├── globals.css               # design tokens: evergreen/amber/paper (brand #0C3B2E, sun #E8A33D), light mode
│   ├── icon.tsx · apple-icon.tsx # file-convention favicons (rendered PNGs)
│   ├── layout.tsx                # fonts, SEO metadata, OpenGraph/Twitter, JSON-LD
│   ├── manifest.ts               # PWA web app manifest (served at /manifest.webmanifest)
│   ├── page.tsx                  # single-page shell, 9-view switch, WhatsApp float
│   └── robots.ts · sitemap.ts    # /robots.txt and /sitemap.xml metadata routes
├── components/
│   ├── delima/                   # feature views, cards, shell, compare bar, AI widget, SW register
│   └── ui/                       # shadcn/ui primitives
├── hooks/
│   └── use-delima-data.ts        # module-cached data hooks + shared filterProperties engine
└── lib/
    ├── admin-auth.ts             # x-admin-key gate (constant-time comparison)
    ├── data.ts                   # DB → DTO serializers (server-side data access)
    ├── db.ts                     # Prisma client singleton
    ├── format.ts                 # KES formatting, labels, WhatsApp deep links
    ├── rate-limit.ts             # in-memory sliding-window rate limiter
    ├── store.ts                  # Zustand app store (view, filters, favorites, assistant…)
    └── types.ts                  # shared DTO contracts — every engineer builds against these
prisma/
├── schema.prisma                 # Neighborhood · Agent · Property · Lead · MarketStat · Subscriber
└── seed.ts                       # enriched demo dataset (clears all tables, then reseeds)
tests/
├── api/                          # route-handler suites (run directly against the SQLite DB)
├── unit/                         # pure-function suites (formatting, helpers)
├── setup.ts · vitest.config.ts   # node environment, sequential files (SQLite single writer)
```

A hand-written service worker lives at `public/sw.js` (registered production-only — see
[PWA & SEO](#pwa--seo-notes)).

## Getting started

Prerequisites: [Bun](https://bun.sh) 1.1+ (the project is developed and tested on Bun 1.3;
Node.js 20+ works for most commands, but `bun run start` invokes Bun directly).

```bash
git clone https://github.com/Roy-Wanyoike/New-Delima-Realtors.git
cd New-Delima-Realtors
bun install
cp .env.example .env        # DATABASE_URL defaults to file:./db/custom.db
bunx prisma db push         # create the schema
bun prisma/seed.ts          # load the demo dataset (see note below)
bun run dev                 # → http://localhost:3000
```

**About the seed** (`bun prisma/seed.ts`): it *clears every table first* (leads, subscribers,
properties, agents, market stats, neighborhoods) and then inserts the full demo dataset. That
makes it safe to re-run any time you want a clean slate — but it **wipes any data created
through the app** (test leads, newsletter signups, etc.). For a fresh setup, run it once after
`prisma db push`.

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Next dev server on port 3000 (output tee'd to `dev.log`). |
| `bun run build` | Production build → standalone server; copies `.next/static` and `public` into `.next/standalone`. |
| `bun run start` | Runs the standalone server (`NODE_ENV=production bun .next/standalone/server.js`). |
| `bun run lint` | ESLint across the repository. |
| `bun run test` | `vitest run` — unit + API suites under `tests/`. |
| `bun run test:watch` | Vitest in watch mode. |
| `bun run db:push` | `prisma db push --accept-data-loss` — sync schema to SQLite. |
| `bun run db:generate` | `prisma generate` — regenerate the Prisma client. |
| `bun run db:migrate` / `bun run db:reset` | `prisma migrate dev` / `prisma migrate reset`. |

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | `file:./db/custom.db` | SQLite connection string used by Prisma. |
| `ADMIN_PASSCODE` | no | `delima2026` | Passcode accepted in the `x-admin-key` header for CRM endpoints. **Demo-only default — always override it** for any deployment others can reach. |
| `RATE_LIMIT_DISABLED` | no | *(unset = limiting on)* | Set to `1` to disable rate limiting (tests/CI). Rate limiting also auto-disables when `NODE_ENV=test`. |

## API reference

Every route returns JSON, is `force-dynamic`, and validates its input with zod — the one
exception is `GET /api/og`, a `force-static` image endpoint. Base URL: `http://localhost:3000`.

| Method & path | Auth | Purpose |
| --- | --- | --- |
| `GET /api/health` | public | Liveness + DB probe → `{ status, service, version, database, timestamp }`; `503` when the DB is unreachable. |
| `GET /api/properties` | public | All listings as `PropertyDTO[]` (42 in the demo set). |
| `GET /api/properties?slug=…` | public | A single residence; `404` when the slug is unknown. |
| `GET /api/stats` | public | `{ insights, neighborhoods }` — 9 neighborhoods × 12 months of price/volume series. |
| `GET /api/leads` | **`x-admin-key` header** | Full CRM lead list as `LeadDTO[]`; `401` without a valid key. |
| `POST /api/leads` | public · 10 req/min/IP | Create a lead (name, email, phone, optional message/propertyId/source/budgetKes) → `201` + scored `LeadDTO`. |
| `PATCH /api/leads` | **`x-admin-key` header** | Update `{ id, status?, assignedTo?, note? }` → updated `LeadDTO`; system notes are appended automatically. |
| `POST /api/subscribe` | public · 5 req/min/IP | Newsletter signup → `201 { ok: true, already: false }` or `200 { ok: true, already: true }`. |
| `POST /api/assistant` | public · 15 req/5 min/IP | Concierge chat `{ messages }` → `{ reply, properties, filters? }` (applied client-side to the search filters). |
| `POST /api/valuation` | public · 10 req/5 min/IP | Valuation request → `ValuationResult` (low/mid/high KES, confidence %, narrative, comps). |
| `GET /api/og` | public | Static 1200×630 branded social share card (`next/og`), long cache — referenced by the OpenGraph/Twitter metadata. |

**Admin key note:** `GET` and `PATCH` on `/api/leads` require `x-admin-key` to match
`ADMIN_PASSCODE` (default `delima2026` in demo). `POST` deliberately stays public — it is the
buyer intake endpoint used by every enquiry form. Rate-limited routes answer `429` with
`{ error, retryAfter }` and a `retry-after` header.

Live health check shape (quoted from a running dev server):

```json
{"status":"ok","service":"delima-realtors-platform","version":"2.0.0","database":"connected","timestamp":"2026-09-22T23:25:50.558Z"}
```

## Security

- **CRM admin gate.** `GET`/`PATCH` `/api/leads` compare the `x-admin-key` header against
  `ADMIN_PASSCODE` in constant time (both sides hashed to fixed-length SHA-256 digests before
  comparison, so response timing leaks nothing). Invalid/missing key → `401`.
- **Rate limiting.** Sliding-window, per-IP (best-effort from `x-forwarded-for`) and per-route:
  subscribe 5/min · lead intake 10/min · assistant 15/5 min · valuation 10/5 min. In-memory and
  fail-open by design; disable via `RATE_LIMIT_DISABLED=1`. Swap for a shared store (Redis) when
  running more than one instance.
- **Validation.** Every mutating route parses its body with zod and returns structured
  `400 { error, issues }` responses; unknown `propertyId` references are rejected.
- **Demo-grade — production TODO:**
  - The demo passcode `delima2026` is public (shown as a hint in the CRM view). The client-side
    passcode gate is UX only — the real enforcement is the server-side `x-admin-key` check.
  - No user accounts yet (roadmap #59); a CSP is the remaining header TODO (HSTS, nosniff,
    `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy` are already sent from
    `next.config.ts`; HSTS activates when `NODE_ENV=production`). SQLite is single-file and
    single-writer; the dataset is fictional demo data.
- **Fail-closed production.** With `NODE_ENV=production` and no `ADMIN_PASSCODE` configured,
  the CRM gate denies every request rather than falling back to the demo passcode.

## PWA & SEO notes

- **SEO metadata** — title template, description, canonical URL and locale-aware OpenGraph +
  Twitter cards live in `src/app/layout.tsx` (`metadataBase` = `https://delimarealtors.co.ke`).
- **Social share image** — `GET /api/og` renders a static 1200×630 branded card with `next/og`
  and is wired into the OpenGraph/Twitter metadata.
- **JSON-LD** — a static `RealEstateAgent` schema block is rendered in the root layout.
- **robots & sitemap** — `src/app/robots.ts` serves `/robots.txt` (crawl everything + sitemap
  link); `src/app/sitemap.ts` serves `/sitemap.xml` with the single canonical URL (the SPA has
  no other indexable paths).
- **PWA** — `src/app/manifest.ts` serves the web app manifest (`/manifest.webmanifest`,
  standalone display, gold theme color) with icons generated by the file-convention `icon.tsx`
  route. The hand-written service worker (`public/sw.js`) is registered **production-only** via
  `SwRegister` — `NODE_ENV` is inlined at build time, so dev hot-reload stays cache-free.
- On the roadmap: internationalization and dynamic per-property OG images (#62).

## Testing

```bash
bun run test          # vitest run
bun run test:watch    # watch mode
```

The Vitest suite (`vitest.config.ts`) runs in a Node environment:

- `tests/unit/*.test.ts` — pure helpers (e.g. KES formatting).
- `tests/api/*.test.ts` — route handlers exercised directly as functions against the real
  SQLite database via Prisma (no network).

The config pins `NODE_ENV=test` and `RATE_LIMIT_DISABLED=1` so suites are deterministic, sets
`ADMIN_PASSCODE=delima2026` for the admin-key guard, and runs files sequentially
(`fileParallelism: false`) because SQLite allows a single writer.

## Production build

```bash
bun run build   # next build → standalone output (+ static & public copied in)
bun run start   # NODE_ENV=production bun .next/standalone/server.js
```

The server honors the `PORT` environment variable (default 3000).

## Deployment (Vercel + Supabase)

Production deploys from `main` only — see **[DEPLOYMENT.md](./DEPLOYMENT.md)**
for the full runbook. Highlights:

- `vercel.json` pins `framework: "nextjs"` and builds with the **Postgres**
  Prisma schema (`prisma/schema.postgres.prisma`) for serverless functions.
- `DATABASE_URL` (Supabase transaction pooler, port 6543) and
  `ADMIN_PASSCODE` are set as Vercel environment variables; tables + seed data
  are provisioned once from a machine via `npm run db:pg:push` +
  `npm run db:pg:seed` (session pooler, port 5432).
- All historical feature branches were merged/deleted and
  *automatically-delete-head-branches* is enabled, so `main` is the only
  branch that ever deploys.

## Troubleshooting

- **Port 3000 already in use** — the dev script pins `-p 3000`. Free it with
  `lsof -ti :3000 | xargs kill` and re-run `bun run dev`.
- **`Error: SQLite database is locked`** — SQLite allows a single writer. Stop other dev
  servers or processes holding `db/custom.db`, then retry.
- **`@prisma/client did not initialize yet`** (after pulling a schema change) — run
  `bun run db:generate`, then `bun run db:push` if tables are missing.
- **AI endpoints failing (429/502)** — you may have hit a rate limit (see table above) or the
  z-ai platform credentials aren't available in your environment. The app degrades gracefully:
  the assistant replies with a fallback message and featured listings; the valuation returns a
  deterministic template narrative.
- **"My test leads disappeared"** — `bun prisma/seed.ts` clears all tables before reseeding.

## Roadmap

Open work and sprint planning live in the
[issue tracker](https://github.com/Roy-Wanyoike/New-Delima-Realtors/issues) — highlights:
full buyer accounts (#59) and internationalization + dynamic per-property OG images (#62).

## License

[MIT](./LICENSE) © Delima Realtors
