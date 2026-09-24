// Delima Realtors 3.0 — saved properties for buyer accounts (issue #59)
// GET    /api/account/saved-properties           → 200 { saved: string[] } (slugs)
// POST   { slug }                                → 201 { saved: true }
// POST   { slugs: [...] }                        → 200 { saved: string[] } bulk merge (login sync)
// DELETE { slug }                                → 200 { saved: false }
// All endpoints 401 for guests.
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSessionBuyer } from '@/lib/buyer-auth'
import { getSavedSlugs } from '@/lib/data'

export const dynamic = 'force-dynamic'

const singleSchema = z.object({ slug: z.string().trim().min(1).max(120) })
const bulkSchema = z.object({
  slugs: z.array(z.string().trim().min(1).max(120)).max(200),
})

export async function GET(request: Request) {
  const buyer = await getSessionBuyer(request)
  if (!buyer) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  return NextResponse.json({ saved: await getSavedSlugs(buyer.id) })
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

  // Bulk merge path: guest favorites are promoted into the account on login.
  if (body && typeof body === 'object' && Array.isArray((body as { slugs?: unknown }).slugs)) {
    const parsed = bulkSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid slugs' }, { status: 400 })

    const properties = await db.property.findMany({
      where: { slug: { in: parsed.data.slugs } },
      select: { id: true },
    })
    if (properties.length > 0) {
      // SQLite has no INSERT OR IGNORE via Prisma's skipDuplicates — diff
      // against existing rows first so re-merging on every login stays idempotent.
      const existing = await db.savedProperty.findMany({
        where: { buyerId: buyer.id, propertyId: { in: properties.map(p => p.id) } },
        select: { propertyId: true },
      })
      const have = new Set(existing.map(e => e.propertyId))
      const fresh = properties.filter(p => !have.has(p.id))
      if (fresh.length > 0) {
        await db.savedProperty.createMany({
          data: fresh.map(p => ({ buyerId: buyer.id, propertyId: p.id })),
        })
      }
    }
    return NextResponse.json({ saved: await getSavedSlugs(buyer.id) })
  }

  const parsed = singleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) },
      { status: 400 },
    )
  }

  const property = await db.property.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } })
  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

  await db.savedProperty.upsert({
    where: { buyerId_propertyId: { buyerId: buyer.id, propertyId: property.id } },
    create: { buyerId: buyer.id, propertyId: property.id },
    update: {},
  })
  return NextResponse.json({ saved: true }, { status: 201 })
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

  const parsed = singleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) },
      { status: 400 },
    )
  }

  const property = await db.property.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } })
  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

  await db.savedProperty.deleteMany({ where: { buyerId: buyer.id, propertyId: property.id } })
  return NextResponse.json({ saved: false })
}
