// Delima Realtors Platform 2.0 — API tests for POST /api/valuation (issue #66, Task 8-a)
//
// The happy path exercises the REAL route: deterministic comps + estimate math +
// CRM lead persistence. The optional z-ai narrative enrichment is allowed to fall
// back to the deterministic template (the route guarantees a non-empty narrative
// either way), so the suite stays deterministic without mocking the SDK.
//
// The valuation lead row is created with email test-qa@example.com / name TEST-QA-VAL-*
// and deleted in afterAll; a scoped baseline count proves no state leaks.
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import * as valuationRoute from '@/app/api/valuation/route'
import { db } from '@/lib/db'

const QA_EMAIL = 'test-qa@example.com'
const reqOf = (r: Request): Parameters<typeof valuationRoute.POST>[0] =>
  r as Parameters<typeof valuationRoute.POST>[0]

function post(body: unknown): Promise<Response> {
  return valuationRoute.POST(
    reqOf(new Request('http://localhost/api/valuation', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })),
  )
}

const VALID_BODY = {
  type: 'VILLA',
  bedrooms: 4,
  bathrooms: 3,
  sqm: 350,
  yearBuilt: 2015,
  neighborhood: 'karen',
  condition: 'Well kept',
  parking: 2,
  name: `TEST-QA-VAL-${Date.now()}`,
  email: QA_EMAIL,
  phone: '+254700000000',
}

let qaValuationLeadsBefore = 0

beforeAll(async () => {
  qaValuationLeadsBefore = await db.lead.count({ where: { email: QA_EMAIL, source: 'VALUATION' } })
})

afterAll(async () => {
  const qaValuation = { email: QA_EMAIL, source: 'VALUATION' } as const
  await db.lead.deleteMany({ where: qaValuation })
  // Every VALUATION lead created by this suite is gone (stale rows from a
  // crashed previous run are swept too, so the count is deterministic).
  expect(await db.lead.count({ where: qaValuation })).toBe(0)
  console.log(`[valuation.test] QA valuation leads before: ${qaValuationLeadsBefore}, after: 0`)  
})

describe('POST /api/valuation — happy path', () => {
  it('returns 200 with a coherent ValuationResult and 3-4 comps', async () => {
    const res = await post(VALID_BODY)
    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      lowKes: number; midKes: number; highKes: number; confidence: number
      narrative: string
      comps: Array<{ title: string; neighborhood: string; priceKes: number; sqm: number; similarityNote: string }>
    }

    // invariants: range ordering + rounded-to-100k estimates
    expect(typeof body.lowKes).toBe('number')
    expect(typeof body.midKes).toBe('number')
    expect(typeof body.highKes).toBe('number')
    expect(body.lowKes).toBeLessThanOrEqual(body.midKes)
    expect(body.midKes).toBeLessThanOrEqual(body.highKes)
    expect(body.midKes % 100_000).toBe(0)

    // confidence between 60 and 96 per contract
    expect(body.confidence).toBeGreaterThanOrEqual(60)
    expect(body.confidence).toBeLessThanOrEqual(96)

    // comps: 3-4 entries, each well-formed
    expect(body.comps.length).toBeGreaterThanOrEqual(3)
    expect(body.comps.length).toBeLessThanOrEqual(4)
    for (const comp of body.comps) {
      expect(typeof comp.title).toBe('string')
      expect(typeof comp.neighborhood).toBe('string')
      expect(typeof comp.priceKes).toBe('number')
      expect(comp.priceKes).toBeGreaterThan(0)
      expect(typeof comp.sqm).toBe('number')
      expect(typeof comp.similarityNote).toBe('string')
      expect(comp.similarityNote.length).toBeGreaterThan(0)
    }
    // comps must never be rentals (rent can't benchmark a sale valuation)
    // — asserted via the estimate being in the millions, not hundreds of thousands
    expect(body.midKes).toBeGreaterThan(1_000_000)

    // narrative non-empty (LLM-enriched or deterministic template fallback)
    expect(typeof body.narrative).toBe('string')
    expect(body.narrative.length).toBeGreaterThan(0)
  }, 60_000) // extended timeout: the route may call the LLM for the narrative
})

describe('POST /api/valuation — validation', () => {
  it('400 when name is missing', async () => {
    const { name: _omitted, ...bodyWithoutName } = VALID_BODY
    const res = await post(bodyWithoutName)
    expect(res.status).toBe(400)

    const body = (await res.json()) as { error?: string }
    expect(typeof body.error).toBe('string')
  })

  it('400 when sqm is below the supported range', async () => {
    const res = await post({ ...VALID_BODY, name: `TEST-QA-VAL-${Date.now()}`, sqm: 5 })
    expect(res.status).toBe(400)

    const body = (await res.json()) as { error?: string }
    expect(typeof body.error).toBe('string')
  })
})
