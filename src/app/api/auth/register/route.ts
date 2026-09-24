// Delima Realtors 3.0 — buyer registration (issue #59)
// POST /api/auth/register { name, email, phone?, password }
//   → 201 { buyer } + Set-Cookie delima_session
//   → 409 { error } duplicate email | 400 { error, issues } | 429 rate limited
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  BUYER_CLIENT_DTO_FIELDS,
  createSession,
  hashPassword,
  sessionCookie,
} from '@/lib/buyer-auth'
import { enforceRateLimit, rateLimitedResponse } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Invalid email address').max(200),
  phone: z.string().trim().min(7, 'Phone is too short').max(30).optional().default(''),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
})

export async function POST(request: Request) {
  const limit = enforceRateLimit(request, 'auth-register', 5, 60 * 60 * 1000)
  if (!limit.ok) return rateLimitedResponse(limit.retryAfter)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) },
      { status: 400 },
    )
  }
  const { name, email, phone, password } = parsed.data

  const existing = await db.buyer.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    return NextResponse.json(
      { error: 'An account with this email already exists. Try signing in instead.' },
      { status: 409 },
    )
  }

  const buyer = await db.buyer.create({
    data: { name, email, phone, passwordHash: hashPassword(password) },
    select: BUYER_CLIENT_DTO_FIELDS,
  })

  const { token, expiresAt } = await createSession(buyer.id)
  return NextResponse.json({ buyer }, { status: 201, headers: { 'Set-Cookie': sessionCookie(token, expiresAt) } })
}
