# REV-3 — Browse & Detail Engineer (properties-view.tsx, property-detail.tsx)

## Task
Rebuild the properties search results page and the property detail page on the frozen Delima 3.0 design system while preserving every existing behaviour.

## Files changed (owned only)
- `src/components/delima/properties-view.tsx` — full rewrite
- `src/components/delima/property-detail.tsx` — full rewrite

## Functionality checklist — PRESERVED
- Filtering (q, type, status, min/max price, beds, neighborhood, featuredOnly) via shared `setFilters`, applied instantly
- Sorting via shared `filters.sort` + `filterProperties` (token search untouched)
- Saved searches: save (with `describeSearchName`, kept exported), apply, remove, limit-6 destructive toast
- Favorites: favorites-only toggle in results toolbar + heart toggling w/ toast in detail
- Compare toggles (detail rail; disabled add at 3, matching spec)
- Map↔list hover sync: `hoveredSlug` ↔ `PropertyCard active` + `onHover`
- Brochure link `/api/properties/{slug}/brochure?print=1` (target _blank)
- Share: `navigator.share` → clipboard fallback + toast
- Viewing request lead form: POST `/api/leads` with `{name, email, phone, message(+date), propertyId, source:'VIEWING_REQUEST', budgetKes:null}` — matches `src/app/api/leads/route.ts` zod contract; success/error toasts
- Agent contacts: tel:, mailto:, WhatsApp (green #1faa53, `whatsappLink` w/ property title)
- Similar homes (up to 3, same `neighborhoodSlug`, exclude current)
- JSON-LD structured data (unchanged, hydration-safe)
- Loading skeletons, API error retry, not-found & no-slug EmptyStates (DB-empty safe)
- Valuation cross-link → `setView('valuation')`
- Neighborhood cross-links: "Explore on map" → map view; "More homes in X" → `setFilterAndGo`

## Functionality — ADDED
- Dynamic H1 ("Villas for sale in Karen" / "Results for “…”") + live result count
- Removable active-filter chips row + "Clear all"
- Sticky desktop filter rail (card-modern, top-24, delima-scroll) with debounced search, status/bedroom pills, rent-aware KES ladders (sale 2.5M–300M · rent 15K–500K/mo)
- Mobile filter Sheet (left) with sticky "Show N homes" btn-sun footer
- Saved-searches strip (play = apply, X = remove)
- Gallery: main + 2×2 thumbnails (+N overlay), lightbox with prev/next/counter/keyboard arrows
- Spec strip via `StatBlock` (beds/baths/sqm/parking/yearBuilt)
- "Location & neighbourhood" card w/ hood image + blurb from `useInsights` (graceful fallback)

## Verification
- `bun run lint` → clean (0 problems)
- `bunx tsc --noEmit` → 0 errors in REV-3 files (4 pre-existing errors in admin-view.tsx belong to REV-5)
- `dev.log` → compiles, `/api/properties` & `/api/stats` 200, no runtime errors

## Notes for next agents
- `describeSearchName` remains exported from properties-view (no external importers today, kept for safety)
- Lucide `Map` must be aliased (`Map as MapIcon`) where `new Map()` is used — TS shadowing pitfall
- Header is sticky top-0 h-16/72px → use `top-24` for sticky in-view elements
