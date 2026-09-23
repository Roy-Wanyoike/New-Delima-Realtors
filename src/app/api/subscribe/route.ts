// Delima Realtors Platform 2.0 — newsletter subscribe API (issue #64)
// POST /api/subscribe { email: string }
//   → 201 { ok: true, already: false }  (new subscriber)
//   → 200 { ok: true, already: true }   (email already subscribed)
//   → 400 { error }                     (invalid body/email)
//   → 429 { error, retryAfter }         (rate limited: 5/min per IP)
//   → 500 { error: 'Unable to subscribe right now' }
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { enforceRateLimit, rateLimitedResponse } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address').max(254, 'Email is too long'),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limit FIRST (5/min per IP) — before any body parsing.
    const rl = enforceRateLimit(req, 'subscribe', 5, 60_000)
    if (!rl.ok) return rateLimitedResponse(rl.retryAfter)

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = subscribeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    const email = parsed.data.email

    // Subscriber.email is @unique in the Prisma schema, so we create-first and
    // treat a unique-constraint violation (P2002) as "already subscribed".
    // This is fully race-safe: two concurrent POSTs for the same email can
    // never both return already:false — the loser hits the constraint and is
    // mapped to 200 { ok: true, already: true }. (Contract 3's fallback
    // findFirst-then-create is only needed when the column lacks @unique;
    // that is not the case here, and that approach would additionally leak a
    // race window.)
    try {
      await db.subscriber.create({ data: { email, source: 'NEWSLETTER' } })
      return NextResponse.json({ ok: true, already: false }, { status: 201 })
    } catch (err) {
      // Prisma P2002 = unique constraint violation (duck-typed to stay
      // independent of the Prisma error class import surface).
      if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: unknown }).code === 'P2002') {
        return NextResponse.json({ ok: true, already: true }, { status: 200 })
      }
      throw err
    }
  } catch (e) {
    // Generic 500 — never leaks stack traces or internal paths to the client.
    console.error('[api/subscribe]', e)
    return NextResponse.json({ error: 'Unable to subscribe right now' }, { status: 500 })
  }
}
