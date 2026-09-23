# Task 8-c — principal-engineer-security — API hardening (issue #64)

## Files
- NEW `src/lib/rate-limit.ts` — in-memory sliding-window limiter
- NEW `src/lib/admin-auth.ts` — admin passcode gate (constant-time)
- NEW `src/app/api/subscribe/route.ts` — newsletter subscribe endpoint
- EDIT `src/app/api/leads/route.ts` — admin gate on GET+PATCH, rate limit on POST
- EDIT `src/app/api/assistant/route.ts` — rate limit 15/5min (first check only)
- EDIT `src/app/api/valuation/route.ts` — rate limit 10/5min (first check only)
- Inspected, no change needed: `api/health`, `api/properties`, `api/stats`, `api/route.ts`

## Contracts for downstream consumers (8-d and others)
1. `GET`/`PATCH /api/leads` require header `x-admin-key` == `ADMIN_PASSCODE` (fallback `'delima2026'`); failure → `401 {"error":"Unauthorized"}`. `POST /api/leads` remains PUBLIC (rate limited 10/min).
2. `enforceRateLimit(request, bucket, limit, windowMs) → {ok, retryAfter}` in `@/lib/rate-limit`; limited → `429 {"error":"Too many requests. Please try again shortly.","retryAfter":N}` + `Retry-After` header. Limits: leads POST 10/min · assistant 15/5min · valuation 10/5min · subscribe 5/min. Disabled when `NODE_ENV==='test'` or `RATE_LIMIT_DISABLED==='1'`.
3. `POST /api/subscribe {email}` → `201 {ok:true,already:false}` | `200 {ok:true,already:true}` | `400 {error}` | `429` | `500 {"error":"Unable to subscribe right now"}`. Email is trimmed + lowercased before dedup.

## Curl evidence (dev server, limits active)
- `GET /api/leads` no key → `401 {"error":"Unauthorized"}`; with key → `200` LeadDTO[]
- `PATCH /api/leads` no key → `401`; valid key + unknown id → `404 {"error":"Lead not found"}`
- `POST /api/leads` valid → `201`; 12 rapid POSTs → `201×9` then `429` (retryAfter:54)
- `POST /api/subscribe` new → `201 {"ok":true,"already":false}`; repeat → `200 {"ok":true,"already":true}`; `not-an-email` → `400`; 257-char → `400`
- assistant/valuation invalid bodies → `400` (not 429/500); health/properties/stats unchanged

## Design notes
- `Subscriber.email` is `@unique` in the Prisma schema → subscribe is **create-first with P2002 catch**, which is fully race-safe (no findFirst-then-create window). Schema untouched.
- Admin compare: both sides SHA-256 hashed to 32-byte digests before `timingSafeEqual` (raw strings of unequal length would throw and leak length info).
- Limiter: per-key timestamp arrays pruned per call; Map capped at 5000 buckets with LRU-style eviction; fail-open on internal error so the limiter can never take the API down.

## Accepted risks
- Per-process in-memory limiter: resets on process reload, not shared across instances → Redis swap recommended for prod (same signature).
- Client IP from spoofable `x-forwarded-for` (demo topology; gateway should set it in prod).
- Demo passcode fallback `'delima2026'` — production must set `ADMIN_PASSCODE`.
- Counters increment before validation (rate limit is the first check by design).

## Product bugs noticed (report only, not fixed — outside ownership)
- `/api/valuation` creates the VALUATION lead before LLM enrichment; duplicate form submits create duplicate leads (limiter mitigates).
- `admin-view.tsx` client-side passcode gate is cosmetic; real enforcement is now server-side (as intended).
