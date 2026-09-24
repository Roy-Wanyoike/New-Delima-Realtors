// Delima Realtors Platform 2.0 — unit tests for the shared filter engine
// src/hooks/use-delima-data.ts → filterProperties (issue #66, Task 8-a)
//
// The module is marked 'use client' but filterProperties is a pure module-level
// function; importing the module in node only pulls react's useState/useEffect
// bindings, which load fine outside a renderer.
import { describe, it, expect } from 'vitest'
import { filterProperties } from '@/hooks/use-delima-data'
import type { FilterState, PropertyDTO } from '@/lib/types'

/** Minimal PropertyDTO factory — only fields the engine reads are varied. */
function property(over: Partial<PropertyDTO> & Pick<PropertyDTO, 'id'>): PropertyDTO {
  const { id, ...rest } = over
  return {
    id,
    slug: id,
    title: 'Untitled',
    description: '',
    type: 'APARTMENT',
    status: 'FOR_SALE',
    priceKes: 10_000_000,
    bedrooms: 0,
    bathrooms: 1,
    sqm: 100,
    address: 'Nairobi',
    neighborhood: 'Karen',
    neighborhoodSlug: 'karen',
    lat: -1.3,
    lng: 36.7,
    amenities: [],
    images: [],
    yearBuilt: 2020,
    parking: 1,
    featured: false,
    rating: 4.5,
    views: 0,
    agent: {
      id: 'agent-1', slug: 'agent-1', name: 'Test Agent', title: 'Agent', photo: '',
      phone: '+254700000000', email: 'agent@example.com', specialties: [], rating: 4.5, bio: '',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    ...rest,
  }
}

const FIXTURES: PropertyDTO[] = [
  property({
    id: 'p1',
    title: 'Serene Karen Villa',
    description: 'Private villa with pool in Karen',
    type: 'VILLA',
    status: 'FOR_SALE',
    priceKes: 85_000_000,
    bedrooms: 5,
    sqm: 450,
    neighborhood: 'Karen',
    neighborhoodSlug: 'karen',
    address: 'Bogani East Road',
    amenities: ['Pool', 'Garden'],
    featured: true,
    views: 120,
    createdAt: '2026-01-15T00:00:00.000Z',
  }),
  property({
    id: 'p2',
    title: 'Kilimani Sky Apartment',
    description: 'Modern apartment with skyline views',
    type: 'APARTMENT',
    status: 'FOR_SALE',
    priceKes: 18_500_000,
    bedrooms: 2,
    sqm: 140,
    neighborhood: 'Kilimani',
    neighborhoodSlug: 'kilimani',
    address: 'Wood Avenue',
    amenities: ['Gym', 'Backup power'],
    featured: true,
    views: 300,
    createdAt: '2026-02-01T00:00:00.000Z',
  }),
  property({
    id: 'p3',
    title: 'Westlands Office Suite',
    description: 'Grade A office space',
    type: 'OFFICE',
    status: 'FOR_RENT',
    priceKes: 350_000,
    bedrooms: 0,
    sqm: 200,
    neighborhood: 'Westlands',
    neighborhoodSlug: 'westlands',
    address: 'Rings Road',
    amenities: ['Parking'],
    featured: false,
    views: 50,
    createdAt: '2025-12-10T00:00:00.000Z',
  }),
  property({
    id: 'p4',
    title: 'Runda Family Townhouse',
    description: 'Spacious townhouse in a gated court',
    type: 'TOWNHOUSE',
    status: 'FOR_SALE',
    priceKes: 65_000_000,
    bedrooms: 4,
    sqm: 320,
    neighborhood: 'Runda',
    neighborhoodSlug: 'runda',
    address: 'Kigwaru Drive',
    amenities: ['Garden'],
    featured: false,
    views: 80,
    createdAt: '2026-01-30T00:00:00.000Z',
  }),
  property({
    id: 'p5',
    title: 'Muthaiga Classic Villa',
    description: 'Heritage villa on half an acre',
    type: 'VILLA',
    status: 'FOR_SALE',
    priceKes: 120_000_000,
    bedrooms: 6,
    sqm: 600,
    neighborhood: 'Muthaiga',
    neighborhoodSlug: 'muthaiga',
    address: 'Muthaiga Drive',
    amenities: ['Garden', 'Staff quarters'],
    featured: true,
    views: 200,
    createdAt: '2025-11-05T00:00:00.000Z',
  }),
]

const ids = (list: PropertyDTO[]) => list.map(p => p.id)

function filters(over: Partial<FilterState> = {}): FilterState {
  return {
    q: '',
    type: 'ALL',
    status: 'ALL',
    minPrice: null,
    maxPrice: null,
    beds: 0,
    neighborhood: 'ALL',
    featuredOnly: false,
    sort: 'featured',
    ...over,
  }
}

describe('filterProperties — empty filters', () => {
  it('returns every property when no filter is applied', () => {
    expect(filterProperties(FIXTURES, filters())).toHaveLength(5)
  })

  it('default sort puts featured first (by views desc), then the rest by views desc', () => {
    // featured: p2(300 views), p5(200), p1(120) → then non-featured: p4(80), p3(50)
    expect(ids(filterProperties(FIXTURES, filters()))).toEqual(['p2', 'p5', 'p1', 'p4', 'p3'])
  })

  it('does not mutate the input array order', () => {
    const input = [...FIXTURES]
    filterProperties(input, filters({ sort: 'price-asc' }))
    expect(input.map(p => p.id)).toEqual(['p1', 'p2', 'p3', 'p4', 'p5'])
  })
})

describe('filterProperties — free-text q (token AND matching)', () => {
  it('matches multi-token queries with AND semantics ("villa in karen")', () => {
    // "villa" + "in" + "karen" must ALL hit the haystack — only p1 satisfies all three
    expect(ids(filterProperties(FIXTURES, filters({ q: 'villa in karen' })))).toEqual(['p1'])
  })

  it('is case-insensitive', () => {
    expect(ids(filterProperties(FIXTURES, filters({ q: 'VILLA IN KAREN' })))).toEqual(['p1'])
    expect(ids(filterProperties(FIXTURES, filters({ q: 'APARTMENT' })))).toEqual(['p2']) // hits p.type
  })

  it('matches against title, description, neighborhood, address and amenities', () => {
    expect(ids(filterProperties(FIXTURES, filters({ q: 'gated court' })))).toEqual(['p4']) // description
    expect(ids(filterProperties(FIXTURES, filters({ q: 'rings road' })))).toEqual(['p3']) // address
    expect(ids(filterProperties(FIXTURES, filters({ q: 'pool' })))).toEqual(['p1']) // amenities
    expect(ids(filterProperties(FIXTURES, filters({ q: 'muthaiga' })))).toEqual(['p5']) // neighborhood
  })

  it('drops properties that miss any single token', () => {
    // p5 is a villa but not in Karen (and its haystack lacks "in")
    expect(ids(filterProperties(FIXTURES, filters({ q: 'villa karen' })))).toEqual(['p1'])
  })

  it('returns an empty array when no token matches', () => {
    expect(filterProperties(FIXTURES, filters({ q: 'beachfront' }))).toEqual([])
  })
})

describe('filterProperties — structured filters', () => {
  // NOTE: filter tests below assert MEMBERSHIP only (ids sorted), because the
  // engine always applies its default ordering (featured first, then views desc).
  // Ordering itself is covered by the dedicated sort tests.
  it('filters by type', () => {
    expect(ids(filterProperties(FIXTURES, filters({ type: 'VILLA' }))).sort()).toEqual(['p1', 'p5'])
  })

  it('filters by status', () => {
    expect(ids(filterProperties(FIXTURES, filters({ status: 'FOR_RENT' })))).toEqual(['p3'])
    expect(filterProperties(FIXTURES, filters({ status: 'FOR_SALE' }))).toHaveLength(4)
  })

  it('filters by neighborhood slug', () => {
    expect(ids(filterProperties(FIXTURES, filters({ neighborhood: 'karen' })))).toEqual(['p1'])
    expect(ids(filterProperties(FIXTURES, filters({ neighborhood: 'kilimani' })))).toEqual(['p2'])
  })

  it('filters by minimum bedrooms (beds is inclusive)', () => {
    expect(ids(filterProperties(FIXTURES, filters({ beds: 4 }))).sort()).toEqual(['p1', 'p4', 'p5'])
    expect(ids(filterProperties(FIXTURES, filters({ beds: 5 }))).sort()).toEqual(['p1', 'p5'])
  })

  it('applies minPrice as an inclusive lower bound', () => {
    expect(ids(filterProperties(FIXTURES, filters({ minPrice: 65_000_000 }))).sort()).toEqual(['p1', 'p4', 'p5'])
  })

  it('applies maxPrice as an inclusive upper bound', () => {
    expect(ids(filterProperties(FIXTURES, filters({ maxPrice: 65_000_000 }))).sort()).toEqual(['p2', 'p3', 'p4'])
  })

  it('applies a price band [minPrice, maxPrice]', () => {
    expect(ids(filterProperties(FIXTURES, filters({ minPrice: 18_000_000, maxPrice: 66_000_000 }))).sort()).toEqual(['p2', 'p4'])
  })

  it('price bounds compare raw priceKes regardless of FOR_RENT status (no rent/sale special-casing)', () => {
    // p3 is a 350,000/mo rental — a low maxPrice keeps only the rental in the mix.
    // Observation (not a bug): the engine does not encode rent-vs-sale price semantics;
    // callers mixing statuses get rent and sale prices compared on one axis.
    expect(ids(filterProperties(FIXTURES, filters({ maxPrice: 500_000 })))).toEqual(['p3'])
  })

  it('filters to featured-only when featuredOnly is set', () => {
    const out = filterProperties(FIXTURES, filters({ featuredOnly: true }))
    expect(ids(out)).toEqual(['p2', 'p5', 'p1']) // featured subset in default (views desc) order
  })

  it('combines multiple filters with AND semantics', () => {
    expect(ids(filterProperties(FIXTURES, filters({ type: 'VILLA', beds: 6 })))).toEqual(['p5'])
    expect(
      filterProperties(FIXTURES, filters({ type: 'VILLA', beds: 6, status: 'FOR_RENT' })),
    ).toEqual([])
  })
})

describe('filterProperties — sort modes', () => {
  it('sorts by price ascending', () => {
    expect(ids(filterProperties(FIXTURES, filters({ sort: 'price-asc' })))).toEqual(['p3', 'p2', 'p4', 'p1', 'p5'])
  })

  it('sorts by price descending', () => {
    expect(ids(filterProperties(FIXTURES, filters({ sort: 'price-desc' })))).toEqual(['p5', 'p1', 'p4', 'p2', 'p3'])
  })

  it('sorts by newest (createdAt desc)', () => {
    expect(ids(filterProperties(FIXTURES, filters({ sort: 'newest' })))).toEqual(['p2', 'p4', 'p1', 'p3', 'p5'])
  })

  it('sorts by largest (sqm desc)', () => {
    expect(ids(filterProperties(FIXTURES, filters({ sort: 'size' })))).toEqual(['p5', 'p1', 'p4', 'p3', 'p2'])
  })

  it('sorts after filtering', () => {
    const out = filterProperties(FIXTURES, filters({ type: 'VILLA', sort: 'price-asc' }))
    expect(ids(out)).toEqual(['p1', 'p5'])
  })
})
