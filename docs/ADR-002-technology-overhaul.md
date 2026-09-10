# ADR-002: Technology Overhaul Evaluation

> Status: **Accepted** (2026-03).
> Supersedes: ADR-001 (which recommended KEEP — this evaluation confirms that
> decision but identifies specific Level 1-2 improvements).

## 1. Current Technology Stack

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| Framework | SvelteKit | 2.49+ | SSR + routing + API routes |
| UI Runtime | Svelte | 5.45+ (runes mode) | Reactive UI |
| Language | TypeScript | 5.9+ | Type safety |
| Build | Vite | 7.2+ | Dev server + production build |
| Backend/BaaS | Supabase | 2.95+ (supabase-js) | Postgres + Auth + Storage + RLS |
| Deploy | Vercel | adapter-vercel 6.3+ | Edge/SSR hosting |
| Styling | Bootstrap 5 + custom CSS | Vendored | Layout + theme |
| Vendored JS | jQuery 3.7, GSAP, Swiper, etc. | Vendored | UI interactions |
| CI | GitHub Actions | ci.yml | svelte-check + build |

## 2. Technology Stack Review (per technology)

### SvelteKit 2 + Svelte 5
- **Why it exists**: Chosen as the original framework; provides SSR, file-based routing, API endpoints.
- **Problem it solves**: Full-stack TypeScript framework with minimal boilerplate.
- **Still appropriate?**: **YES.** Svelte 5 runes mode ($state, $derived, $effect, $props) is the latest stable release. SvelteKit 2 is actively maintained. 0 type errors, 0 a11y warnings.
- **Current limitations**: Smaller ecosystem than React/Next.js; fewer third-party components; less middleware ecosystem.
- **Performance**: Excellent — Svelte compiles to vanilla JS, smallest bundle of any major framework. Build time: 7.7s.
- **Security considerations**: SSR runs server-side; `hooks.server.ts` for security headers + auth guard. No known vulnerabilities.
- **Maintenance burden**: LOW — only 1 production dependency (@supabase/supabase-js), 8 devDependencies.
- **Ecosystem health**: Svelte 5 is the current major version, actively developed by the Svelte team. Rich Harris (creator) is at Vercel — strong alignment with the deploy target.
- **Developer experience**: Excellent — fast HMR, clear file-based routing, TypeScript strict mode.
- **Hiring/skills**: Smaller talent pool than React, but Svelte developers are high-quality and the framework is easy to learn.
- **Long-term scalability**: Sufficient for a real-estate marketing + CMS site with <100K monthly visitors.
- **Verdict**: **KEEP** (Level 1 — Incremental Improvement).

### Supabase (Postgres + Auth + Storage + RLS)
- **Why it exists**: Provides Postgres database, authentication, file storage, and row-level security in one managed service.
- **Problem it solves**: Eliminates the need for a separate backend server, auth provider, and file storage — all managed via SQL + client SDK.
- **Still appropriate?**: **YES.** 6 tables (projects, contacts, admins, instagram_posts, valuations, newsletter_subscribers) with proper RLS policies. Auth via Supabase Auth (email + password). Storage for property images.
- **Current limitations**: Vendor lock-in (mild — Postgres is standard, but Supabase-specific APIs for Auth/Storage); no built-in full-text search (would need Postgres `tsvector` or external search like Algolia/Meilisearch for advanced search); no background jobs/cron (would need Vercel Cron or external).
- **Performance**: Postgres on Supabase free tier is shared compute; may need to upgrade for high traffic.
- **Security**: RLS is the primary data-layer boundary — properly configured (public read published projects, admin CRUD, contacts/valuations/newsletter: public insert only). Auth sessions via JWT.
- **Maintenance burden**: LOW — managed service, no server to maintain.
- **Cost**: Free tier covers 500MB DB + 1GB storage + 50K monthly active users. Pro plan ($25/mo) for production.
- **Verdict**: **KEEP** (Level 1 — Incremental Improvement).

### Vite 7
- **Why it exists**: Build tool + dev server.
- **Problem it solves**: Fast HMR, ESM-native build, tree-shaking.
- **Still appropriate?**: **YES.** Build time 7.7s for 22 routes + 18 components. Latest stable.
- **Verdict**: **KEEP**.

### Vendored JS (jQuery, Bootstrap, GSAP, Swiper, etc.)
- **Why it exists**: The original template (Inclub real-estate theme) shipped with jQuery 3.7, Bootstrap 5, GSAP, Swiper, magnific-popup, counterup, wow.js, parallaxie, YTPlayer, SplitText, magiccursor, slicknav, validator — 16 scripts totaling 552KB in `static/lib/js/`.
- **Problem it creates**: **552KB of vendored JavaScript loaded synchronously in `<head>`** (even with `defer`, they're 16 separate HTTP requests). jQuery + Bootstrap are redundant alongside Svelte. GSAP + Swiper could be replaced with Svelte-native or lightweight ESM alternatives. This is the **single biggest performance bottleneck**.
- **Evidence**: `src/app.html` loads 16 `<script defer>` tags + 8 `<link rel="stylesheet">` tags in `<head>`. The homepage (`+page.svelte`) is 2,007 lines — much of it wrapping Bootstrap classes that duplicate what Svelte components already do.
- **Current limitations**: jQuery is a 86KB runtime that Svelte doesn't need. Bootstrap's CSS (vendored, 520KB total) conflicts with custom CSS. GSAP + SplitText + magiccursor add visual effects that could be done with CSS animations. YTPlayer loads video backgrounds (no video on the site).
- **Verdict**: **REPLACE** (Level 3 — Partial Technology Migration). Remove jQuery, Bootstrap JS, and unused vendored scripts. Replace with Svelte-native components + CSS animations. Keep Swiper only if the carousel is used; otherwise replace with CSS scroll-snap. This is tracked as issue #9 (open).

### Bootstrap 5 (CSS only)
- **Why it exists**: Layout grid + utility classes from the original template.
- **Problem it creates**: 520KB of vendored CSS, much of which is unused. The custom CSS already overrides most Bootstrap styles. Conflicts with dark mode (Bootstrap doesn't support `[data-theme]` natively).
- **Verdict**: **REPLACE** (Level 3). Migrate to Tailwind CSS 4 or pure custom CSS with CSS variables. This would reduce CSS payload by ~80% and simplify the dark-mode implementation.

### GitHub Actions CI
- **Why it exists**: Quality gate — runs svelte-check + build on every PR.
- **Problem it creates**: No linting (ESLint/Prettier), no tests (Playwright/vitest), no security scanning.
- **Verdict**: **IMPROVE** (Level 1 — add ESLint + Prettier + Playwright smoke tests).

## 3. Technology Bottlenecks Identified

| # | Bottleneck | Evidence | Severity | Root Cause |
|---|-----------|----------|----------|------------|
| 1 | 552KB vendored JS in `<head>` | `du -sh static/lib/js/` = 552K, 16 `<script>` tags | **HIGH** | Legacy template — jQuery/Bootstrap/GSAP not needed with Svelte |
| 2 | 520KB vendored CSS | `du -sh static/lib/css/` = 520K, 8 `<link>` tags | **HIGH** | Bootstrap CSS + theme CSS not tree-shaken |
| 3 | Homepage is 2,007 lines | `wc -l src/routes/+page.svelte` = 2007 | **MEDIUM** | Template boilerplate + Bootstrap classes + duplicate FAQ/tab sections |
| 4 | Demo data duplicated 4+ times | `grep -rn "koch-1" src/` shows copies in 5 files | **MEDIUM** | No centralized data module until `demoProjects.ts` (PR #44) |
| 5 | No ESLint/Prettier/tests | `ls .github/workflows/` shows only svelte-check+build | **MEDIUM** | Issue #11 open |
| 6 | No rate limiting on public forms | Contact/valuation/newsletter inserts are unthrottled | **LOW** | Supabase RLS allows unlimited anon inserts |
| 7 | No observability/logging | No structured logging, error tracking, or metrics | **LOW** | No SRE agent has run yet |

## 4. Architecture Options Comparison

### Option A — Keep Existing Architecture (Status Quo)
- **Pros**: 0/0 svelte-check, clean Vercel build, 22 routes working, deployed to production.
- **Cons**: 1MB+ of vendored JS/CSS blocking render; homepage is 2K lines of template boilerplate; no tests; no linting.
- **Recommendation**: **NO** — the performance bottleneck (1MB+ vendored assets) is a measurable defect that can't be fixed without removing the vendored code.

### Option B — Improve Existing Architecture (Level 1-2)
- **Pros**: Keep SvelteKit + Supabase (proven, 0/0). Remove vendored JS/CSS (552KB + 520KB). Add ESLint + Prettier + Playwright. Refactor the homepage from 2K lines to modular components.
- **Cons**: Requires removing Bootstrap grid (used throughout) — significant CSS refactor. 2-3 weeks of effort.
- **Recommendation**: **YES** — this is the correct approach. The stack is sound; the vendored template code is the problem.

### Option C — Migrate to Next.js (Level 3-4)
- **Pros**: Larger ecosystem, `next/image` for automatic responsive images, Server Actions, better middleware.
- **Cons**: 3-4 week rewrite for zero user-facing gain. Would lose Svelte's smaller bundle sizes. Would need to rewrite all 18 components + 22 routes + 6 stores + 6 data modules.
- **Recommendation**: **NO** — the current stack is not the bottleneck. The vendored template code is.

## 5. Recommendation Summary

| Technology | Decision | Level | Rationale |
|-----------|----------|-------|-----------|
| SvelteKit 2 + Svelte 5 | **KEEP** | Level 1 | Latest stable, 0/0, excellent DX, smallest bundle |
| Supabase | **KEEP** | Level 1 | Managed Postgres + Auth + Storage + RLS — best fit |
| Vite 7 | **KEEP** | Level 1 | 7.7s build time, latest stable |
| Vercel | **KEEP** | Level 1 | adapter-vercel works, deployed to production |
| Vendored JS (jQuery/Bootstrap/GSAP) | **REPLACE** | Level 3 | 552KB blocking render — root cause of performance issues |
| Vendored CSS (Bootstrap) | **REPLACE** | Level 3 | 520KB, conflicts with custom CSS + dark mode |
| GitHub Actions CI | **IMPROVE** | Level 1 | Add ESLint + Prettier + Playwright |
| No tests | **ADD** | Level 1 | vitest (unit) + Playwright (E2E) |
| No observability | **ADD** | Level 1 | Vercel Analytics + structured console logging |

## 6. Migration Strategy

### Phase 1: Remove Vendored JS (Level 3 — 1-2 weeks)
1. Audit which vendored JS functions are actually called by `function.js` (the theme's init script).
2. Replace jQuery selectors with native `document.querySelector`.
3. Replace Bootstrap JS components (navbar toggle, carousel) with Svelte components.
4. Replace GSAP animations with CSS animations + `IntersectionObserver`.
5. Replace Swiper with CSS scroll-snap or a lightweight ESM carousel.
6. Remove unused: YTPlayer, magiccursor, parallaxie, SplitText (if not used).
7. Keep only: `validator.min.js` (or replace with native HTML5 validation).

### Phase 2: Remove Bootstrap CSS (Level 3 — 1-2 weeks)
1. Audit which Bootstrap utility classes are used across `.svelte` files.
2. Replace Bootstrap grid (`row`/`col-lg-*`) with CSS Grid/Flexbox.
3. Replace Bootstrap utility classes (`d-flex`, `text-center`, `mb-4`) with Tailwind CSS 4 or custom CSS.
4. Remove `bootstrap.min.css` from `app.html`.
5. Update dark-mode implementation to use CSS variables (no Bootstrap override conflicts).

### Phase 3: Add Testing + Linting (Level 1 — 1 week)
1. Add ESLint + Prettier config.
2. Add `lint` script to `package.json`.
3. Add vitest for unit tests (utilities, stores).
4. Add Playwright for E2E smoke tests (home loads, search works, contact submits).
5. Update CI to run lint + test + check + build.

### Phase 4: Add Observability (Level 1 — 3 days)
1. Add Vercel Analytics (free tier) for Core Web Vitals.
2. Add structured error logging in `hooks.server.ts`.
3. Add a `/api/health` endpoint for health checks.

## 7. Trade-offs

| Trade-off | Impact |
|-----------|--------|
| Removing Bootstrap | Requires rewriting grid/layout in all 22 routes — significant CSS work |
| Removing jQuery | `function.js` (theme init) depends on jQuery — needs rewriting |
| Adding Tailwind CSS | New dependency; learning curve; but 80% smaller CSS + better tree-shaking |
| Keeping SvelteKit | Smaller ecosystem than React; but proven for this use case |

## 8. Migration Cost Estimate

| Phase | Effort | Risk |
|-------|--------|------|
| Phase 1 (vendored JS removal) | 1-2 weeks | Medium — `function.js` depends on jQuery |
| Phase 2 (Bootstrap CSS removal) | 1-2 weeks | Medium — grid layout changes across 22 routes |
| Phase 3 (testing + linting) | 1 week | Low — additive, no breaking changes |
| Phase 4 (observability) | 3 days | Low — additive |
| **Total** | **3-5 weeks** | **Medium** — strangler-style, no big-bang rewrite |

## 9. Expected Benefits

| Benefit | Before | After |
|---------|--------|-------|
| JS payload (head) | 552KB (16 files) | ~0KB (Svelte compiles away) |
| CSS payload | 520KB (8 files) | ~50-80KB (tree-shaken) |
| Build time | 7.7s | ~5s (fewer files to process) |
| LCP | ~3-4s (blocked by vendored JS) | ~1-2s (no render-blocking) |
| CLS | Possible (Bootstrap conflicts) | 0 (CSS Grid + custom) |
| Dark mode | Conflicts with Bootstrap | Clean (CSS variables only) |

## 10. Final Decision

**KEEP SvelteKit + Supabase + Vite + Vercel. REPLACE vendored JS/CSS (jQuery/Bootstrap/GSAP). ADD testing + observability.**

This is a **Level 3 (Partial Technology Migration)** — replacing the vendored template layer while preserving the application layer. The application architecture is sound; the template boilerplate is the bottleneck.
