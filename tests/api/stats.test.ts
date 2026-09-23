// Delima Realtors Platform 2.0 — API tests for GET /api/stats (issue #66, Task 8-a)
import { describe, it, expect } from 'vitest'
import * as statsRoute from '@/app/api/stats/route'
import type { InsightsDTO, NeighborhoodDTO } from '@/lib/types'

describe('GET /api/stats', () => {
  it('returns 200 with insights + neighborhoods in the market-data shape', async () => {
    const res = await statsRoute.GET()
    expect(res.status).toBe(200)

    const body = (await res.json()) as { insights: InsightsDTO; neighborhoods: NeighborhoodDTO[] }

    // insights
    expect(body.insights).toBeTruthy()
    expect(Array.isArray(body.insights.neighborhoods)).toBe(true)
    expect(body.insights.neighborhoods.length).toBeGreaterThan(0)

    for (const row of body.insights.neighborhoods) {
      expect(typeof row.slug).toBe('string')
      expect(typeof row.name).toBe('string')
      expect(typeof row.avgPricePerSqm).toBe('number')
      expect(row.avgPricePerSqm).toBeGreaterThan(0)
      expect(typeof row.latestYoY).toBe('number')
      expect(typeof row.totalVolume12m).toBe('number')
      expect(Array.isArray(row.series)).toBe(true)
      expect(row.series.length).toBeGreaterThan(0)
      for (const point of row.series) {
        expect(point.month).toMatch(/^\d{4}-\d{2}$/)
        expect(typeof point.medianPriceKes).toBe('number')
        expect(typeof point.pricePerSqm).toBe('number')
        expect(typeof point.volume).toBe('number')
        expect(typeof point.yoyChangePct).toBe('number')
      }
    }

    // neighborhoods
    expect(Array.isArray(body.neighborhoods)).toBe(true)
    expect(body.neighborhoods.length).toBe(body.insights.neighborhoods.length)
    for (const nb of body.neighborhoods) {
      expect(typeof nb.slug).toBe('string')
      expect(typeof nb.name).toBe('string')
      expect(Array.isArray(nb.polygon)).toBe(true)
      expect(Array.isArray(nb.highlights)).toBe(true)
    }
  })
})
