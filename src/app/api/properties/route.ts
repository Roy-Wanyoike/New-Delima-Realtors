import { NextResponse } from 'next/server'
import { getAllProperties, getPropertyBySlug } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    if (slug) {
      const property = await getPropertyBySlug(slug)
      if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      return NextResponse.json(property)
    }
    const properties = await getAllProperties()
    return NextResponse.json(properties)
  } catch (e) {
    console.error('[api/properties]', e)
    return NextResponse.json({ error: 'Failed to load properties' }, { status: 500 })
  }
}
