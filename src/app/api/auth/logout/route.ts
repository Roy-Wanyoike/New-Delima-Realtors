// Delima Realtors 3.0 — buyer logout (issue #59)
// POST /api/auth/logout → 200 { ok: true } + cleared cookie (idempotent)
import { NextResponse } from 'next/server'
import { clearedSessionCookie, destroySession } from '@/lib/buyer-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  await destroySession(request)
  return NextResponse.json({ ok: true }, { headers: { 'Set-Cookie': clearedSessionCookie() } })
}
