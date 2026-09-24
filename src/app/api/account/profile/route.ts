// Delima Realtors 3.0 — buyer profile update (issue #59)
// PATCH /api/account/profile { name?, phone? } → 200 { buyer } | 401
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { BUYER_CLIENT_DTO_FIELDS, getSessionBuyer } from '@/lib/buyer-auth'

export const dynamic = 'force-dynamic'

const patchSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is too short').max(80, 'Name is too long').optional(),
    phone: z.string().trim().max(30, 'Phone is too long').optional(),
  })
  .refine(d => d.name !== undefined || d.phone !== undefined, {
    message: 'Nothing to update — provide name or phone',
  })

export async function PATCH(request: Request) {
  const buyer = await getSessionBuyer(request)
  if (!buyer) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) },
      { status: 400 },
    )
  }

  const updated = await db.buyer.update({
    where: { id: buyer.id },
    data: parsed.data,
    select: BUYER_CLIENT_DTO_FIELDS,
  })
  return NextResponse.json({ buyer: updated })
}
