# ADR-001: Tech Stack Decision — Keep SvelteKit + Supabase

> Phase 2 deliverable: Tech Stack Audit & Recommendation.
> Status: **Accepted** (2026-03).
> Supersedes: none.

## Context

The Delima Realtors website (`delimarealtors.co.ke`) is a production-deployed
**SvelteKit 2 + Svelte 5 + TypeScript + Supabase** application. Over 12
development rounds, it has accumulated:

- 17 GitHub issues tracked + resolved.
- 12+ merged/feature PRs covering security fixes, CI, favorites, comparison,
  mortgage calculator, neighborhood guides, agent profiles, blog, FAQ,
  dark mode, global search, mobile bottom nav, valuation wizard.
- `svelte-check`: 0 errors, 0 warnings.
- `vite build` → `@sveltejs/adapter-vercel` ✓ (deployed to Vercel).
- Supabase backend: Postgres + Auth + Storage + RLS policies.

The user asked: *"Recommend whether migrating to Next.js (App Router) is
worth it, or whether the current setup is performant and maintainable enough."*

## Decision

**Keep SvelteKit + Supabase. Do NOT migrate to Next.js.**

## Rationale

### 1. The current setup IS working well
- 0 type errors, 0 a11y warnings, clean Vercel build.
- Already deployed to production at `delimarealtors.co.ke`.
- 20+ routes, 15+ components, all verified via agent-browser QA.
- SSR + client-side navigation working correctly.

### 2. Migration cost is prohibitive
Migrating SvelteKit → Next.js would require:
- Rewriting 15+ `.svelte` components as `.tsx` React components.
- Rewriting all Svelte stores (favorites, compare, theme, toasts, recentlyViewed).
- Rewriting all runes-based reactive logic (`$state`, `$derived`, `$effect`).
- Reconfiguring Supabase client + Auth + SSR session management.
- Re-testing every route + interaction.
- **Estimated effort**: 3–4 weeks of full-time work for zero user-facing gain.

### 3. SvelteKit is equally performant
| Metric | SvelteKit | Next.js |
|--------|-----------|---------|
| SSR | ✓ (built-in) | ✓ (App Router) |
| Bundle size | Smaller (Svelte compiles away) | Larger (React runtime) |
| Image optimization | `@sveltejs/enhanced-img` or CDN | `next/image` (better ecosystem) |
| Vercel deployment | ✓ (adapter-vercel) | ✓ (native) |
| SEO | ✓ (SSR + meta tags) | ✓ (SSR + metadata API) |
| Dev speed | Faster (less boilerplate) | Slower (more ceremony) |

### 4. Next.js advantages we DON'T need
- `next/image`: we use Supabase Storage CDN + native lazy-loading.
- Server Actions: we use Supabase RLS (client-side inserts are safe).
- Edge middleware: we use `hooks.server.ts` (security headers + auth guard).

## Backend Recommendation: Supabase (already chosen)

Comparison against alternatives:

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Supabase** (current) | Postgres + Auth + Storage + RLS in one; generous free tier; real-time; edge functions | Vendor lock-in (mild); Supabase-specific APIs | ✅ **Keep** — best fit for image-heavy listings + lead forms |
| Next.js Server Actions + Vercel Postgres | Native to Next.js; type-safe end-to-end | Requires Next.js migration; less mature than Supabase Auth | ❌ Migration cost too high |
| Node/Express + Prisma | Full control; self-hostable | More ops burden; need separate auth + storage + CDN | ❌ Overkill for a marketing + CMS site |
| Laravel (PHP) | Mature ecosystem; Filament admin | Different language; slower dev for frontend-heavy app | ❌ Mismatched stack |
| Headless CMS (Sanity/Strapi/Payload) | Best for content/blog; visual editors | Less flexible for custom features (favorites, compare, mortgage calc); another service to run | ❌ We already have a custom CMS (admin dashboard) |

**Supabase wins** because it provides Auth, Postgres, Storage, and RLS in a
single managed service — exactly what a real-estate site needs (listings CRUD,
image uploads, contact-form submissions, admin auth) without running a separate
backend server.

## Image Optimization Strategy

Since we're NOT using `next/image`, we use:
1. **Supabase Storage CDN** — images served from `https://[project].supabase.co/storage/v1/object/public/`.
2. **Native `loading="lazy"`** on all `<img>` below the fold.
3. **CSS `object-fit: cover"`** + fixed-height containers to avoid layout shift.
4. **`<link rel="preconnect">`** for Supabase + Google Fonts in `app.html`.
5. **Vite build** handles CSS/JS minification + tree-shaking.

For the Instagram sync (Phase 4), images will be fetched from the Instagram
CDN and re-uploaded to Supabase Storage (or cached via a Vercel Edge Function)
to avoid hotlinking + rate limits.

## Tradeoffs Summary

| Factor | SvelteKit (keep) | Next.js (migrate) |
|--------|-------------------|-------------------|
| Hosting cost | Vercel free tier | Vercel free tier (same) |
| Dev speed | Faster | Slower (rewrite) |
| SEO | Equal | Equal |
| Image optimization | CDN + lazy-load | `next/image` (slightly better) |
| Community size | Smaller | Larger |
| Ecosystem fit | Perfect (already integrated) | Would require full rewrite |

## Follow-up Actions

1. ✅ Keep SvelteKit 2 + Svelte 5 + TypeScript 5.
2. ✅ Keep Supabase (Postgres + Auth + Storage + RLS).
3. ✅ Keep `@sveltejs/adapter-vercel` for Vercel deployment.
4. 📋 Add ESLint + Prettier (from issue #11) for code quality.
5. 📋 Consider `@sveltejs/enhanced-img` for automatic responsive images.
6. 📋 Build the Instagram Graph API sync module (Phase 4).
