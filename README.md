# New-Delima-Realtors

Nairobi-based real-estate marketing & property-management web app for **Delima Realtors**.
Built with **SvelteKit + Supabase**.

> Public site: home, about, services, projects (listings), project detail, amenities, contact.
> Admin dashboard: listings CRUD + inquiries (contacts) management.

---

## Tech stack

| Layer        | Tech                                                    |
|--------------|---------------------------------------------------------|
| Framework    | SvelteKit 2 (App Router) + Svelte 5 + TypeScript 5     |
| Backend/BaaS | Supabase (Postgres + Auth + Storage)                    |
| Styling      | Bootstrap 5 + custom CSS (gold `#d4af37` / espresso `#1f1810`) |
| Build        | Vite 7                                                   |
| Deploy       | Vercel (`@sveltejs/adapter-vercel`)                      |

## Prerequisites

- Node.js **20+** (LTS recommended)
- npm (a single package manager is enforced — `yarn.lock` is retained for
  history; prefer `npm` going forward)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#   fill in your Supabase project URL + anon key

# 3. Apply the database schema + RLS policies (see supabase/ directory)
#    psql $DATABASE_URL -f supabase/schema.sql
#    psql $DATABASE_URL -f supabase/rls.sql

# 4. Run the dev server
npm run dev          # http://localhost:5173

# 5. Type-check + production build
npm run check
npm run build
npm run preview
```

## Environment variables

See [`.env.example`](./.env.example). **Never** commit real secrets — the
`test` file incident is documented in [`SECURITY.md`](./SECURITY.md).

## Scripts

| Script             | Purpose                                  |
|--------------------|------------------------------------------|
| `npm run dev`      | Start Vite dev server                    |
| `npm run build`    | Production build                         |
| `npm run preview`  | Preview the production build             |
| `npm run check`    | `svelte-check` type-check (must pass)    |

## Project structure

```
src/
├── app.html                # Document shell + vendored CSS/JS
├── app.d.ts                 # App-wide ambient types
├── lib/
│   ├── components/           # Header, Footer, Chatbot
│   ├── stores/adminAuth.ts  # Admin auth store (server-validated)
│   ├── supabase.ts          # Supabase client (offline-mode safe)
│   └── types.ts             # Shared Project / Contact types
├── routes/
│   ├── +layout.svelte       # Shell (sticky footer)
│   ├── +error.svelte        # Branded error page
│   ├── +page.svelte         # Home
│   ├── about/ services/ amenities/ projects/ projects/[id]/ contact/
│   └── admin/               # Protected admin (guarded by hooks.server.ts)
├── hooks.server.ts          # Auth guard + security headers
└── ...
supabase/                    # schema.sql, rls.sql, seed.sql
```

## Database

- `supabase/schema.sql` — tables, indexes, triggers
- `supabase/rls.sql` — Row-Level Security policies
- `supabase/seed.sql` — demo `koch-*` listings

## Deployment (Vercel)

1. Import the repo on Vercel.
2. Framework preset: **SvelteKit**.
3. Add env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. `svelte.config.js` uses `adapter-vercel`; build command `npm run build`.

## Security

See [`SECURITY.md`](./SECURITY.md). Admin routes are protected server-side;
customer PII is gated by RLS.

## License

[MIT](./LICENSE).
