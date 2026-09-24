// Delima Realtors Platform 2.0 — API tests for POST /api/assistant (issue #66, Task 8-a)
//
// Only the fast validation path is covered: the 200 path depends on the external
// LLM (slow, non-deterministic) and is deliberately NOT tested here. Bad bodies
// are rejected before any model call, so these tests never touch the SDK runtime.
import { describe, it, expect } from 'vitest'
import * as assistantRoute from '@/app/api/assistant/route'

const reqOf = (r: Request): Parameters<typeof assistantRoute.POST>[0] =>
  r as Parameters<typeof assistantRoute.POST>[0]

function post(body: string, contentType = 'application/json'): Promise<Response> {
  return assistantRoute.POST(
    reqOf(new Request('http://localhost/api/assistant', {
      method: 'POST',
      headers: { 'content-type': contentType },
      body,
    })),
  )
}

describe('POST /api/assistant — validation (no LLM path)', () => {
  it('400 for an empty messages array', async () => {
    const res = await post(JSON.stringify({ messages: [] }))
    expect(res.status).toBe(400)

    const body = (await res.json()) as { error?: string }
    expect(typeof body.error).toBe('string')
  })

  it('400 for a malformed JSON body', async () => {
    const res = await post('not-json-at-all')
    expect(res.status).toBe(400)

    const body = (await res.json()) as { error?: string }
    expect(typeof body.error).toBe('string')
  })

  it('400 for a message with an invalid role', async () => {
    const res = await post(JSON.stringify({ messages: [{ role: 'system', content: 'hello' }] }))
    expect(res.status).toBe(400)

    const body = (await res.json()) as { error?: string }
    expect(typeof body.error).toBe('string')
  })
})
