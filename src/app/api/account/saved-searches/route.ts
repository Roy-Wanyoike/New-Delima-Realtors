// Delima Realtors 3.0 — saved searches for buyer accounts (issue #59)
// GET    /api/account/saved-searches              → 200 { searches: SavedSearchDTO[] }
// POST   { name, filters }                        → 201 { search } (max 6 per buyer)
// DELETE { id }                                   → 200 { ok: true }
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSessionBuyer } from '@/lib/buyer-auth'
import type { SavedSearchDTO } from '@/app/api/account/route'

export const dynamic = 'force-dynamic'

const MAX_SAVED_SEARCHES = 6

// Accepts any partial FilterState snapshot — the client persists full state,
// the server only validates shape/value bounds before storing JSON.
const filtersSchema = z.record(z.string(), z.unknown()).refine(
  d => typeof d.q === 'string' && d.q.length <= 200,
  { message: 'filters.q must be a string' },
)

const createSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name is too long'),
  filters: filtersSchema,
})

export async function GET(request: Request) {
  const buyer = await getSessionBuyer(request)
  if (!buyer) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const rows = await db.savedSearch.findMany({
    where: { buyerId: buyer.id },
    orderBy: { createdAt: 'desc' },
  })
  const searches: SavedSearchDTO[] = rows
    .map(row => {
      try {
        return {
          id: row.id,
          name: row.name,
          filters: JSON.parse(row.queryJson) as unknown as SavedSearchDTO['filters'],
          createdAt: row.createdAt.toISOString(),
        }
      } catch {
        return null
      }
    })
    .filter((s): s is SavedSearchDTO => s !== null)

  return NextResponse.json({ searches })
}

export async function POST(request: Request) {
  const buyer = await getSessionBuyer(request)
  if (!buyer) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) },
      { status: 400 },
    )
  }

  const count = await db.savedSearch.count({ where: { buyerId: buyer.id } })
  if (count >= MAX_SAVED_SEARCHES) {
    return NextResponse.json(
      { error: `You can save up to ${MAX_SAVED_SEARCHES} searches. Remove one first.` },
      { status: 409 },
    )
  }

  const row = await db.savedSearch.create({
    data: {
      buyerId: buyer.id,
      name: parsed.data.name,
      queryJson: JSON.stringify(parsed.data.filters),
    },
  })
  const search: SavedSearchDTO = {
    id: row.id,
    name: row.name,
    filters: parsed.data.filters as unknown as SavedSearchDTO['filters'],
    createdAt: row.createdAt.toISOString(),
  }
  return NextResponse.json({ search }, { status: 201 })
}

export async function DELETE(request: Request) {
  const buyer = await getSessionBuyer(request)
  if (!buyer) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = z.object({ id: z.string().trim().min(1).max(64) }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  // deleteMany scoped by buyerId → ownership enforced, idempotent 200.
  await db.savedSearch.deleteMany({ where: { id: parsed.data.id, buyerId: buyer.id } })
  return NextResponse.json({ ok: true })
}
