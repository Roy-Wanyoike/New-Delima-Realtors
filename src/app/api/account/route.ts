// Delima Realtors 3.0 — buyer account dashboard payload (issue #59)
// GET /api/account → 200 { buyer, savedProperties: PropertyDTO[], savedSearches: SavedSearchDTO[] }
//                  → 401 { error } when not signed in
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionBuyer, BUYER_CLIENT_DTO_FIELDS } from '@/lib/buyer-auth'
import { getSavedProperties } from '@/lib/data'
import type { FilterState } from '@/lib/types'

export const dynamic = 'force-dynamic'

export interface SavedSearchDTO {
  id: string
  name: string
  filters: FilterState
  createdAt: string
}

function parseFilters(json: string): FilterState | null {
  try {
    const parsed = JSON.parse(json) as Partial<FilterState>
    if (typeof parsed !== 'object' || parsed === null || !('q' in parsed)) return null
    return parsed as FilterState
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const buyer = await getSessionBuyer(request)
  if (!buyer) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const [savedProperties, savedSearchRows] = await Promise.all([
    getSavedProperties(buyer.id),
    db.savedSearch.findMany({
      where: { buyerId: buyer.id },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const savedSearches: SavedSearchDTO[] = savedSearchRows
    .map(row => ({
      id: row.id,
      name: row.name,
      filters: parseFilters(row.queryJson) ?? null,
      createdAt: row.createdAt.toISOString(),
    }))
    .filter((s): s is SavedSearchDTO => s.filters !== null)

  return NextResponse.json({ buyer, savedProperties, savedSearches })
}
