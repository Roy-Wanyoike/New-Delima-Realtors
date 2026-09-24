// Delima Realtors 3.0 — "Agent CRM" dashboard (Task REV-5)
// Passcode-gated lead pipeline: stat blocks, searchable leads table with
// per-row stage updates, lead detail dialog (notes/assignment), analytics.
// All data logic preserved from 2.0: server-verified passcode gate
// (sessionStorage `delima.admin.key`), GET/PATCH /api/leads with x-admin-key,
// optimistic mutations with rollback + toasts, session-expiry re-gate.
'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowUpRight,
  Building2,
  Loader2,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Target,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useProperties } from '@/hooks/use-delima-data'
import { useAppStore } from '@/lib/store'
import { formatDate, formatKes, leadSourceLabel, leadStatusLabel, whatsappLink } from '@/lib/format'
import { LEAD_STATUSES, type LeadDTO, type LeadStatus, type PropertyDTO } from '@/lib/types'
import { cn, fetchWithTimeout } from '@/lib/utils'
import { Container, EmptyState, Reveal, StatBlock } from './ui-kit'

/* ----------------------------- constants ---------------------------- */

const ADMIN_KEY_STORAGE = 'delima.admin.key'

const CRM_AGENTS = [
  'Amara Otieno',
  'David Mwangi',
  'Zawadi Njoroge',
  'Xavier Kariuki',
  'Neema Wanjiru',
  'Brian Kimani',
] as const

const LEAD_SOURCES = ['CONTACT_FORM', 'VALUATION', 'AI_ASSISTANT', 'VIEWING_REQUEST', 'NEWSLETTER'] as const

/** Frozen chart tokens (chart-1..5) for the sources donut. */
const PIE_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

/** Status badge colours: NEW=sun, CONTACTED=brand-soft, VIEWING=amber, OFFER=brand, CLOSED=emerald, LOST=stone. */
const STATUS_BADGE: Record<LeadStatus, string> = {
  NEW: 'border-transparent bg-sun text-brand-deep',
  CONTACTED: 'border-transparent bg-brand-soft text-brand',
  VIEWING: 'border-transparent bg-amber-100 text-amber-800',
  OFFER: 'border-transparent bg-brand text-white',
  CLOSED: 'border-transparent bg-emerald-100 text-emerald-800',
  LOST: 'border-transparent bg-stone-200 text-stone-600',
}

function statusBadgeClass(status: LeadStatus): string {
  return STATUS_BADGE[status]
}

function scoreBarClass(score: number): string {
  if (score >= 80) return '[&>div]:bg-sun'
  if (score >= 60) return '[&>div]:bg-brand-mid'
  return '[&>div]:bg-stone-400'
}

type PatchBody = { status?: LeadStatus; assignedTo?: string | null; note?: string }

/* ----------------------------- helpers ------------------------------ */

function readAdminKey(): string | null {
  if (typeof window === 'undefined') return null
  return window.sessionStorage.getItem(ADMIN_KEY_STORAGE)
}

function saveAdminKey(key: string): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(ADMIN_KEY_STORAGE, key)
}

function clearAdminKey(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(ADMIN_KEY_STORAGE)
}

/**
 * Single fetch helper for every CRM call — merges the `x-admin-key` header
 * from sessionStorage, read fresh on each call so the session stays honest.
 */
function adminFetch(input: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  headers.set('x-admin-key', readAdminKey() ?? '')
  return fetchWithTimeout(input, { ...init, headers })
}

function isLeadStatus(v: string): v is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(v)
}

function daysLabel(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

interface TooltipItem {
  name?: string | number
  value?: number | string
}

/** Brand-styled chart tooltip — evergreen panel, amber label. */
function BrandTip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean
  payload?: TooltipItem[]
  label?: string | number
  formatValue?: (v: number) => string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-xl border border-brand-mid/60 bg-brand px-3 py-2 text-white shadow-lg">
      {label !== undefined && (
        <p className="mb-1 text-[11px] font-bold tracking-wide text-sun">{String(label)}</p>
      )}
      <p className="text-xs font-semibold">
        {formatValue ? formatValue(Number(payload[0].value ?? 0)) : String(payload[0].value ?? '')}
      </p>
    </div>
  )
}

function leadsWord(n: number): string {
  return `${n} ${n === 1 ? 'lead' : 'leads'}`
}

/* --------------------------- passcode gate -------------------------- */

interface GateNotice {
  tone: 'info' | 'error'
  text: string
}

function PasscodeGate({
  onUnlock,
  notice,
}: {
  onUnlock: (key: string) => void
  notice?: GateNotice | null
}) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<'none' | 'incorrect' | 'unavailable'>('none')
  const [verifying, setVerifying] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const key = value.trim()
    if (!key || verifying) return
    setVerifying(true)
    setError('none')
    try {
      // Server-verified unlock — the passcode is never compared client-side.
      const res = await fetchWithTimeout('/api/leads', { headers: { 'x-admin-key': key } })
      if (res.ok) {
        onUnlock(key)
        return
      }
      if (res.status === 401) {
        clearAdminKey()
        setError('incorrect')
      } else {
        setError('unavailable')
      }
    } catch {
      setError('unavailable')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <Container className="flex min-h-[70vh] items-center py-10">
      <Reveal className="w-full">
        <div className="card-modern mx-auto max-w-md rounded-3xl p-8 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <Lock className="size-6" aria-hidden="true" />
          </span>
          <div className="mt-5">
            <p className="eyebrow mb-2">Agent CRM</p>
            <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-ink">
              The Delima pipeline desk
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This board carries client information. Enter the office passcode to continue.
            </p>
          </div>
          {notice && (
            <p
              role="status"
              className={cn(
                'mt-4 text-sm font-semibold',
                notice.tone === 'error' ? 'text-destructive' : 'text-sun-deep',
              )}
            >
              {notice.text}
            </p>
          )}
          <form onSubmit={e => void submit(e)} className="mt-5 space-y-3">
            <Input
              type="password"
              value={value}
              onChange={e => {
                setValue(e.target.value)
                setError('none')
              }}
              placeholder="Passcode"
              aria-label="CRM passcode"
              aria-invalid={error !== 'none'}
              autoComplete="off"
              className="h-11 rounded-xl text-center tracking-[0.3em]"
            />
            {error === 'incorrect' && (
              <p className="text-sm font-semibold text-destructive" role="alert">
                Incorrect passcode — try again.
              </p>
            )}
            {error === 'unavailable' && (
              <p className="text-sm font-semibold text-destructive" role="alert">
                Could not reach the CRM — check your connection and try again.
              </p>
            )}
            <Button
              type="submit"
              disabled={verifying}
              aria-busy={verifying}
              className="btn-sun h-11 min-h-11 w-full gap-2 rounded-xl font-bold"
            >
              {verifying && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {verifying ? 'Verifying…' : 'Unlock CRM'}
            </Button>
          </form>
          <p className="mt-5 text-xs text-muted-foreground">Demo passcode: delima2026</p>
        </div>
      </Reveal>
    </Container>
  )
}

/* --------------------------- lead detail ---------------------------- */

interface LeadDialogProps {
  lead: LeadDTO
  properties: PropertyDTO[]
  onClose: () => void
  onMove: (id: string, status: LeadStatus) => void
  onAssign: (id: string, agent: string | null) => void
  onAddNote: (id: string, text: string) => void
}

function LeadDialog({ lead, properties, onClose, onMove, onAssign, onAddNote }: LeadDialogProps) {
  const openProperty = useAppStore(s => s.openProperty)
  const [note, setNote] = useState('')

  const linkedProperty = useMemo(
    () => (lead.propertyId ? properties.find(p => p.id === lead.propertyId) ?? null : null),
    [lead.propertyId, properties],
  )

  const submitNote = () => {
    const text = note.trim()
    if (!text) return
    onAddNote(lead.id, text)
    setNote('')
  }

  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusBadgeClass(lead.status)}>{leadStatusLabel[lead.status]}</Badge>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-bold tabular-nums text-ink">
              Score {lead.score}
            </span>
            <span className="text-xs text-muted-foreground">
              {daysLabel(lead.createdAt)} · via {leadSourceLabel[lead.source]}
            </span>
          </div>
          <DialogTitle className="text-2xl font-extrabold tracking-tight text-ink">{lead.name}</DialogTitle>
          <DialogDescription>
            {lead.budgetKes != null ? `Budget ${formatKes(lead.budgetKes)}` : 'Budget not stated'} ·
            created {formatDate(lead.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="delima-scroll -mx-1 max-h-[60vh] space-y-6 overflow-y-auto px-1">
          {/* contact */}
          <section aria-label="Contact details" className="space-y-2">
            <p className="eyebrow">Contact</p>
            <a
              href={`mailto:${lead.email}`}
              className="flex min-h-11 items-center gap-2.5 rounded-xl border border-line bg-white px-3 text-sm transition-colors hover:border-brand-mid hover:bg-brand-soft/60"
              aria-label={`Email ${lead.name} at ${lead.email}`}
            >
              <Mail className="size-4 shrink-0 text-brand" aria-hidden="true" />
              <span className="truncate">{lead.email}</span>
            </a>
            <a
              href={`tel:${lead.phone}`}
              className="flex min-h-11 items-center gap-2.5 rounded-xl border border-line bg-white px-3 text-sm transition-colors hover:border-brand-mid hover:bg-brand-soft/60"
              aria-label={`Call ${lead.name} on ${lead.phone}`}
            >
              <Phone className="size-4 shrink-0 text-brand" aria-hidden="true" />
              <span className="truncate">{lead.phone}</span>
            </a>
            <a
              href={whatsappLink(
                lead.phone,
                `Hello ${lead.name}, this is ${lead.assignedTo ?? 'the Delima desk'} from Delima Realtors, following up on your enquiry.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-2.5 rounded-xl border border-line bg-white px-3 text-sm transition-colors hover:border-brand-mid hover:bg-brand-soft/60"
              aria-label={`WhatsApp ${lead.name}`}
            >
              <MessageCircle className="size-4 shrink-0 text-[#1faa53]" aria-hidden="true" />
              <span className="truncate">WhatsApp {lead.name.split(' ')[0]}</span>
            </a>
            {lead.message && (
              <p className="rounded-xl bg-muted/60 p-3 text-sm italic leading-relaxed text-muted-foreground">
                “{lead.message}”
              </p>
            )}
          </section>

          {/* linked property */}
          {lead.propertyTitle && (
            <section aria-label="Linked property">
              <p className="eyebrow mb-2">Linked property</p>
              <Button
                variant="outline"
                className="h-11 w-full justify-between gap-2 rounded-xl font-semibold"
                disabled={!linkedProperty}
                onClick={() => {
                  if (linkedProperty) {
                    onClose()
                    openProperty(linkedProperty.slug)
                  }
                }}
                aria-label={`Open listing ${lead.propertyTitle}`}
              >
                <span className="truncate">{lead.propertyTitle}</span>
                <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
              </Button>
            </section>
          )}

          {/* status + assignment */}
          <section aria-label="Pipeline and assignment" className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lead-status" className="text-sm font-semibold text-ink">
                Stage
              </Label>
              <Select
                value={lead.status}
                onValueChange={v => {
                  if (isLeadStatus(v)) onMove(lead.id, v)
                }}
              >
                <SelectTrigger id="lead-status" className="h-11 w-full rounded-xl" aria-label="Change lead stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>
                      {leadStatusLabel[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-assign" className="text-sm font-semibold text-ink">
                Assigned to
              </Label>
              <Select
                value={lead.assignedTo ?? 'UNASSIGNED'}
                onValueChange={v => onAssign(lead.id, v === 'UNASSIGNED' ? null : v)}
              >
                <SelectTrigger
                  id="lead-assign"
                  className="h-11 w-full rounded-xl"
                  aria-label="Assign lead to an agent"
                >
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                  {CRM_AGENTS.map(name => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* notes timeline */}
          <section aria-label="Notes timeline">
            <p className="eyebrow mb-3">Notes</p>
            {lead.notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet — start the trail below.</p>
            ) : (
              <ol className="relative space-y-4 border-l border-line pl-5">
                {lead.notes.map((n, i) => (
                  <li key={i} className="relative">
                    <span
                      className="absolute -left-[25.5px] top-1 size-2.5 rounded-full bg-sun ring-2 ring-white"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-bold text-sun-deep">
                      {n.author} · {formatDate(n.at)}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink/90">{n.text}</p>
                  </li>
                ))}
              </ol>
            )}
            <div className="mt-4 space-y-2">
              <Textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Log a call, a viewing, a gut feel…"
                aria-label="New note"
                rows={3}
                className="resize-none rounded-xl"
              />
              <Button
                className="h-11 min-h-11 w-full rounded-xl font-bold sm:w-auto sm:px-6"
                disabled={!note.trim()}
                onClick={submitNote}
              >
                Add note
              </Button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------- CRM dashboard ------------------------- */

function CrmDashboard({ onSessionExpired }: { onSessionExpired: () => void }) {
  const { toast } = useToast()
  const { properties } = useProperties()

  const [leads, setLeads] = useState<LeadDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<'ALL' | LeadStatus>('ALL')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminFetch('/api/leads')
      if (res.status === 401) {
        onSessionExpired()
        return
      }
      if (!res.ok) throw new Error(`Failed to load leads (${res.status})`)
      const data = (await res.json()) as LeadDTO[]
      setLeads(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [onSessionExpired])

  useEffect(() => {
    void load()
  }, [load])

  const patchLead = useCallback(
    async (id: string, body: PatchBody): Promise<LeadDTO> => {
      const res = await adminFetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...body }),
      })
      if (res.status === 401) {
        onSessionExpired()
        throw new Error('Session expired — enter the passcode to continue')
      }
      if (!res.ok) {
        const data: { error?: string } | null = await res.json().catch(() => null)
        throw new Error(data?.error ?? `Update failed (${res.status})`)
      }
      return (await res.json()) as LeadDTO
    },
    [onSessionExpired],
  )

  /** Optimistic mutation with rollback + toast. */
  const mutateLead = useCallback(
    async (
      id: string,
      patch: PatchBody,
      optimistic: (l: LeadDTO) => LeadDTO,
      successTitle: string,
    ) => {
      const snapshot = leads
      const target = snapshot.find(l => l.id === id)
      if (!target) return
      setLeads(cur => cur.map(l => (l.id === id ? optimistic(l) : l)))
      try {
        const updated = await patchLead(id, patch)
        setLeads(cur => cur.map(l => (l.id === id ? updated : l)))
        toast({ title: successTitle, description: `${target.name} saved.` })
      } catch (e) {
        setLeads(snapshot)
        toast({
          title: 'Update failed',
          description: e instanceof Error ? e.message : 'Please try again.',
          variant: 'destructive',
        })
      }
    },
    [leads, patchLead, toast],
  )

  const moveLead = useCallback(
    (leadId: string, status: LeadStatus) => {
      const lead = leads.find(l => l.id === leadId)
      if (!lead || lead.status === status) return
      void mutateLead(
        leadId,
        { status },
        l => ({
          ...l,
          status,
          notes: [...l.notes, { at: new Date().toISOString(), author: 'System', text: `Status → ${status}` }],
        }),
        `Moved to ${leadStatusLabel[status]}`,
      )
    },
    [leads, mutateLead],
  )

  const assignLead = useCallback(
    (leadId: string, agent: string | null) => {
      const lead = leads.find(l => l.id === leadId)
      if (!lead || lead.assignedTo === agent) return
      void mutateLead(
        leadId,
        { assignedTo: agent },
        l => ({ ...l, assignedTo: agent }),
        agent ? `Assigned to ${agent}` : 'Lead unassigned',
      )
    },
    [leads, mutateLead],
  )

  const addNote = useCallback(
    (leadId: string, text: string) => {
      void mutateLead(
        leadId,
        { note: text },
        l => ({ ...l, notes: [...l.notes, { at: new Date().toISOString(), author: 'Agent', text }] }),
        'Note added',
      )
    },
    [mutateLead],
  )

  /* ---------- derived data ---------- */

  const stats = useMemo(() => {
    const total = leads.length
    const newLeads = leads.filter(l => l.status === 'NEW').length
    const subscribers = leads.filter(l => l.source === 'NEWSLETTER').length
    const closed = leads.filter(l => l.status === 'CLOSED').length
    const lost = leads.filter(l => l.status === 'LOST').length
    const conversion = total - lost > 0 ? (closed / (total - lost)) * 100 : 0
    return { total, newLeads, subscribers, conversion }
  }, [leads])

  const filteredLeads = useMemo(() => {
    const raw = search.trim().toLowerCase()
    const tokens = raw.split(/\s+/).filter(Boolean)
    return leads.filter(l => {
      if (stageFilter !== 'ALL' && l.status !== stageFilter) return false
      if (tokens.length === 0) return true
      const hay = `${l.name} ${l.email} ${l.phone} ${l.propertyTitle ?? ''} ${l.assignedTo ?? ''}`.toLowerCase()
      return tokens.every(t => hay.includes(t))
    })
  }, [leads, search, stageFilter])

  const pipelineData = useMemo(
    () => LEAD_STATUSES.map(s => ({ stage: leadStatusLabel[s], count: leads.filter(l => l.status === s).length })),
    [leads],
  )

  const sourceData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const l of leads) counts.set(l.source, (counts.get(l.source) ?? 0) + 1)
    return LEAD_SOURCES.map((s, i) => ({
      name: leadSourceLabel[s],
      count: counts.get(s) ?? 0,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    })).filter(d => d.count > 0)
  }, [leads])

  const selectedLead = selectedId ? leads.find(l => l.id === selectedId) ?? null : null

  /* ---------- render ---------- */

  return (
    <Container className="py-10 md:py-14">
      {/* header */}
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">Agent CRM</p>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            Every lead, one desk
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Search, stage and assign every enquiry from one desk. Tap a lead for the full history,
            notes and assignment.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-11 min-h-11 gap-2 rounded-xl border-line hover:border-brand-mid hover:bg-brand-soft"
          onClick={() => void load()}
          aria-label="Refresh leads"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Refresh
        </Button>
      </Reveal>

      {/* error */}
      {error && !loading && (
        <div className="card-modern mb-6 border-destructive/40 p-6 hover:transform-none">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-bold text-ink">Could not load the pipeline</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              className="h-11 min-h-11 gap-2 rounded-xl font-bold"
              onClick={() => void load()}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* stat blocks */}
      {loading ? (
        <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4" aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-line bg-white p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-8 w-24" />
              <Skeleton className="mt-3 h-3 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <div>
            <StatBlock
              icon={Users}
              label="New leads"
              value={String(stats.newLeads)}
              className="h-full rounded-3xl"
            />
            <p className="mt-1.5 px-1 text-xs text-muted-foreground">awaiting first contact</p>
          </div>
          <div>
            <StatBlock
              icon={Building2}
              label="Total listings"
              value={String(properties.length)}
              className="h-full rounded-3xl"
            />
            <p className="mt-1.5 px-1 text-xs text-muted-foreground">live on the site</p>
          </div>
          <div>
            <StatBlock
              icon={Mail}
              label="Subscribers"
              value={String(stats.subscribers)}
              className="h-full rounded-3xl"
            />
            <p className="mt-1.5 px-1 text-xs text-muted-foreground">newsletter-sourced leads</p>
          </div>
          <div>
            <StatBlock
              icon={Target}
              label="Conversion rate"
              value={`${stats.conversion.toFixed(0)}%`}
              className="h-full rounded-3xl"
            />
            <p className="mt-1.5 px-1 text-xs text-muted-foreground">closed ÷ (total − lost)</p>
          </div>
        </div>
      )}

      {/* search + stage filter */}
      {!loading && !error && (
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, property or agent…"
              aria-label="Search leads"
              className="h-11 rounded-xl border-line bg-white pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={stageFilter}
              onValueChange={v => setStageFilter(v === 'ALL' ? 'ALL' : isLeadStatus(v) ? v : 'ALL')}
            >
              <SelectTrigger
                className="h-11 w-full rounded-xl sm:w-44"
                aria-label="Filter leads by stage"
              >
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All stages</SelectItem>
                {LEAD_STATUSES.map(s => (
                  <SelectItem key={s} value={s}>
                    {leadStatusLabel[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="hidden shrink-0 text-sm text-muted-foreground sm:block" role="status">
              {leadsWord(filteredLeads.length)}
            </p>
          </div>
        </div>
      )}

      {/* leads table */}
      {loading ? (
        <div className="overflow-hidden rounded-3xl border border-line bg-white p-4" aria-busy="true" aria-label="Loading leads">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-line px-2 py-4 last:border-b-0">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="hidden h-4 w-16 sm:block" />
              <Skeleton className="hidden h-4 w-14 md:block" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-11 w-32 rounded-xl" />
            </div>
          ))}
        </div>
      ) : leads.length === 0 && !error ? (
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="New enquiries from the contact form, valuations and the AI assistant will land here in real time."
          className="rounded-3xl"
        />
      ) : filteredLeads.length === 0 && !error ? (
        <EmptyState
          icon={Search}
          title="No leads match your filters"
          description="Try a different search term, or clear the stage filter to see the full pipeline."
          className="rounded-3xl"
          action={
            <Button
              variant="outline"
              className="h-11 min-h-11 rounded-xl border-line font-semibold hover:border-brand-mid hover:bg-brand-soft"
              onClick={() => {
                setSearch('')
                setStageFilter('ALL')
              }}
            >
              Clear search &amp; filters
            </Button>
          }
        />
      ) : (
        !error && (
          <div className="overflow-hidden rounded-3xl border border-line bg-white soft-shadow">
            <div className="delima-scroll max-h-[560px] overflow-auto [&_[data-slot=table-container]]:overflow-visible">
              <Table className="min-w-[960px]">
                <TableHeader className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_var(--line)]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 py-3 font-bold">Lead</TableHead>
                    <TableHead className="px-3 py-3 font-bold">Source</TableHead>
                    <TableHead className="px-3 py-3 text-right font-bold">Budget</TableHead>
                    <TableHead className="px-3 py-3 font-bold">Score</TableHead>
                    <TableHead className="px-3 py-3 font-bold">Status</TableHead>
                    <TableHead className="px-3 py-3 font-bold">Assigned</TableHead>
                    <TableHead className="px-3 py-3 font-bold">Received</TableHead>
                    <TableHead className="px-4 py-3 text-right font-bold">Move to</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map(lead => (
                    <TableRow key={lead.id}>
                      <TableCell className="max-w-[16rem] px-4 py-3">
                        <button
                          type="button"
                          className="block max-w-full truncate rounded text-left text-sm font-bold text-ink hover:text-brand hover:underline"
                          onClick={() => setSelectedId(lead.id)}
                          aria-label={`Open details for ${lead.name}`}
                        >
                          {lead.name}
                        </button>
                        <p className="truncate text-xs text-muted-foreground">{lead.email}</p>
                      </TableCell>
                      <TableCell className="px-3 py-3">
                        <Badge
                          variant="outline"
                          className="border-line bg-muted/60 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          {leadSourceLabel[lead.source]}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-3 text-right font-mono text-sm font-semibold tabular-nums text-ink">
                        {lead.budgetKes != null ? formatKes(lead.budgetKes, { compact: true }) : '—'}
                      </TableCell>
                      <TableCell className="px-3 py-3">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-mono text-sm font-bold tabular-nums text-ink">{lead.score}</span>
                          <Progress
                            value={lead.score}
                            aria-label={`Lead score ${lead.score} out of 100`}
                            className={cn('h-1.5 w-14 bg-muted', scoreBarClass(lead.score))}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-3">
                        <Badge className={statusBadgeClass(lead.status)}>{leadStatusLabel[lead.status]}</Badge>
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-muted-foreground">
                        {lead.assignedTo ?? 'Unassigned'}
                      </TableCell>
                      <TableCell className="px-3 py-3">
                        <p className="whitespace-nowrap text-sm font-medium text-ink">{formatDate(lead.createdAt)}</p>
                        <p className="text-xs text-muted-foreground">{daysLabel(lead.createdAt)}</p>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <Select
                          value={lead.status}
                          onValueChange={v => {
                            if (isLeadStatus(v)) moveLead(lead.id, v)
                          }}
                        >
                          <SelectTrigger
                            className="ml-auto h-11 w-36 rounded-xl text-sm font-semibold"
                            aria-label={`Change stage for ${lead.name}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LEAD_STATUSES.map(s => (
                              <SelectItem key={s} value={s}>
                                {leadStatusLabel[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      )}

      {/* analytics */}
      {!loading && !error && leads.length > 0 && (
        <Reveal className="mt-8">
          <div className="card-modern p-6 hover:transform-none">
            <h3 className="text-lg font-bold text-ink">Pipeline analytics</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">Where the book stands today.</p>

            <Tabs defaultValue="pipeline" className="mt-4">
              <TabsList className="mb-5 grid h-auto w-full max-w-sm grid-cols-2 gap-1 rounded-full p-1.5">
                <TabsTrigger value="pipeline" className="min-h-11 rounded-full py-2 font-semibold">
                  Pipeline
                </TabsTrigger>
                <TabsTrigger value="sources" className="min-h-11 rounded-full py-2 font-semibold">
                  Sources
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pipeline" className="focus-visible:outline-none">
                <div className="h-64 w-full md:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                      <XAxis
                        dataKey="stage"
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                        stroke="var(--line)"
                        tickMargin={6}
                      />
                      <YAxis
                        allowDecimals={false}
                        width={32}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                        stroke="var(--line)"
                      />
                      <RechartsTooltip
                        cursor={{ fill: 'var(--sun-soft)', opacity: 0.6 }}
                        content={<BrandTip formatValue={v => leadsWord(Math.round(v))} />}
                      />
                      <Bar dataKey="count" name="Leads" fill="var(--chart-2)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="sources" className="focus-visible:outline-none">
                {sourceData.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">No source data yet.</p>
                ) : (
                  <div className="h-64 w-full md:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourceData}
                          dataKey="count"
                          nameKey="name"
                          innerRadius={58}
                          outerRadius={88}
                          paddingAngle={3}
                          stroke="#ffffff"
                          strokeWidth={2}
                        >
                          {sourceData.map(entry => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<BrandTip formatValue={v => leadsWord(Math.round(v))} />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </Reveal>
      )}

      {/* detail dialog */}
      {selectedLead && (
        <LeadDialog
          lead={selectedLead}
          properties={properties}
          onClose={() => setSelectedId(null)}
          onMove={moveLead}
          onAssign={assignLead}
          onAddNote={addNote}
        />
      )}
    </Container>
  )
}

/* ------------------------------ export ------------------------------ */

export default function AdminView() {
  const [adminKey, setAdminKey] = useState<string | null>(() => readAdminKey())
  const [notice, setNotice] = useState<GateNotice | null>(null)

  const handleUnlock = useCallback((key: string) => {
    saveAdminKey(key)
    setAdminKey(key)
    setNotice(null)
  }, [])

  /** Any mid-session 401 (e.g. the office passcode changed) returns to the gate. */
  const handleSessionExpired = useCallback(() => {
    clearAdminKey()
    setAdminKey(null)
    setNotice({ tone: 'info', text: 'Session ended — enter the office passcode to continue.' })
  }, [])

  return adminKey != null ? (
    <CrmDashboard onSessionExpired={handleSessionExpired} />
  ) : (
    <PasscodeGate onUnlock={handleUnlock} notice={notice} />
  )
}
