// Delima Realtors Platform 2.0 — Delima AI assistant endpoint (issue #55)
// POST /api/assistant { messages: AssistantMsg[] } → { reply, properties, filters? }
// z-ai-web-dev-sdk is imported HERE ONLY (server side, never on the client).
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import ZAI from 'z-ai-web-dev-sdk'
import { getAllProperties } from '@/lib/data'
import { enforceRateLimit, rateLimitedResponse } from '@/lib/rate-limit'
import {
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  type FilterState,
  type PropertyDTO,
  type PropertyStatus,
  type PropertyType,
} from '@/lib/types'

export const dynamic = 'force-dynamic'

const HUMAN_PHONE = '+254 727 523 752'

/** Server-side default FilterState (store.ts is client-only, so we keep a local copy). */
const BASE_FILTERS: FilterState = {
  q: '',
  type: 'ALL',
  status: 'ALL',
  minPrice: null,
  maxPrice: null,
  beds: 0,
  neighborhood: 'ALL',
  featuredOnly: false,
  sort: 'featured',
}

/* ---------------------------------------------------------------- */
/* validation                                                        */
/* ---------------------------------------------------------------- */

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
})
const bodySchema = z.object({ messages: z.array(messageSchema).min(1).max(24) })

/* ---------------------------------------------------------------- */
/* shared filtering (mirror of the client engine, server-safe)       */
/* ---------------------------------------------------------------- */

function localFilterProperties(properties: PropertyDTO[], f: FilterState): PropertyDTO[] {
  const q = f.q.trim().toLowerCase()
  return properties.filter((p) => {
    if (f.type !== 'ALL' && p.type !== f.type) return false
    if (f.status !== 'ALL' && p.status !== f.status) return false
    if (f.neighborhood !== 'ALL' && p.neighborhoodSlug !== f.neighborhood) return false
    if (f.beds > 0 && p.bedrooms < f.beds) return false
    if (f.minPrice != null && p.priceKes < f.minPrice) return false
    if (f.maxPrice != null && p.priceKes > f.maxPrice) return false
    if (f.featuredOnly && !p.featured) return false
    if (q) {
      const hay = `${p.title} ${p.description} ${p.neighborhood} ${p.address} ${p.type} ${p.amenities.join(' ')}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

/* ---------------------------------------------------------------- */
/* FILTERS:{...} extraction + sanitising                             */
/* ---------------------------------------------------------------- */

function extractFilters(text: string, properties: PropertyDTO[]): Partial<FilterState> | null {
  const flat = text.replace(/```(?:json)?/gi, '')
  const matches = [...flat.matchAll(/FILTERS:\s*(\{[\s\S]*?\})/gi)]
  if (!matches.length) return null
  try {
    const obj = JSON.parse(matches[matches.length - 1][1]) as Record<string, unknown>
    const out: Partial<FilterState> = {}

    if (typeof obj.type === 'string' && (PROPERTY_TYPES as string[]).includes(obj.type)) {
      out.type = obj.type as PropertyType
    }
    if (typeof obj.status === 'string' && (PROPERTY_STATUSES as string[]).includes(obj.status)) {
      out.status = obj.status as PropertyStatus
    }
    if (typeof obj.maxPrice === 'number' && Number.isFinite(obj.maxPrice) && obj.maxPrice > 0) {
      out.maxPrice = Math.round(obj.maxPrice)
    }
    if (typeof obj.minPrice === 'number' && Number.isFinite(obj.minPrice) && obj.minPrice > 0) {
      out.minPrice = Math.round(obj.minPrice)
    }
    if (typeof obj.beds === 'number' && Number.isFinite(obj.beds) && obj.beds >= 0) {
      out.beds = Math.min(9, Math.round(obj.beds))
    }
    if (typeof obj.neighborhood === 'string' && obj.neighborhood.trim()) {
      const slugSet = new Set(properties.map((p) => p.neighborhoodSlug))
      const nameToSlug = new Map(properties.map((p) => [p.neighborhood.toLowerCase(), p.neighborhoodSlug] as const))
      const raw = obj.neighborhood.trim().toLowerCase()
      if (raw !== 'all') {
        if (slugSet.has(raw)) out.neighborhood = raw
        else if (nameToSlug.has(raw)) out.neighborhood = nameToSlug.get(raw)!
      }
    }
    return Object.keys(out).length ? out : null
  } catch {
    return null
  }
}

function cleanReply(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/FILTERS\s*:/.test(line))
    .join('\n')
    .replace(/```(?:json)?/gi, '')
    .trim()
}

/* ---------------------------------------------------------------- */
/* keyword fallback matching                                         */
/* ---------------------------------------------------------------- */

const NB_WORDS = ['karen', 'muthaiga', 'runda', 'westlands', 'kilimani', 'kileleshwa', 'loresho', 'kitisuru', 'langata']
const TYPE_WORDS: Array<[string, PropertyType]> = [
  ['villa', 'VILLA'],
  ['apartment', 'APARTMENT'],
  ['penthouse', 'PENTHOUSE'],
  ['townhouse', 'TOWNHOUSE'],
  ['office', 'OFFICE'],
  ['land', 'LAND'],
  ['commercial', 'COMMERCIAL'],
]

function keywordMatches(properties: PropertyDTO[], lastUser: string): PropertyDTO[] {
  const q = lastUser.toLowerCase()
  if (!q.trim()) return properties.filter((p) => p.featured).slice(0, 3)
  const nbHits = NB_WORDS.filter((w) => q.includes(w))
  const typeHits = TYPE_WORDS.filter(([w]) => q.includes(w)).map(([, t]) => t)
  const wantsRent = q.includes('rent') || q.includes('lease')
  const wantsBuy = q.includes('buy') || q.includes('sale') || q.includes('purchase')

  const scored = properties
    .map((p) => {
      let score = 0
      if (nbHits.some((w) => p.neighborhood.toLowerCase().includes(w))) score += 2
      if (typeHits.includes(p.type)) score += 2
      if (wantsRent && p.status === 'FOR_RENT') score += 1
      if (wantsBuy && p.status !== 'FOR_RENT') score += 1
      if (p.featured) score += 0.5
      return { p, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored.map((x) => x.p)
}

/* ---------------------------------------------------------------- */
/* handler                                                           */
/* ---------------------------------------------------------------- */

type CompletionShape = { choices?: Array<{ message?: { content?: string } }> }

export async function POST(req: NextRequest) {
  // Issue #64: rate limit FIRST — 15 requests per 5 min per IP. All existing
  // behavior (validation, fallbacks, response shapes) preserved below.
  const rl = enforceRateLimit(req, 'assistant', 15, 5 * 60_000)
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter)
  try {
    const parsed = bodySchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    const history = parsed.data.messages
    const properties = await getAllProperties()

    const inventory = properties.map((p) => ({
      slug: p.slug,
      title: p.title,
      type: p.type,
      status: p.status,
      priceKes: p.priceKes,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      sqm: p.sqm,
      neighborhood: p.neighborhood,
      featured: p.featured,
    }))

    const system = [
      `You are Delima AI, the concierge for Delima Realtors, a Nairobi luxury agency (phone ${HUMAN_PHONE}).`,
      'You help buyers and renters find homes and answer market questions.',
      'Neighborhoods: Karen, Muthaiga, Runda, Westlands, Kilimani, Kileleshwa, Loresho, Kitisuru, Langata.',
      `Here is the current listing inventory as JSON: ${JSON.stringify(inventory)}`,
      "Reply warmly, concisely (<=120 words), in the user's language, use KES formatting, and recommend specific listings by slug.",
      'If the user\'s ask maps to search filters, include a JSON line at the end exactly of the form: FILTERS:{"type":"VILLA","status":"FOR_SALE","maxPrice":100000000,"minPrice":null,"beds":4,"neighborhood":"karen"}',
      'Include only the keys that matter for the request (type, status, maxPrice, minPrice, beds, neighborhood). If no filters apply, use FILTERS:{}',
    ].join(' ')

    const chatMessages = [
      { role: 'system' as const, content: system },
      ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
    ]

    let reply = ''
    let filters: Partial<FilterState> | null = null
    let modelFailed = false

    try {
      const zai = await ZAI.create()
      const raw: unknown = await zai.chat.completions.create({ messages: chatMessages })
      const content = (raw as CompletionShape)?.choices?.[0]?.message?.content ?? ''
      filters = extractFilters(content, properties)
      reply = cleanReply(content)
    } catch (modelErr) {
      console.error('[api/assistant] model failure:', modelErr)
      modelFailed = true
    }

    // NEVER crash on bad model output — graceful fallback reply + 3 featured homes
    if (!reply) {
      modelFailed = true
      reply = `I'm sorry — I couldn't quite process that just now. Please try rephrasing, or call our human concierge on ${HUMAN_PHONE} and we'll gladly help. In the meantime, here are three featured residences from our portfolio.`
    }

    let matched: PropertyDTO[]
    if (modelFailed) {
      matched = properties.filter((p) => p.featured).slice(0, 3)
    } else if (filters) {
      matched = localFilterProperties(properties, { ...BASE_FILTERS, ...filters }).slice(0, 4)
    } else {
      matched = keywordMatches(properties, history.at(-1)?.content ?? '').slice(0, 4)
    }

    return NextResponse.json({ reply, properties: matched, ...(filters ? { filters } : {}) })
  } catch (e) {
    console.error('[api/assistant]', e)
    return NextResponse.json({ error: `Assistant service unavailable — call ${HUMAN_PHONE}` }, { status: 502 })
  }
}
