// Delima Realtors Platform 2.0 — AI valuation endpoint (issue #56)
// POST /api/valuation → deterministic comps + LLM narrative + CRM lead.
// z-ai-web-dev-sdk is imported HERE ONLY (server side, never on the client).
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { getAllProperties } from '@/lib/data'
import { enforceRateLimit, rateLimitedResponse } from '@/lib/rate-limit'
import type { PropertyDTO } from '@/lib/types'
import { formatKes, formatSqm, typeLabel } from '@/lib/format'

export const dynamic = 'force-dynamic'

const CURRENT_YEAR = 2026

/* ---------------------------------------------------------------- */
/* validation                                                        */
/* ---------------------------------------------------------------- */

const bodySchema = z.object({
  type: z.enum(['APARTMENT', 'VILLA', 'TOWNHOUSE', 'PENTHOUSE', 'OFFICE', 'LAND', 'COMMERCIAL']),
  bedrooms: z.number().int().min(0).max(12),
  bathrooms: z.number().min(0).max(12),
  sqm: z.number().min(15).max(5000),
  yearBuilt: z.number().int().min(1900).max(CURRENT_YEAR),
  neighborhood: z.string().min(2).max(60),
  condition: z.enum(['Exceptional', 'Well kept', 'Needs updating']),
  parking: z.number().int().min(0).max(15),
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(7).max(30),
  notes: z.string().max(2000).optional(),
})

type ValuationBody = z.infer<typeof bodySchema>

/* ---------------------------------------------------------------- */
/* valuation math                                                    */
/* ---------------------------------------------------------------- */

const CONDITION_MULTIPLIER: Record<ValuationBody['condition'], number> = {
  Exceptional: 1.12,
  'Well kept': 1.0,
  'Needs updating': 0.88,
}

const round100k = (v: number) => Math.round(v / 100_000) * 100_000

interface Comp { p: PropertyDTO; sameNb: boolean }

function pickComps(properties: PropertyDTO[], slug: string, sqm: number): { comps: Comp[]; sameNbCount: number; usedNeighborhood: boolean } {
  const pool = properties.filter((p) => p.status !== 'FOR_RENT') // never mix monthly rent into a sale valuation
  const sameNb = pool.filter((p) => p.neighborhoodSlug === slug)
  const chosen: PropertyDTO[] = (sameNb.length >= 3 ? sameNb : pool)
    .slice()
    .sort((a, b) => Math.abs(a.sqm - sqm) - Math.abs(b.sqm - sqm))
    .slice(0, 4)
  const sameNbCount = chosen.filter((p) => p.neighborhoodSlug === slug).length
  return {
    comps: chosen.map((p) => ({ p, sameNb: p.neighborhoodSlug === slug })),
    sameNbCount,
    usedNeighborhood: sameNb.length >= 3,
  }
}

function templateNarrative(
  nbName: string, type: ValuationBody['type'], sqm: number, condition: ValuationBody['condition'],
  yearBuilt: number, comps: Comp[], low: number, mid: number, high: number, sameNb: boolean,
): string {
  const condText =
    condition === 'Exceptional' ? 'premium, move-in-ready condition'
    : condition === 'Well kept' ? 'well-kept condition'
    : 'a renovation-upside profile'
  const count = comps.length
  const p1 = `Drawing on ${count} comparable ${typeLabel[type].toLowerCase()}${count === 1 ? '' : 's'} ${sameNb ? `within ${nbName}` : 'across adjacent Nairobi neighborhoods'}, we estimate a market value of ${formatKes(mid)} for your ${formatSqm(sqm)} ${typeLabel[type].toLowerCase()} in ${nbName}.`
  const p2 = `Built in ${yearBuilt} and presented in ${condText}, the indicative range spans ${formatKes(low)} to ${formatKes(high)}. Pricing reflects current absorption, finishing levels and plot characteristics; a physical inspection will refine the final figure, and our team can walk you through the comparables line by line.`
  return `${p1}\n${p2}`
}

type CompletionShape = { choices?: Array<{ message?: { content?: string } }> }

/* ---------------------------------------------------------------- */
/* handler                                                           */
/* ---------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  // Issue #64: rate limit FIRST — 10 requests per 5 min per IP. All existing
  // behavior (validation, comps math, fallbacks, response shapes) preserved below.
  const rl = enforceRateLimit(req, 'valuation', 10, 5 * 60_000)
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter)
  try {
    const parsed = bodySchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid valuation details — please review the form.' }, { status: 400 })
    }
    const b = parsed.data

    const properties = await getAllProperties()
    if (!properties.length) {
      return NextResponse.json({ error: 'No inventory available to benchmark against.' }, { status: 503 })
    }

    // resolve neighborhood slug or name
    const bySlug = properties.find((p) => p.neighborhoodSlug === b.neighborhood)
    const byName = properties.find((p) => p.neighborhood.toLowerCase() === b.neighborhood.toLowerCase())
    const slug = bySlug?.neighborhoodSlug ?? byName?.neighborhoodSlug ?? ''
    const nbName = bySlug?.neighborhood ?? byName?.neighborhood ?? b.neighborhood

    /* 1) deterministic comps + estimate */
    const { comps, sameNbCount, usedNeighborhood } = pickComps(properties, slug, b.sqm)
    if (!comps.length) {
      return NextResponse.json({ error: 'No comparable properties found to value against.' }, { status: 422 })
    }

    const avgPerSqm = comps.reduce((acc, c) => acc + c.p.priceKes / c.p.sqm, 0) / comps.length
    const conditionMult = CONDITION_MULTIPLIER[b.condition]
    const ageDep = Math.max(0.8, 1 - (CURRENT_YEAR - b.yearBuilt) * 0.004)
    const midKes = round100k(avgPerSqm * conditionMult * ageDep * b.sqm)
    const lowKes = round100k(midKes * 0.93)
    const highKes = round100k(midKes * 1.07)

    const compAvgSqm = comps.reduce((acc, c) => acc + c.p.sqm, 0) / comps.length
    const withinSize = Math.abs(b.sqm - compAvgSqm) <= compAvgSqm * 0.25
    const confidence = Math.min(96, 72 + (sameNbCount >= 3 ? 10 : 0) + (withinSize ? 8 : 0))

    /* 2) CRM lead (never blocks the response) */
    try {
      await db.lead.create({
        data: {
          name: b.name,
          email: b.email,
          phone: b.phone,
          message: [
            `AI valuation — ${typeLabel[b.type]}, ${b.bedrooms} bed, ${formatSqm(b.sqm)}, ${nbName}`,
            `Condition: ${b.condition} · Parking: ${b.parking} · Built: ${b.yearBuilt}`,
            b.notes ? `Notes: ${b.notes}` : '',
          ].filter(Boolean).join(' | '),
          status: 'NEW',
          source: 'VALUATION',
          budgetKes: midKes,
          score: 70,
          notes: JSON.stringify([{ at: new Date().toISOString(), author: 'System', text: 'AI valuation requested' }]),
        },
      })
    } catch (leadErr) {
      console.error('[api/valuation] lead create failed:', leadErr)
    }

    /* 3) LLM narrative (optional enrichment; deterministic template on failure) */
    let narrative = ''
    try {
      const zai = await ZAI.create()
      const compsSummary = comps
        .map((c) => `${c.p.title} (${c.p.neighborhood}, ${c.p.sqm} sqm, ${formatKes(c.p.priceKes, { compact: true })})`)
        .join('; ')
      const raw: unknown = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are a senior Nairobi property valuer writing for a luxury brokerage client. Write a professional valuation narrative of at most 130 words in 2 short paragraphs. No headings, no lists, no placeholders. Use KES formatting. Reference the neighborhood, condition, comparables and the estimate range naturally.',
          },
          {
            role: 'user',
            content: `Property: ${typeLabel[b.type]}, ${b.bedrooms} bed / ${b.bathrooms} bath, ${b.sqm} sqm, built ${b.yearBuilt}, parking ${b.parking}. Neighborhood: ${nbName}. Condition: ${b.condition}. Estimate: low ${formatKes(lowKes)}, mid ${formatKes(midKes)}, high ${formatKes(highKes)}. Comparables used: ${compsSummary}.`,
          },
        ],
      })
      const text = (raw as CompletionShape)?.choices?.[0]?.message?.content?.trim() ?? ''
      if (text) narrative = text.slice(0, 1200)
    } catch (modelErr) {
      console.error('[api/valuation] narrative model failure:', modelErr)
    }
    if (!narrative) {
      narrative = templateNarrative(nbName, b.type, b.sqm, b.condition, b.yearBuilt, comps, lowKes, midKes, highKes, usedNeighborhood)
    }

    /* 4) respond */
    return NextResponse.json({
      lowKes,
      midKes,
      highKes,
      confidence,
      narrative,
      comps: comps.map((c) => {
        const sizePct = Math.round(((c.p.sqm - b.sqm) / b.sqm) * 100)
        return {
          title: c.p.title,
          neighborhood: c.p.neighborhood,
          priceKes: c.p.priceKes,
          sqm: c.p.sqm,
          similarityNote: `${Math.abs(sizePct)}% ${sizePct >= 0 ? 'larger' : 'smaller'} than yours · ${c.sameNb ? 'same neighborhood' : 'adjacent area'} · ${typeLabel[c.p.type]}`,
        }
      }),
    })
  } catch (e) {
    console.error('[api/valuation]', e)
    return NextResponse.json({ error: 'Valuation service unavailable — please try again shortly.' }, { status: 502 })
  }
}
