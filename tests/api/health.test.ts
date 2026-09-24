// Delima Realtors Platform 2.0 — API tests for GET /api/health (issue #66, Task 8-a)
// Next 16 route handlers are plain functions → imported and invoked directly.
import { describe, it, expect } from 'vitest'
import * as healthRoute from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('returns 200 with status ok and database connected', async () => {
    const res = await healthRoute.GET()
    expect(res.status).toBe(200)

    const body = (await res.json()) as Record<string, unknown>
    expect(body.status).toBe('ok')
    expect(body.database).toBe('connected')
    expect(body.service).toBe('delima-realtors-platform')
    expect(typeof body.timestamp).toBe('string')
  })
})
