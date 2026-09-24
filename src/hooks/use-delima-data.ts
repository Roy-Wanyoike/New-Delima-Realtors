// Delima Realtors Platform 2.0 — shared client data hooks (module-cached)
'use client'

import { useEffect, useState } from 'react'
import type { InsightsDTO, NeighborhoodDTO, PropertyDTO } from '@/lib/types'
import { fetchWithTimeout } from '@/lib/utils'

interface PropertiesState {
  properties: PropertyDTO[]
  loading: boolean
  error: string | null
}

let propertiesCache: PropertyDTO[] | null = null
let propertiesInflight: Promise<PropertyDTO[]> | null = null

async function fetchProperties(): Promise<PropertyDTO[]> {
  if (propertiesCache) return propertiesCache
  if (!propertiesInflight) {
    propertiesInflight = fetchWithTimeout('/api/properties')
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load listings (${r.status})`)
        return r.json() as Promise<PropertyDTO[]>
      })
      .then(data => {
        propertiesCache = data
        return data
      })
      .finally(() => {
        propertiesInflight = null
      })
  }
  return propertiesInflight
}

export function useProperties(): PropertiesState {
  const [state, setState] = useState<PropertiesState>({
    properties: propertiesCache ?? [],
    loading: !propertiesCache,
    error: null,
  })

  useEffect(() => {
    let alive = true
    if (propertiesCache) return // state already initialized from module cache
    fetchProperties()
      .then(properties => alive && setState({ properties, loading: false, error: null }))
      .catch(e => alive && setState({ properties: [], loading: false, error: e.message }))
    return () => {
      alive = false
    }
  }, [])

  return state
}

interface StatsState {
  insights: InsightsDTO | null
  neighborhoods: NeighborhoodDTO[]
  loading: boolean
  error: string | null
}

let statsCache: { insights: InsightsDTO; neighborhoods: NeighborhoodDTO[] } | null = null
let statsInflight: Promise<{ insights: InsightsDTO; neighborhoods: NeighborhoodDTO[] }> | null = null

export function useInsights(): StatsState {
  const [state, setState] = useState<StatsState>({
    insights: statsCache?.insights ?? null,
    neighborhoods: statsCache?.neighborhoods ?? [],
    loading: !statsCache,
    error: null,
  })

  useEffect(() => {
    let alive = true
    if (statsCache) return // state already initialized from module cache
    if (!statsInflight) {
      statsInflight = fetchWithTimeout('/api/stats')
        .then(r => {
          if (!r.ok) throw new Error(`Failed to load market data (${r.status})`)
          return r.json() as Promise<{ insights: InsightsDTO; neighborhoods: NeighborhoodDTO[] }>
        })
        .then(data => {
          statsCache = data
          return data
        })
        .finally(() => {
          statsInflight = null
        })
    }
    statsInflight
      .then(data => alive && setState({ ...data, loading: false, error: null }))
      .catch(e => alive && setState({ insights: null, neighborhoods: [], loading: false, error: e.message }))
    return () => {
      alive = false
    }
  }, [])

  return state
}

/** Apply FilterState to a property list (shared by properties + map views). */
export function filterProperties(
  properties: PropertyDTO[],
  filters: import('@/lib/types').FilterState,
): PropertyDTO[] {
  const raw = filters.q.trim().toLowerCase()
  // Token-based AND matching: "villa in karen" → every token must hit the haystack
  const tokens = raw.split(/\s+/).filter(Boolean)
  const out = properties.filter(p => {
    if (filters.type !== 'ALL' && p.type !== filters.type) return false
    if (filters.status !== 'ALL' && p.status !== filters.status) return false
    if (filters.neighborhood !== 'ALL' && p.neighborhoodSlug !== filters.neighborhood) return false
    if (filters.beds > 0 && p.bedrooms < filters.beds) return false
    if (filters.minPrice != null && p.priceKes < filters.minPrice) return false
    if (filters.maxPrice != null && p.priceKes > filters.maxPrice) return false
    if (filters.featuredOnly && !p.featured) return false
    if (tokens.length) {
      const hay = `${p.title} ${p.description} ${p.neighborhood} ${p.address} ${p.type} ${p.amenities.join(' ')}`.toLowerCase()
      if (!tokens.every(t => hay.includes(t))) return false
    }
    return true
  })
  const sorted = [...out]
  switch (filters.sort) {
    case 'price-asc': sorted.sort((a, b) => a.priceKes - b.priceKes); break
    case 'price-desc': sorted.sort((a, b) => b.priceKes - a.priceKes); break
    case 'newest': sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break
    case 'size': sorted.sort((a, b) => b.sqm - a.sqm); break
    default: sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || b.views - a.views)
  }
  return sorted
}
