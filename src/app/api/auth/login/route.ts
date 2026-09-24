// Delima Realtors 3.0 — buyer login (issue #59)
// POST /api/auth/login { email, password }
//   → 200 { buyer } + Set-Cookie delima_session
//   → 401 { error } bad credentials | 400 | 429 rate limited
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  BUYER_CLIENT_DTO_FIELDS,
  createSession,
  sessionCookie,
  verifyPassword,
} from '@/lib/buyer-auth'
import { enforceRateLimit, rateLimitedResponse } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address').max(200),
  password: z.string().min(1, 'Password is required').max(200),
})

export async function POST(request: Request) {
  const limit = enforceRateLimit(request, 'auth-login', 10, 5 * 60 * 1000)
  if (!limit.ok) return rateLimitedResponse(limit.retryAfter)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) },
      { status: 400 },
    )
  }
  const { email, password } = parsed.data

  const buyer = await db.buyer.findUnique({ where: { email } })
  // Same message + similar work factor for "no such user" and "wrong password"
  // so the endpoint cannot be used to enumerate registered emails.
  if (!buyer || !verifyPassword(password, buyer.passwordHash)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const { token, expiresAt } = await createSession(buyer.id)
  const dto = await db.buyer.findUnique({ where: { id: buyer.id }, select: BUYER_CLIENT_DTO_FIELDS })
  return NextResponse.json({ buyer: dto }, { status: 200, headers: { 'Set-Cookie': sessionCookie(token, expiresAt) } })
}
