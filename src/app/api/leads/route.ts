// Delima Realtors Platform 2.0 — CRM leads API (Task 5-d, hardened in #64)
// GET    /api/leads                → LeadDTO[]          (admin: x-admin-key)
// POST   /api/leads                → create lead → LeadDTO   (PUBLIC intake, rate limited)
// PATCH  /api/leads                → status/assignedTo/note → LeadDTO (admin: x-admin-key)
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getLeads } from '@/lib/data'
import { isAdmin } from '@/lib/admin-auth'
import { enforceRateLimit, rateLimitedResponse } from '@/lib/rate-limit'
import type { LeadNote, LeadSource, LeadStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

const SOURCES = ['CONTACT_FORM', 'VALUATION', 'AI_ASSISTANT', 'VIEWING_REQUEST', 'NEWSLETTER'] as const satisfies readonly LeadSource[]
const STATUSES = ['NEW', 'CONTACTED', 'VIEWING', 'OFFER', 'CLOSED', 'LOST'] as const satisfies readonly LeadStatus[]

const createSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(120),
  email: z.string().trim().email('Invalid email').max(200),
  phone: z.string().trim().min(7, 'Phone is too short').max(30),
  message: z.string().max(4000).optional(),
  propertyId: z.string().min(1).max(64).optional(),
  source: z.enum(SOURCES).optional(),
  budgetKes: z.number().int("Budget must be a whole number").positive().max(10_000_000_000).nullable().optional(),
})

const patchSchema = z
  .object({
    id: z.string().min(1, 'Lead id is required'),
    status: z.enum(STATUSES).optional(),
    assignedTo: z.string().max(120).nullable().optional(),
    note: z.string().trim().min(1, 'Note cannot be empty').max(2000).optional(),
  })
  .refine(d => d.status !== undefined || d.assignedTo !== undefined || d.note !== undefined, {
    message: 'Nothing to update — provide status, assignedTo or note',
  })

function parseNotes(json: string): LeadNote[] {
  try {
    const parsed: unknown = JSON.parse(json)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (n): n is LeadNote =>
        typeof n === 'object' && n !== null &&
        typeof (n as LeadNote).at === 'string' &&
        typeof (n as LeadNote).author === 'string' &&
        typeof (n as LeadNote).text === 'string',
    )
  } catch {
    return []
  }
}

function invalidRequest(issues: z.ZodIssue[]) {
  return NextResponse.json(
    { error: 'Invalid request', issues: issues.map(i => ({ path: i.path.join('.'), message: i.message })) },
    { status: 400 },
  )
}

export async function GET(req: Request) {
  // Issue #64: CRM data is admin-only. POST stays PUBLIC (buyer intake).
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    return NextResponse.json(await getLeads())
  } catch (e) {
    console.error('[api/leads GET]', e)
    return NextResponse.json({ error: 'Failed to load leads' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  // Issue #64: public intake endpoint — rate limit before any parsing.
  const rl = enforceRateLimit(req, 'leads', 10, 60_000)
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter)
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return invalidRequest(parsed.error.issues)
    const data = parsed.data

    if (data.propertyId) {
      const property = await db.property.findUnique({ where: { id: data.propertyId }, select: { id: true } })
      if (!property) return NextResponse.json({ error: 'Unknown propertyId' }, { status: 400 })
    }

    // Lead score: budget-driven baseline, +5 when the prospect left a message
    let score = data.budgetKes != null
      ? data.budgetKes >= 50_000_000 ? 80 : data.budgetKes >= 15_000_000 ? 65 : 50
      : 50
    if (data.message && data.message.trim().length > 0) score += 5
    score = Math.min(score, 100)

    const created = await db.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message ?? '',
        propertyId: data.propertyId ?? null,
        status: 'NEW',
        source: data.source ?? 'CONTACT_FORM',
        budgetKes: data.budgetKes ?? null,
        score,
      },
    })

    // Re-serialize through getLeads() so the response matches GET exactly
    const leads = await getLeads()
    const dto = leads.find(l => l.id === created.id)
    if (!dto) return NextResponse.json({ error: 'Lead created but could not be serialized' }, { status: 500 })
    return NextResponse.json(dto, { status: 201 })
  } catch (e) {
    console.error('[api/leads POST]', e)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  // Issue #64: CRM mutations are admin-only (checked before body parsing).
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return invalidRequest(parsed.error.issues)
    const { id, status, assignedTo, note } = parsed.data

    const existing = await db.lead.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const notes = parseNotes(existing.notes)
    if (note) {
      notes.push({ at: new Date().toISOString(), author: 'Agent', text: note })
    }
    if (status && status !== existing.status) {
      notes.push({ at: new Date().toISOString(), author: 'System', text: `Status → ${status}` })
    }

    await db.lead.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(assignedTo !== undefined ? { assignedTo } : {}),
        ...(notes.length !== parseNotes(existing.notes).length ? { notes: JSON.stringify(notes) } : {}),
      },
    })

    const leads = await getLeads()
    const dto = leads.find(l => l.id === id)
    if (!dto) return NextResponse.json({ error: 'Lead updated but could not be serialized' }, { status: 500 })
    return NextResponse.json(dto)
  } catch (e) {
    console.error('[api/leads PATCH]', e)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}
