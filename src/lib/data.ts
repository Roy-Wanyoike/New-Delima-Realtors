// Delima Realtors Platform 2.0 — server-side data access layer
// Used by API routes. Components consume data via the API, not this file.
import { db } from '@/lib/db'
import type { AgentDTO, InsightsDTO, LeadDTO, LeadNote, NeighborhoodDTO, PropertyDTO, PropertyStatus, PropertyType } from '@/lib/types'

type PropertyRow = Awaited<ReturnType<typeof db.property.findFirst>> & Record<string, unknown>

function parse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback
  try { return JSON.parse(json) as T } catch { return fallback }
}

export function toAgentDTO(a: {
  id: string; slug: string; name: string; title: string; photo: string
  phone: string; email: string; specialties: string; rating: number; bio: string
}): AgentDTO {
  return { ...a, specialties: parse<string[]>(a.specialties, []) }
}

export function toPropertyDTO(
  p: NonNullable<PropertyRow> & {
    neighborhood: { slug: string; name: string }
    agent: Parameters<typeof toAgentDTO>[0]
  },
): PropertyDTO {
  return {
    id: p.id, slug: p.slug, title: p.title, description: p.description,
    type: p.type as PropertyType, status: p.status as PropertyStatus,
    priceKes: p.priceKes, bedrooms: p.bedrooms, bathrooms: p.bathrooms, sqm: p.sqm,
    address: p.address, neighborhood: p.neighborhood.name, neighborhoodSlug: p.neighborhood.slug,
    lat: p.lat, lng: p.lng,
    amenities: parse<string[]>(p.amenities, []), images: parse<string[]>(p.images, []),
    yearBuilt: p.yearBuilt, parking: p.parking, featured: p.featured,
    rating: p.rating, views: p.views, agent: toAgentDTO(p.agent),
    createdAt: p.createdAt.toISOString(),
  }
}

export async function getAllProperties(): Promise<PropertyDTO[]> {
  const rows = await db.property.findMany({
    include: { neighborhood: true, agent: true },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  })
  return rows.map(r => toPropertyDTO(r as never))
}

export async function getPropertyBySlug(slug: string): Promise<PropertyDTO | null> {
  const row = await db.property.findUnique({
    where: { slug },
    include: { neighborhood: true, agent: true },
  })
  return row ? toPropertyDTO(row as never) : null
}

export async function getNeighborhoods(): Promise<NeighborhoodDTO[]> {
  const rows = await db.neighborhood.findMany({ orderBy: { name: 'asc' } })
  return rows.map(n => ({
    id: n.id, slug: n.slug, name: n.name, description: n.description,
    lat: n.lat, lng: n.lng, polygon: parse<[number, number][]>(n.polygon, []),
    avgPricePerSqm: n.avgPricePerSqm, image: n.image, highlights: parse<string[]>(n.highlights, []),
  }))
}

export async function getInsights(): Promise<InsightsDTO> {
  const [nbs, stats] = await Promise.all([
    db.neighborhood.findMany({ orderBy: { name: 'asc' } }),
    db.marketStat.findMany({ orderBy: { month: 'asc' } }),
  ])
  return {
    neighborhoods: nbs.map(nb => {
      const series = stats
        .filter(s => s.neighborhoodId === nb.id)
        .map(s => ({
          month: s.month, medianPriceKes: s.medianPriceKes,
          pricePerSqm: s.pricePerSqm, volume: s.volume, yoyChangePct: s.yoyChangePct,
        }))
      return {
        slug: nb.slug, name: nb.name, avgPricePerSqm: nb.avgPricePerSqm,
        latestYoY: series.at(-1)?.yoyChangePct ?? 0,
        totalVolume12m: series.reduce((acc, s) => acc + s.volume, 0),
        series,
      }
    }),
  }
}

export async function getLeads(): Promise<LeadDTO[]> {
  const rows = await db.lead.findMany({
    include: { property: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(r => ({
    id: r.id, name: r.name, email: r.email, phone: r.phone, message: r.message,
    propertyId: r.propertyId, propertyTitle: r.property?.title ?? null,
    status: r.status as LeadDTO['status'], source: r.source as LeadDTO['source'],
    budgetKes: r.budgetKes, score: r.score, assignedTo: r.assignedTo,
    notes: parse<LeadNote[]>(r.notes, []),
    createdAt: r.createdAt.toISOString(),
  }))
}
