import { NextResponse } from 'next/server'
import { getInsights, getNeighborhoods } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [insights, neighborhoods] = await Promise.all([getInsights(), getNeighborhoods()])
    return NextResponse.json({ insights, neighborhoods })
  } catch (e) {
    console.error('[api/stats]', e)
    return NextResponse.json({ error: 'Failed to load market data' }, { status: 500 })
  }
}
