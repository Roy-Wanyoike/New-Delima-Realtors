// Delima Realtors Platform 2.0 — printable property brochure (Task 1B)
//
// GET /api/properties/[slug]/brochure        → self-contained HTML brochure (preview)
// GET /api/properties/[slug]/brochure?print=1 → same HTML + auto window.print() on load
//
// The browser's native print dialog handles PDF generation: open this URL,
// Ctrl+P → "Save as PDF". The `?print=1` variant skips the preview step for
// users who clicked a direct "Download brochure" button.
//
// Rate limited at 20 req/min/IP via the shared in-memory limiter so a rogue
// client can't hammer the DB-backed lookup.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { toPropertyDTO } from '@/lib/data'
import { buildBrochureHtml } from '@/lib/brochure'
import { enforceRateLimit, rateLimitedResponse } from '@/lib/rate-limit'
import type { PropertyDTO, AgentDTO } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
): Promise<Response> {
  // Rate limit before any DB work (20 brochures / min / IP).
  const rl = enforceRateLimit(req, 'brochure', 20, 60_000)
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter)

  const { slug } = await ctx.params
  if (!slug) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  try {
    const row = await db.property.findUnique({
      where: { slug },
      include: { neighborhood: true, agent: true },
    })
    if (!row) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Reuse the canonical Prisma→DTO mapper (parses amenities/images JSON,
    // maps neighborhood → {slug,name}, maps agent → AgentDTO).
    const dto: PropertyDTO = toPropertyDTO(row as never)
    const agent: AgentDTO | null = dto.agent ?? null

    let html = buildBrochureHtml(dto, agent)

    // Inject the auto-print script ONLY when ?print=1 is present, so plain
    // previews (e.g. opening the URL in a new tab) don't surprise the user
    // with a print dialog. Inserted before </body> so it executes in document
    // order and the layout has already painted.
    const autoPrint = new URL(req.url).searchParams.get('print') === '1'
    if (autoPrint) {
      const printScript = `<script>window.addEventListener('load',function(){try{window.print();}catch(e){}});</script>`
      html = html.replace('</body>', `${printScript}</body>`)
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${slug}-brochure.html"`,
      },
    })
  } catch (e) {
    console.error('[api/properties/[slug]/brochure]', e)
    return NextResponse.json(
      { error: 'Failed to build brochure' },
      { status: 500 },
    )
  }
}
