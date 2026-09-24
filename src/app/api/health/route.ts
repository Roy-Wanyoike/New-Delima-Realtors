// Delima Realtors 3.0 — health/observability endpoint (issue #48)
// Contract (locked by tests/api/health.test.ts):
//   200 { status:'ok', service, database:'connected', timestamp }
//   503 { status:'degraded', database:'unavailable', timestamp }
// Extra observability fields added in #48: version, uptimeSeconds, dbLatencyMs.
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const PROCESS_START = Date.now()

export async function GET() {
  const startedAt = Date.now()
  try {
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({
      status: 'ok',
      service: 'delima-realtors-platform',
      version: '3.0.0',
      database: 'connected',
      dbLatencyMs: Date.now() - startedAt,
      uptimeSeconds: Math.round((Date.now() - PROCESS_START) / 1000),
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { status: 'degraded', database: 'unavailable', timestamp: new Date().toISOString() },
      { status: 503 },
    )
  }
}
