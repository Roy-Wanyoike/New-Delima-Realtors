// Delima Realtors Platform 2.0 — API tests for POST /api/subscribe (issue #66, Task 8-a)
//
// Contract #3: POST {email} → 201 {ok:true,already:false} | 200 {ok:true,already:true} | 400 {error}.
// The route is being landed by a sibling agent (8-c) in parallel — until
// src/app/api/subscribe/route.ts exists the suite self-skips with an explicit TODO
// (it auto-activates the moment the file lands; nothing is fabricated).
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { db } from '@/lib/db'

const ROUTE_PATH = fileURLToPath(new URL('../../src/app/api/subscribe/route.ts', import.meta.url))
const ROUTE_LANDED = existsSync(ROUTE_PATH)

type SubscribeRoute = { POST: (req: Request) => Promise<Response> }
let route: SubscribeRoute | null = null

const QA_EMAIL = 'test-subscribe-qa@example.com'

function post(body: unknown): Promise<Response> {
  return route!.POST(
    new Request('http://localhost/api/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }) as Parameters<SubscribeRoute['POST']>[0],
  )
}

beforeAll(async () => {
  if (!ROUTE_LANDED) {
    console.warn('[subscribe.test] TODO: src/app/api/subscribe/route.ts not present yet (sibling 8-c) — suite skipped')
    return
  }
  route = (await import(pathToFileURL(ROUTE_PATH).href)) as SubscribeRoute
})

afterAll(async () => {
  if (!route) return
  await db.subscriber.deleteMany({ where: { email: QA_EMAIL } })
})

describe.skipIf(!ROUTE_LANDED)('POST /api/subscribe (contract #3)', () => {
  it('201 {ok:true, already:false} for a first-time email', async () => {
    const res = await post({ email: QA_EMAIL })
    expect(res.status).toBe(201)

    const body = (await res.json()) as { ok?: boolean; already?: boolean }
    expect(body.ok).toBe(true)
    expect(body.already).toBe(false)
  })

  it('200 {ok:true, already:true} when the email already exists', async () => {
    const res = await post({ email: QA_EMAIL })
    expect(res.status).toBe(200)

    const body = (await res.json()) as { ok?: boolean; already?: boolean }
    expect(body.ok).toBe(true)
    expect(body.already).toBe(true)
  })

  it('400 for an invalid email', async () => {
    const res = await post({ email: 'notanemail' })
    expect(res.status).toBe(400)

    const body = (await res.json()) as { error?: string }
    expect(typeof body.error).toBe('string')
  })
})
