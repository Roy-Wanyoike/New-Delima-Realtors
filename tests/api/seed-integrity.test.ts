// Delima Realtors 3.0 — seed data-integrity suite (REV-6)
//
// Guards the enriched REV-6 dataset against silent regressions. All assertions
// are read-only against the seeded SQLite DB (same database the dev server
// uses). Property/neighborhood/agent/marketStat rows are only written by the
// seed pipeline, so these checks are deterministic; Lead/Subscriber rows may
// also grow via public POST endpoints (assertions are therefore lower-bounded).
import { describe, it, expect } from 'vitest'
import { db } from '@/lib/db'

const UNSPLASH_RE = /^https:\/\/images\.unsplash\.com\/photo-[A-Za-z0-9_-]+\?q=80&w=\d+&auto=format&fit=crop$/

describe('seed integrity — properties', () => {
  it('seeds at least 30 properties', async () => {
    expect(await db.property.count()).toBeGreaterThanOrEqual(30)
  })

  it('uses a mixed status catalogue: FOR_SALE majority, ~8 FOR_RENT, 2-4 SOLD, 3-5 NEW_DEVELOPMENT', async () => {
    const rows = await db.property.findMany({ select: { status: true } })
    const byStatus = rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1
      return acc
    }, {})

    expect(byStatus.FOR_SALE).toBeGreaterThan(byStatus.FOR_RENT)
    expect(byStatus.FOR_SALE).toBeGreaterThan(byStatus.SOLD)
    expect(byStatus.FOR_SALE).toBeGreaterThan(byStatus.NEW_DEVELOPMENT)
    expect(byStatus.FOR_RENT).toBeGreaterThanOrEqual(6)
    expect(byStatus.FOR_RENT).toBeLessThanOrEqual(10)
    expect(byStatus.SOLD).toBeGreaterThanOrEqual(2)
    expect(byStatus.SOLD).toBeLessThanOrEqual(4)
    expect(byStatus.NEW_DEVELOPMENT).toBeGreaterThanOrEqual(3)
    expect(byStatus.NEW_DEVELOPMENT).toBeLessThanOrEqual(5)
  })

  it('prices rentals within the Nairobi band 45K-450K per month', async () => {
    const rentals = await db.property.findMany({ where: { status: 'FOR_RENT' }, select: { priceKes: true } })
    expect(rentals.length).toBeGreaterThan(0)
    for (const r of rentals) {
      expect(r.priceKes).toBeGreaterThanOrEqual(45_000)
      expect(r.priceKes).toBeLessThanOrEqual(450_000)
    }
  })

  it('prices Karen/Runda/Muthaiga sale villas between 60M and 265M', async () => {
    const villas = await db.property.findMany({
      where: { status: 'FOR_SALE', type: 'VILLA', neighborhood: { slug: { in: ['karen', 'runda', 'muthaiga'] } } },
      select: { priceKes: true },
    })
    expect(villas.length).toBeGreaterThanOrEqual(5)
    for (const v of villas) {
      expect(v.priceKes).toBeGreaterThanOrEqual(60_000_000)
      expect(v.priceKes).toBeLessThanOrEqual(265_000_000)
    }
  })

  it('prices Kilimani/Westlands sale apartments between 9.8M and 32M', async () => {
    const apts = await db.property.findMany({
      where: { status: 'FOR_SALE', type: 'APARTMENT', neighborhood: { slug: { in: ['kilimani', 'westlands'] } } },
      select: { priceKes: true },
    })
    expect(apts.length).toBeGreaterThanOrEqual(3)
    for (const a of apts) {
      expect(a.priceKes).toBeGreaterThanOrEqual(9_800_000)
      expect(a.priceKes).toBeLessThanOrEqual(32_000_000)
    }
  })

  it('prices land per plot (LAND listings stay under 50M)', async () => {
    const land = await db.property.findMany({ where: { type: 'LAND' }, select: { priceKes: true } })
    expect(land.length).toBeGreaterThanOrEqual(2)
    for (const l of land) {
      expect(l.priceKes).toBeGreaterThan(0)
      expect(l.priceKes).toBeLessThan(50_000_000)
    }
  })
})

describe('seed integrity — media', () => {
  it('gives every property 4-5 gallery images with valid Unsplash URLs', async () => {
    const props = await db.property.findMany({ select: { slug: true, images: true } })
    for (const p of props) {
      const images: unknown = JSON.parse(p.images)
      expect(Array.isArray(images), `${p.slug} images must be an array`).toBe(true)
      const list = images as string[]
      expect(list.length, `${p.slug} needs 4-5 images`).toBeGreaterThanOrEqual(4)
      expect(list.length).toBeLessThanOrEqual(5)
      for (const url of list) {
        expect(url, `${p.slug} has an invalid image URL`).toMatch(UNSPLASH_RE)
      }
    }
  })

  it('gives every neighborhood and agent a valid Unsplash image', async () => {
    for (const n of await db.neighborhood.findMany({ select: { image: true } })) {
      expect(n.image).toMatch(UNSPLASH_RE)
    }
    for (const a of await db.agent.findMany({ select: { photo: true } })) {
      expect(a.photo).toMatch(UNSPLASH_RE)
    }
  })

  it('gives every property Nairobi-realistic amenities (borehole, backup power, solar, security or DSQ)', async () => {
    const props = await db.property.findMany({ select: { slug: true, amenities: true, type: true } })
    const STAPLES = ['Borehole', 'Backup generator', 'Solar', '24/7 security', 'DSQ', 'Water and power on site']
    for (const p of props) {
      const amenities = JSON.parse(p.amenities) as string[]
      expect(amenities.length, `${p.slug} needs amenities`).toBeGreaterThan(0)
      if (p.type !== 'LAND') {
        expect(
          amenities.some(a => STAPLES.some(s => a.includes(s))),
          `${p.slug} lacks any Nairobi infrastructure staple`,
        ).toBe(true)
      }
    }
  })
})

describe('seed integrity — CRM + market data', () => {
  it('seeds 12+ leads across all lead statuses and at least 4 sources', async () => {
    const leads = await db.lead.findMany({ select: { status: true, source: true } })
    expect(leads.length).toBeGreaterThanOrEqual(12)

    const STATUSES = ['NEW', 'CONTACTED', 'VIEWING', 'OFFER', 'CLOSED', 'LOST']
    const SOURCES = ['CONTACT_FORM', 'VALUATION', 'AI_ASSISTANT', 'VIEWING_REQUEST', 'NEWSLETTER']
    const statusSet = new Set(leads.map(l => l.status))
    const sourceSet = new Set(leads.map(l => l.source))

    for (const s of STATUSES) expect(statusSet.has(s), `missing lead status ${s}`).toBe(true)
    expect(sourceSet.size).toBeGreaterThanOrEqual(4)
    for (const s of sourceSet) expect(SOURCES, `unknown lead source ${s}`).toContain(s)
  })

  it('keeps a few newsletter subscribers', async () => {
    expect(await db.subscriber.count()).toBeGreaterThanOrEqual(3)
  })

  it('seeds exactly 12 months of market stats per neighborhood (9 neighborhoods)', async () => {
    const neighborhoods = await db.neighborhood.findMany({ select: { id: true, slug: true } })
    expect(neighborhoods.length).toBe(9)

    const stats = await db.marketStat.findMany({ select: { neighborhoodId: true, month: true } })
    expect(stats.length).toBe(neighborhoods.length * 12)

    const byNb = stats.reduce<Record<string, number>>((acc, s) => {
      acc[s.neighborhoodId] = (acc[s.neighborhoodId] ?? 0) + 1
      return acc
    }, {})
    for (const n of neighborhoods) {
      expect(byNb[n.id], `${n.slug} should have 12 months of stats`).toBe(12)
    }
    for (const s of stats) {
      expect(s.month).toMatch(/^\d{4}-\d{2}$/)
    }
  })
})
