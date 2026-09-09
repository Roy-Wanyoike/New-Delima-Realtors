# Delima Realtors — Nairobi Real Estate Platform

> **Live**: [www.delimarealtors.co.ke](https://www.delimarealtors.co.ke)
> **Instagram**: [@delima_realtors](https://www.instagram.com/delima_realtors)
> **Email**: info@delimarealtors.com · **Phone**: +254 727 523 752

A modern, production-ready real-estate marketing & property-management web app
for **Delima Realtors**, a Nairobi-based agency specializing in luxury
properties across Westlands, Kilimani, Karen, Muthaiga, Runda, Kileleshwa,
Loresho, Kitisuru, and Langata.

Built with **SvelteKit 2 + Svelte 5 + TypeScript 5 + Supabase**.
Deployed to **Vercel** via `@sveltejs/adapter-vercel`.

---

## Features

### Public site
- **Home** — animated hero, stats counters, featured properties (with fav/compare buttons), neighborhood guides, testimonials carousel, FAQ accordion, newsletter signup, dark mode toggle.
- **Properties** (`/projects`) — filterable grid with search, category chips, sort (price/beds/featured), featured-only toggle, location-based filtering (`?location=`), skeleton loaders, fav + compare buttons, pagination-ready.
- **Property detail** (`/projects/[id]`) — image gallery + lightbox, mortgage calculator, share bar (WhatsApp/X/Facebook/Email/Copy), favorite + compare actions, related properties, breadcrumbs.
- **Neighborhoods** (`/neighborhoods`) — 8 Nairobi area guides with popularity bars, price ranges, highlights.
- **Agents** (`/agents`) — team profiles with ratings, specialties, contact buttons; individual profile pages (`/agents/[slug]`).
- **Blog** (`/blog`) — articles with reading-progress bar, category filter, related posts sidebar.
- **Valuation** (`/valuation`) — 3-step wizard for sellers to request a free property valuation.
- **Social Feed** (`/feed`) — Instagram-style gallery grid (manual posts + Graph API sync ready).
- **Favorites** (`/favorites`) — localStorage-backed wishlist with count badge.
- **Compare** (`/compare`) — side-by-side comparison (max 3, sessionStorage-persisted).
- **Contact** (`/contact`) — validated form with honeypot + Supabase insert.
- **Global search** — Cmd/Ctrl+K modal with live filtering across properties, blog, agents, pages.

### Admin dashboard (`/admin`)
- **Listings CRUD** — add/edit/delete properties with image upload.
- **Inquiries** — view/manage contact form submissions.
- **Instagram feed** — manual post upload + Graph API sync documentation.
- **Server-side auth** — Supabase Auth + `+layout.server.ts` route guard + RLS.

### Cross-cutting
- **Dark mode** — persisted, respects OS preference, FOUC prevention.
- **Toasts** — success/error notifications.
- **Cookie consent** — GDPR-style banner.
- **Scroll-to-top** — appears after scroll.
- **Mobile bottom nav** — Home/Properties/Search/Saved.
- **Security** — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- **CI** — GitHub Actions (`svelte-check` + `vite build`).
- **SEO** — per-page `<title>`/`<meta>`, `noindex` on admin/error pages.

---

## Tech stack

| Layer        | Technology |
|--------------|------------|
| Framework    | SvelteKit 2 (App Router) + Svelte 5 + TypeScript 5 |
| Backend/BaaS | Supabase (Postgres + Auth + Storage + RLS) |
| Styling      | Bootstrap 5 + custom CSS (gold `#d4af37` / espresso `#1f1810`) |
| Build        | Vite 7 |
| Deploy       | Vercel (`@sveltejs/adapter-vercel`) |
| CI           | GitHub Actions |

**Stack decision**: see [`docs/ADR-001-tech-stack.md`](./docs/ADR-001-tech-stack.md).
**Brand brief**: see [`docs/BRAND_BRIEF.md`](./docs/BRAND_BRIEF.md).

---

## Prerequisites

- Node.js **20+** (LTS recommended)
- npm (or yarn — `yarn.lock` is retained for history)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#   fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY

# 3. Apply the database schema + RLS
psql "$DATABASE_URL" -f supabase/schema.sql
psql "$DATABASE_URL" -f supabase/rls.sql
#   (optional) psql "$DATABASE_URL" -f supabase/seed.sql

# 4. Run the dev server
npm run dev          # http://localhost:5173

# 5. Type-check + production build
npm run check        # svelte-check (must pass: 0 errors, 0 warnings)
npm run build        # vite build → .svelte-kit/vercel-output
```

## Environment variables

See [`.env.example`](./.env.example). **Never** commit real secrets — see
[`SECURITY.md`](./SECURITY.md) for the credential rotation incident.

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key | ✅ |
| `INSTAGRAM_USER_ID` | IG Business account ID (for Graph API sync) | Optional |
| `INSTAGRAM_ACCESS_TOKEN` | Meta long-lived access token | Optional |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build (adapter-vercel) |
| `npm run preview` | Preview the production build |
| `npm run check` | `svelte-check` type-check (0/0 required) |

## Project structure

```
src/
├── app.html                     # Document shell + vendored CSS/JS (deferred)
├── app.d.ts                     # App-wide ambient types
├── lib/
│   ├── components/              # 20+ components (Header, Footer, Chatbot,
│   │                             #   SearchModal, CompareBar, ScrollToTop,
│   │                             #   Toaster, CookieConsent, Testimonials,
│   │                             #   Newsletter, FAQ, ShareBar, MortgageCalc,
│   │                             #   StatCounter, Breadcrumbs, ThemeToggle,
│   │                             #   MobileBottomNav, …)
│   ├── data/                    # agents.ts, blog.ts, testimonials.ts,
│   │                             #   search.ts, instagram.ts
│   ├── stores/                  # favorites, compare, theme, toasts,
│   │                             #   recentlyViewed, adminAuth
│   ├── supabase.ts              # Supabase client (offline-mode safe)
│   └── types.ts                 # Project / Contact / ProjectInput types
├── routes/
│   ├── +layout.svelte           # Shell (sticky footer, dark mode, search, toasts)
│   ├── +error.svelte            # Branded 404/500 error page
│   ├── +page.svelte             # Home (hero, stats, featured, testimonials, FAQ, newsletter)
│   ├── about/                   # About page
│   ├── services/                # Services page
│   ├── projects/                # Properties listing + [id] detail
│   ├── neighborhoods/           # Nairobi neighborhood guides
│   ├── agents/                  # Agent listing + [slug] profiles
│   ├── blog/                    # Blog listing + [slug] articles
│   ├── feed/                    # Instagram social feed
│   ├── valuation/               # Multi-step valuation wizard
│   ├── favorites/               # Saved properties (localStorage)
│   ├── compare/                 # Side-by-side comparison
│   ├── contact/                 # Contact form (Supabase insert)
│   └── admin/                   # Protected admin (listings, contacts, instagram)
├── hooks.server.ts              # Security headers + CSP
└── ...
supabase/                         # schema.sql, rls.sql, seed.sql
docs/                             # BRAND_BRIEF.md, ADR-001-tech-stack.md
.github/workflows/ci.yml          # GitHub Actions CI
```

## Database

| Table | Purpose |
|-------|---------|
| `projects` | Property listings (title, price, beds, baths, image, category, status, featured, amenities) |
| `contacts` | Customer inquiries (name, email, phone, message, property_id, status) |
| `admins` | Admin allowlist (user_id → auth.users) |
| `instagram_posts` | Social feed posts (caption, media_url, permalink, tags, posted_at) |

- `supabase/schema.sql` — tables, indexes, triggers, `is_admin()` function.
- `supabase/rls.sql` — Row-Level Security: public read published projects; admin CRUD; contacts: public insert + admin read.
- `supabase/seed.sql` — 6 demo `koch-*` listings.

## Instagram sync

The `/feed` page displays Instagram posts in a gallery grid. Posts are stored
in the `instagram_posts` table.

**Current (manual fallback)**: Admin → Instagram Feed → paste image URL + caption.
See `src/lib/data/instagram.ts` for the Graph API integration reference.

**Graph API path** (owner action):
1. Convert `@delima_realtors` to a Business account.
2. Create a Meta Developer App with the Instagram Graph API product.
3. Set `INSTAGRAM_USER_ID` + `INSTAGRAM_ACCESS_TOKEN` env vars.
4. Enable the sync endpoint (documented in `instagram.ts`).

**Constraint**: Direct scraping violates Instagram's ToS and risks IP blocks.
Always use the official Graph API.

## Deployment (Vercel)

1. Import the repo on Vercel.
2. Framework preset: **SvelteKit**.
3. Add env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. `svelte.config.js` uses `adapter-vercel`; build command `npm run build`.
5. (Optional) Set up Vercel Cron for Instagram sync.

## Security

See [`SECURITY.md`](./SECURITY.md). Admin routes are protected server-side via
Supabase Auth + `+layout.server.ts`; customer PII is gated by RLS. Security
headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy) are
set in `hooks.server.ts`.

## License

[MIT](./LICENSE).
