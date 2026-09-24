// Delima Realtors Platform 2.0 — API tests for GET /api/properties (issue #66, Task 8-a)
import { describe, it, expect } from 'vitest'
import * as propertiesRoute from '@/app/api/properties/route'
import type { PropertyDTO } from '@/lib/types'

const req = (url: string) => new Request(url)

describe('GET /api/properties', () => {
  it('returns 200 with a non-empty array of property DTOs', async () => {
    const res = await propertiesRoute.GET(req('http://localhost/api/properties'))
    expect(res.status).toBe(200)

    const body = (await res.json()) as PropertyDTO[]
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)

    const first = body[0]
    // PropertyDTO shape (src/lib/types.ts)
    expect(typeof first.id).toBe('string')
    expect(typeof first.slug).toBe('string')
    expect(typeof first.title).toBe('string')
    expect(typeof first.priceKes).toBe('number')
    expect(typeof first.neighborhoodSlug).toBe('string')
    expect(Array.isArray(first.amenities)).toBe(true)
    expect(first.agent).toBeTruthy()
    expect(typeof first.agent.name).toBe('string')
  })

  it('?slug=<real slug> returns 200 with that single property (object, not array)', async () => {
    const allRes = await propertiesRoute.GET(req('http://localhost/api/properties'))
    const all = (await allRes.json()) as PropertyDTO[]
    const realSlug = all[0].slug

    const res = await propertiesRoute.GET(req(`http://localhost/api/properties?slug=${encodeURIComponent(realSlug)}`))
    expect(res.status).toBe(200)

    const body = (await res.json()) as PropertyDTO | PropertyDTO[]
    // NOTE (Task 8-a): the route returns the single DTO object for ?slug= —
    // asserted against actual route behavior, not an array.
    expect(Array.isArray(body)).toBe(false)
    expect((body as PropertyDTO).slug).toBe(realSlug)
    expect((body as PropertyDTO).id).toBe(all[0].id)
  })

  it('?slug=<unknown> returns 404 with an error message', async () => {
    const res = await propertiesRoute.GET(req('http://localhost/api/properties?slug=does-not-exist-xyz'))
    expect(res.status).toBe(404)

    const body = (await res.json()) as { error?: string }
    expect(typeof body.error).toBe('string')
  })
})
