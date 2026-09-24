// Delima Realtors Platform 2.0 — in-memory sliding-window rate limiter (issue #64)
//
// SCOPE NOTE (README-facing): this limiter is PER-PROCESS, IN-MEMORY ONLY.
// It is the right tool for this single-node demo deployment. If the platform
// is ever scaled horizontally (multiple instances / serverless), the counters
// below will not be shared between processes — production should swap this
// module for a Redis (or similar) token/sliding-window store behind the same
// enforceRateLimit() signature so call sites don't change.
//
// Storage: Map<`${bucket}:${ip}`, number[]> of request timestamps.
// Expired timestamps are pruned on every call; the map itself is capped at
// MAX_BUCKETS keys (oldest-touched buckets evicted first) so a large IP
// population or an attack with spoofed x-forwarded-for values cannot grow
// memory unboundedly.

/** Maximum number of tracked buckets before oldest-touched keys are evicted. */
const MAX_BUCKETS = 5000

/** Buckets keyed by `${bucket}:${ip}` → ascending array of request timestamps. */
const buckets = new Map<string, number[]>()

export interface RateLimitResult {
  ok: boolean
  /** Seconds the client should wait before retrying (0 when ok). */
  retryAfter: number
}

/** True when rate limiting is globally disabled (tests / explicit opt-out). */
export function isRateLimitDisabled(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.RATE_LIMIT_DISABLED === '1'
}

/**
 * Best-effort client IP: first entry of x-forwarded-for (trim), else 'local'.
 * Spoofable by design in this demo topology — that's acceptable for a
 * best-effort limiter; a production gateway would set x-forwarded-for itself.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  return 'local'
}

/**
 * Sliding-window limiter. Records the request and reports whether the caller
 * is over `${limit} requests per ${windowMs}ms` for `${bucket}:${ip}`.
 * Never throws — on any internal failure the request is allowed through
 * (fail-open) so the limiter can never take the API down.
 */
export function enforceRateLimit(request: Request, bucket: string, limit: number, windowMs: number): RateLimitResult {
  if (isRateLimitDisabled()) return { ok: true, retryAfter: 0 }
  try {
    const key = `${bucket}:${getClientIp(request)}`
    const now = Date.now()

    // Prune timestamps that fell out of the window.
    const timestamps = (buckets.get(key) ?? []).filter((ts) => now - ts < windowMs)

    if (timestamps.length >= limit) {
      // Oldest in-window hit determines how long until a slot frees up.
      const oldest = Math.min(...timestamps)
      const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000))
      touch(key, timestamps)
      return { ok: false, retryAfter }
    }

    timestamps.push(now)
    touch(key, timestamps)
    evictIfNeeded()
    return { ok: true, retryAfter: 0 }
  } catch {
    return { ok: true, retryAfter: 0 } // fail-open, never block traffic on limiter bugs
  }
}

/** Move `key` to the back of the Map so eviction targets least-recently-touched buckets. */
function touch(key: string, timestamps: number[]): void {
  buckets.delete(key)
  buckets.set(key, timestamps)
}

/** Hard cap on tracked buckets — drop oldest-touched keys beyond MAX_BUCKETS. */
function evictIfNeeded(): void {
  const excess = buckets.size - MAX_BUCKETS
  if (excess <= 0) return
  let deleted = 0
  for (const key of buckets.keys()) {
    buckets.delete(key)
    if (++deleted >= excess) break
  }
}

/** Canonical 429 response body/shape shared by every gated route. */
export function rateLimitedResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again shortly.', retryAfter }),
    {
      status: 429,
      headers: { 'content-type': 'application/json', 'retry-after': String(retryAfter) },
    },
  )
}
