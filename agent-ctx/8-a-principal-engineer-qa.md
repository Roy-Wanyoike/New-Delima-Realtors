# Task 8-a — principal-engineer-qa: Vitest unit + API test suite (issue #66)

Agent: principal-engineer-qa
Status: COMPLETE — 63/63 tests green (2× consecutive idempotence proven), tsc clean under tests/ + src/

## Files created / touched (exclusive ownership respected)
- `package.json` — ONLY: added `"test": "vitest run"`, `"test:watch": "vitest"` scripts + `vitest@5.0.1` devDependency (the only dependency change; no jsdom/playwright)
- `vitest.config.ts` — node env, alias `@` → `src/`, setupFiles `tests/setup.ts`, testTimeout 20_000, passWithNoTests false, `fileParallelism: false` (SQLite single-writer safety across suites), env block pins NODE_ENV=test / RATE_LIMIT_DISABLED=1 / ADMIN_PASSCODE=delima2026 / DATABASE_URL=file:/home/z/my-project/db/custom.db
- `tests/setup.ts` — env set BEFORE any route-module import (rate limiter + admin gate + Prisma datasource observe them)
- `tests/unit/format.test.ts` (14 tests) — formatKes plain/compact (K/M/B/K), formatPriceForStatus rent-vs-sale, formatSqm, all 4 label maps, whatsappLink digit-stripping + URL encoding
- `tests/unit/filter-engine.test.ts` (23 tests) — imports pure `filterProperties` from the 'use client' hook module (loads fine in node): empty filters, token-AND q ("villa in karen", case-insensitivity, haystack = title/description/neighborhood/address/type/amenities), type/status/neighborhood/beds/min-max price/featuredOnly/combined filters, all 5 sort modes, input non-mutation, rent-vs-sale price semantics (none — documented)
- `tests/api/health.test.ts` (1) — 200 {status:'ok', database:'connected', service, version, timestamp}
- `tests/api/properties.test.ts` (3) — 200 array + DTO shape; `?slug=<real>` (slug sourced live from the 200 response); unknown slug → 404 {error}
- `tests/api/stats.test.ts` (1) — shape: insights.neighborhoods (slug/name/avgPricePerSqm/latestYoY/totalVolume12m + series of month/median/psqm/volume/yoy) + neighborhoods array (polygon/highlights), lengths consistent
- `tests/api/leads.test.ts` (12) — handlers invoked directly as plain Next 16 functions; collection-time probe auto-detects the auth contract: GET no-key → 401 {error:'Unauthorized'}, wrong-key → 401, right-key → 200 LeadDTO[]; POST public: 201 {id, status NEW, numeric score}, 400 missing name (+issues), 400 invalid email, 400 'Unknown propertyId', 201 with real propertyId (propertyTitle resolved); PATCH with key: status → 200 + System 'Status → CONTACTED' note, note → 200 + Agent note, unknown id → 404, no-key → 401. afterAll: deleteMany TEST-QA-*/test-qa@example.com + zero-residue assertion
- `tests/api/valuation.test.ts` (3) — real route incl. LLM narrative (~1.8-3.2s; per-test timeout 60s): 200 with low≤mid≤high, mid % 100k === 0, confidence 60-96, 3-4 comps (non-rental, well-formed similarityNote), non-empty narrative; 400 missing name; 400 sqm=5. afterAll: VALUATION+test-qa@example.com rows deleted + zero-residue assertion
- `tests/api/subscribe.test.ts` (3) — 201 {ok:true,already:false} → repeat 200 {ok:true,already:true} → 400 'notanemail'; self-skips with TODO warn if src/app/api/subscribe/route.ts is absent (guarded dynamic import — no fabrication); afterAll deletes the subscriber row
- `tests/api/assistant.test.ts` (3) — validation path only (no LLM): empty messages → 400, malformed JSON → 400, invalid role → 400

## Results
- `bun run test`: **9 files / 63 tests, 63 passed, 0 failed, 0 skipped**, ~3.9-5.3s per run
- Run twice consecutively: identical 63/63 both times (idempotent; in-suite zero-residue assertions prove no state leakage)
- DB baseline restored: 0 rows with TEST-QA-*/test-qa@example.com/test-subscribe-qa@example.com remain; properties 26 unchanged. (Absolute lead/subscriber counts drift only from concurrent sibling traffic — e.g. UX-QA's "Test UXQA" viewing request — not from this suite.)
- `bunx tsc --noEmit | grep -E "^tests/|^src/|^vitest"` → **empty** (0 type errors in my scope)

## Contracts — verification status
1. ✅ **x-admin-key guard (leads GET/PATCH)** — landed by 8-c exactly per contract: 401 {error:'Unauthorized'} on missing/wrong key, POST stays PUBLIC, constant-time compare via SHA-256 + timingSafeEqual (src/lib/admin-auth.ts)
2. ✅ **Rate limiting disabled in tests** — src/lib/rate-limit.ts honors NODE_ENV==='test' || RATE_LIMIT_DISABLED==='1'; observed buckets: leads 10/60s, subscribe 5/min, valuation 10/5min, assistant 15/5min; 429 {error, retryAfter} shape exists but is untestable with the flag on (by contract)
3. ✅ **/api/subscribe** — landed exactly per contract (201/200/400; P2002 race-safe already-detection)

## Deviations & product observations (reported, NOT fixed)
1. **`?slug=` contract deviation**: task brief said "?slug=<real> returns 1-item array" — the route actually returns a **single PropertyDTO object** (or 404 {error:'Property not found'}). Tests assert code reality; consumers expecting an array would break.
2. **formatKes compact-B quirk**: the B branch strips only a full '.00' → 4.2B renders "KES 4.20B" while the M branch trims '.0' (2.5M → "KES 2.5M"). Cosmetic inconsistency; test pins code reality + comment.
3. **filterProperties has no rent/sale price semantics**: maxPrice compares monthly rent and sale price on one axis when statuses are mixed; properties-view mitigates by resetting price bounds on status switch. Documented in a test comment.
4. **assistant server mirror drift risk**: route keeps its own `localFilterProperties` (substring q, no token-AND) rather than importing the client engine — behavior parity is untested (LLM path excluded by design); worth a follow-up issue if the client engine evolves.
5. **No suite isolation issues**: z-ai-web-dev-sdk and next/server import cleanly in node/vitest 5; no mocking needed anywhere.
