// Delima Realtors Platform 2.0 — "Agent CRM" (Task 5-d)
// Passcode-gated lead pipeline: Kanban board (drag or menu), lead detail sheet,
// optimistic mutations with rollback, pipeline/source analytics.
'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
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
  Gauge,
  Loader2,
  Lock,
  Mail,
  MessageCircle,
  MoreVertical,
  Phone,
  RefreshCw,
  Target,
  UserPlus,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useProperties } from '@/hooks/use-delima-data'
import { useAppStore } from '@/lib/store'
import { formatDate, formatKes, leadSourceLabel, leadStatusLabel, whatsappLink } from '@/lib/format'
import { LEAD_STATUSES, type LeadDTO, type LeadStatus, type PropertyDTO } from '@/lib/types'
import { cn, fetchWithTimeout } from '@/lib/utils'

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

const PIE_COLORS = ['var(--gold)', 'var(--gold-deep)', 'var(--espresso-soft)', 'var(--sand)', '#8a7a5c']

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

function scoreChipClass(score: number): string {
  if (score >= 80) return 'border-gold/50 bg-gold/15 text-gold-deep dark:text-gold'
  if (score >= 60) return 'border-border bg-sand text-espresso dark:text-gold-soft'
  return 'border-border bg-muted text-muted-foreground'
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

/** Espresso/cream chart tooltip, brand-styled for Delima. */
function EspressoTip({
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
    <div className="rounded-md border border-gold/40 bg-espresso px-3 py-2 text-cream shadow-lg dark:border-gold/30 dark:text-foreground">
      {label !== undefined && (
        <p className="mb-1 text-[11px] font-semibold tracking-wide text-gold-soft">{String(label)}</p>
      )}
      <p className="text-xs font-medium">
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
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        <Card className="luxury-shadow border-border/80">
          <CardContent className="space-y-5 p-8 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full gold-gradient-bg text-espresso">
              <Lock className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow mb-2">Agent CRM</p>
              <h2 className="font-display text-2xl leading-snug">The Delima pipeline desk</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                This board carries client information. Enter the office passcode to continue.
              </p>
            </div>
            {notice && (
              <p
                role="status"
                className={cn(
                  'text-sm font-medium',
                  notice.tone === 'error'
                    ? 'text-destructive'
                    : 'text-gold-deep dark:text-gold',
                )}
              >
                {notice.text}
              </p>
            )}
            <form onSubmit={e => void submit(e)} className="space-y-3">
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
                className="h-11 text-center tracking-[0.3em]"
              />
              {error === 'incorrect' && (
                <p className="text-sm font-medium text-destructive" role="alert">
                  Incorrect passcode — try again.
                </p>
              )}
              {error === 'unavailable' && (
                <p className="text-sm font-medium text-destructive" role="alert">
                  Could not reach the CRM — check your connection and try again.
                </p>
              )}
              <Button
                type="submit"
                disabled={verifying}
                aria-busy={verifying}
                className="h-11 min-h-11 w-full gap-2 gold-gradient-bg font-semibold text-espresso hover:opacity-90"
              >
                {verifying && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {verifying ? 'Verifying…' : 'Unlock CRM'}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">Demo passcode: delima2026</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

/* ----------------------------- lead cards --------------------------- */

interface LeadCardStaticProps {
  lead: LeadDTO
  onOpen?: (id: string) => void
  onMove?: (id: string, status: LeadStatus) => void
  overlay?: boolean
}

/** Pure presentational lead card — shared by the board and the drag overlay. */
function LeadCardStatic({ lead, onOpen, onMove, overlay }: LeadCardStaticProps) {
  return (
    <div className="cursor-grab rounded-md border border-border/80 bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing">
      <div className="flex items-start justify-between gap-2">
        {onOpen && !overlay ? (
          <button
            type="button"
            className="min-w-0 truncate text-left text-sm font-bold leading-snug hover:text-gold-deep hover:underline dark:hover:text-gold"
            onClick={e => {
              e.stopPropagation()
              onOpen(lead.id)
            }}
            aria-label={`Open details for ${lead.name}`}
          >
            {lead.name}
          </button>
        ) : (
          <p className="min-w-0 truncate text-sm font-bold leading-snug">{lead.name}</p>
        )}
        <div
          className="flex shrink-0 items-center gap-1"
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
        >
          <span
            className={cn(
              'inline-flex min-w-7 justify-center rounded-full border px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
              scoreChipClass(lead.score),
            )}
            title={`Lead score ${lead.score}`}
          >
            {lead.score}
          </span>
          {onMove && !overlay && <MoveMenu lead={lead} onMove={onMove} />}
        </div>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {lead.budgetKes != null && (
          <span className="text-xs font-bold text-gold-deep dark:text-gold">
            {formatKes(lead.budgetKes, { compact: true })}
          </span>
        )}
        <Badge
          variant="outline"
          className="border-border/70 px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
        >
          {leadSourceLabel[lead.source]}
        </Badge>
      </div>

      {lead.propertyTitle && (
        <p className="mt-1.5 truncate text-[11px] text-muted-foreground">{lead.propertyTitle}</p>
      )}

      <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
        {daysLabel(lead.createdAt)}
      </p>
    </div>
  )
}

/** Board card wired to dnd-kit drag listeners. */
function LeadCardBoard({
  lead,
  onOpen,
  onMove,
}: {
  lead: LeadDTO
  onOpen: (id: string) => void
  onMove: (id: string, status: LeadStatus) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(lead.id)}
      className={cn('rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring', isDragging && 'opacity-30')}
    >
      <LeadCardStatic lead={lead} onOpen={onOpen} onMove={onMove} />
    </div>
  )
}

/** Keyboard-accessible "Move to…" fallback — works without dragging. */
function MoveMenu({ lead, onMove }: { lead: LeadDTO; onMove: (id: string, status: LeadStatus) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span className="-m-1 inline-flex p-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            aria-label={`Move ${lead.name} to another stage`}
          >
            <MoreVertical className="size-4" aria-hidden="true" />
          </Button>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Move to…</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LEAD_STATUSES.map(s => (
          <DropdownMenuItem
            key={s}
            disabled={s === lead.status}
            onClick={() => onMove(lead.id, s)}
          >
            {leadStatusLabel[s]}
            {s === lead.status && (
              <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">now</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ----------------------------- kanban ------------------------------- */

function KanbanColumn({
  status,
  leads,
  onOpen,
  onMove,
}: {
  status: LeadStatus
  leads: LeadDTO[]
  onOpen: (id: string) => void
  onMove: (id: string, status: LeadStatus) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <section
      ref={setNodeRef}
      aria-label={`${leadStatusLabel[status]} stage, ${leads.length} leads`}
      className={cn(
        'flex min-h-[240px] w-[280px] shrink-0 snap-start flex-col rounded-lg border bg-muted/30 p-2 transition-colors md:w-auto',
        isOver && 'border-gold/60 bg-gold/5',
      )}
    >
      <header className="mb-2 flex items-center justify-between px-1.5 py-1">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {leadStatusLabel[status]}
        </h3>
        <Badge className="border-transparent bg-gold/15 text-gold-deep tabular-nums dark:text-gold">
          {leads.length}
        </Badge>
      </header>
      <div className="flex flex-1 flex-col gap-2">
        {leads.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border/70 p-4">
            <p className="text-xs text-muted-foreground/70">No leads here yet</p>
          </div>
        )}
        {leads.map(l => (
          <LeadCardBoard key={l.id} lead={l} onOpen={onOpen} onMove={onMove} />
        ))}
      </div>
    </section>
  )
}

/* ---------------------------- detail sheet -------------------------- */

interface LeadSheetProps {
  lead: LeadDTO
  properties: PropertyDTO[]
  onClose: () => void
  onMove: (id: string, status: LeadStatus) => void
  onAssign: (id: string, agent: string | null) => void
  onAddNote: (id: string, text: string) => void
}

function LeadSheet({ lead, properties, onClose, onMove, onAssign, onAddNote }: LeadSheetProps) {
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
    <Sheet open onOpenChange={o => !o && onClose()}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/70 p-5 pr-14">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge className="border-transparent bg-gold/15 text-gold-deep dark:text-gold">
              {leadStatusLabel[lead.status]}
            </Badge>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold tabular-nums',
                scoreChipClass(lead.score),
              )}
            >
              Score {lead.score}
            </span>
            <span className="text-xs text-muted-foreground">
              {daysLabel(lead.createdAt)} · via {leadSourceLabel[lead.source]}
            </span>
          </div>
          <SheetTitle className="font-display text-2xl leading-snug">{lead.name}</SheetTitle>
          <SheetDescription>
            {lead.budgetKes != null ? `Budget ${formatKes(lead.budgetKes)}` : 'Budget not stated'} ·
            created {formatDate(lead.createdAt)}
          </SheetDescription>
        </SheetHeader>

        <div className="delima-scroll flex-1 space-y-6 overflow-y-auto p-5">
          {/* contact */}
          <section aria-label="Contact details" className="space-y-2">
            <p className="eyebrow">Contact</p>
            <a
              href={`mailto:${lead.email}`}
              className="flex min-h-11 items-center gap-2.5 rounded-md border border-border/80 bg-card px-3 text-sm transition-colors hover:border-gold/50 hover:bg-gold/5"
              aria-label={`Email ${lead.name} at ${lead.email}`}
            >
              <Mail className="size-4 shrink-0 text-gold-deep dark:text-gold" aria-hidden="true" />
              <span className="truncate">{lead.email}</span>
            </a>
            <a
              href={`tel:${lead.phone}`}
              className="flex min-h-11 items-center gap-2.5 rounded-md border border-border/80 bg-card px-3 text-sm transition-colors hover:border-gold/50 hover:bg-gold/5"
              aria-label={`Call ${lead.name} on ${lead.phone}`}
            >
              <Phone className="size-4 shrink-0 text-gold-deep dark:text-gold" aria-hidden="true" />
              <span className="truncate">{lead.phone}</span>
            </a>
            <a
              href={whatsappLink(
                lead.phone,
                `Hello ${lead.name}, this is ${lead.assignedTo ?? 'the Delima desk'} from Delima Realtors, following up on your enquiry.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-2.5 rounded-md border border-border/80 bg-card px-3 text-sm transition-colors hover:border-gold/50 hover:bg-gold/5"
              aria-label={`WhatsApp ${lead.name}`}
            >
              <MessageCircle className="size-4 shrink-0 text-gold-deep dark:text-gold" aria-hidden="true" />
              <span className="truncate">WhatsApp {lead.name.split(' ')[0]}</span>
            </a>
            {lead.message && (
              <p className="rounded-md bg-muted/50 p-3 text-sm italic leading-relaxed text-muted-foreground">
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
                className="h-11 w-full justify-between gap-2 font-medium"
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
              <Label htmlFor="lead-status">Stage</Label>
              <Select
                value={lead.status}
                onValueChange={v => {
                  if (isLeadStatus(v)) onMove(lead.id, v)
                }}
              >
                <SelectTrigger id="lead-status" className="h-11 w-full" aria-label="Change lead stage">
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
              <Label htmlFor="lead-assign">Assigned to</Label>
              <Select
                value={lead.assignedTo ?? 'UNASSIGNED'}
                onValueChange={v => onAssign(lead.id, v === 'UNASSIGNED' ? null : v)}
              >
                <SelectTrigger id="lead-assign" className="h-11 w-full" aria-label="Assign lead to an agent">
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
              <ol className="relative space-y-4 border-l border-border/80 pl-5">
                {lead.notes.map((n, i) => (
                  <li key={i} className="relative">
                    <span
                      className="absolute -left-[25.5px] top-1 size-2.5 rounded-full gold-gradient-bg ring-2 ring-background"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-bold text-gold-deep dark:text-gold">
                      {n.author} · {formatDate(n.at)}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">{n.text}</p>
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
                className="resize-none"
              />
              <Button
                className="h-11 min-h-11 w-full gold-gradient-bg font-semibold text-espresso hover:opacity-90 sm:w-auto sm:px-6"
                disabled={!note.trim()}
                onClick={submitNote}
              >
                Add note
              </Button>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* ---------------------------- CRM dashboard ------------------------- */

function KpiCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: ReactNode }) {
  return (
    <Card className="luxury-card border-border/80">
      <CardContent className="p-4 md:p-5">
        <div className="mb-2 flex items-center gap-2 text-gold-deep dark:text-gold">
          {icon}
          <p className="eyebrow">{label}</p>
        </div>
        <p className="font-display text-2xl tabular-nums sm:text-3xl">{value}</p>
        <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}

function CrmDashboard({ onSessionExpired }: { onSessionExpired: () => void }) {
  const { toast } = useToast()
  const { properties } = useProperties()

  const [leads, setLeads] = useState<LeadDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

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

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(LEAD_STATUSES.map(s => [s, [] as LeadDTO[]])) as Record<LeadStatus, LeadDTO[]>
    for (const l of leads) map[l.status].push(l)
    return map
  }, [leads])

  const kpis = useMemo(() => {
    const total = leads.length
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const newThisMonth = leads.filter(l => new Date(l.createdAt).getTime() >= monthStart).length
    const closed = leads.filter(l => l.status === 'CLOSED').length
    const lost = leads.filter(l => l.status === 'LOST').length
    const conversion = total - lost > 0 ? (closed / (total - lost)) * 100 : 0
    const avgScore = total > 0 ? leads.reduce((acc, l) => acc + l.score, 0) / total : 0
    return { total, newThisMonth, conversion, avgScore }
  }, [leads])

  const pipelineData = useMemo(
    () => LEAD_STATUSES.map(s => ({ stage: leadStatusLabel[s], count: byStatus[s].length })),
    [byStatus],
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

  const activeLead = activeId ? leads.find(l => l.id === activeId) ?? null : null
  const selectedLead = selectedId ? leads.find(l => l.id === selectedId) ?? null : null

  /* ---------- dnd ---------- */

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  )

  const onDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id))

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const leadId = String(active.id)
    const targetStatus = String(over.id)
    if (!isLeadStatus(targetStatus)) return
    moveLead(leadId, targetStatus)
  }

  /* ---------- render ---------- */

  return (
    <div className="mx-auto w-full max-w-[110rem] px-4 py-10 sm:px-6 md:py-12 lg:px-8">
      {/* header */}
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 flex flex-wrap items-end justify-between gap-4"
      >
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">Agent CRM</p>
          <h2 className="gold-underline font-display text-3xl leading-tight sm:text-4xl">
            Every lead, <span className="gold-gradient-text">one desk</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Drag cards between stages, or use each card&apos;s menu. Tap a card for the full
            history, notes and assignment.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-11 min-h-11 gap-2 border-gold/40 hover:border-gold hover:bg-gold/10"
          onClick={() => void load()}
          aria-label="Refresh leads"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Refresh
        </Button>
      </motion.header>

      {/* error */}
      {error && !loading && (
        <Card className="mb-6 border-destructive/40">
          <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg">Could not load the pipeline</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              className="h-11 min-h-11 gap-2 gold-gradient-bg font-semibold text-espresso hover:opacity-90"
              onClick={() => void load()}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      {loading ? (
        <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i} className="border-border/80">
              <CardContent className="space-y-3 p-5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KpiCard
            icon={<Users className="size-4" aria-hidden="true" />}
            label="Total leads"
            value={String(kpis.total)}
            sub="across all stages"
          />
          <KpiCard
            icon={<UserPlus className="size-4" aria-hidden="true" />}
            label="New this month"
            value={String(kpis.newThisMonth)}
            sub="arrived since the 1st"
          />
          <KpiCard
            icon={<Target className="size-4" aria-hidden="true" />}
            label="Conversion rate"
            value={`${kpis.conversion.toFixed(0)}%`}
            sub="closed ÷ (total − lost)"
          />
          <KpiCard
            icon={<Gauge className="size-4" aria-hidden="true" />}
            label="Avg score"
            value={kpis.avgScore.toFixed(1)}
            sub="lead quality 0–100"
          />
        </div>
      )}

      {/* Kanban board */}
      {loading ? (
        <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-3 md:overflow-visible 2xl:grid-cols-6">
          {LEAD_STATUSES.map(s => (
            <div key={s} className="w-[280px] shrink-0 space-y-3 rounded-lg border bg-muted/30 p-3 md:w-auto">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : leads.length === 0 && !error ? (
        <Card className="border-dashed border-gold/40 bg-sand/40 dark:bg-espresso-soft/60">
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full gold-gradient-bg text-espresso">
              <Users className="size-6" aria-hidden="true" />
            </span>
            <h3 className="font-display text-xl">No leads yet</h3>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              New enquiries from contact forms, valuations and the AI assistant will land here
              in real time.
            </p>
          </CardContent>
        </Card>
      ) : (
        !error && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <div className="delima-scroll flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:overflow-x-visible md:pb-0 2xl:grid-cols-6">
              {LEAD_STATUSES.map(s => (
                <KanbanColumn key={s} status={s} leads={byStatus[s]} onOpen={setSelectedId} onMove={moveLead} />
              ))}
            </div>
            <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
              {activeLead ? (
                <div className="rotate-2 opacity-95">
                  <LeadCardStatic lead={activeLead} overlay />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )
      )}

      {/* analytics */}
      {!loading && !error && leads.length > 0 && (
        <Card className="mt-10 border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl">Pipeline analytics</CardTitle>
            <CardDescription>Where the book stands today.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pipeline">
              <TabsList className="mb-5 grid h-auto w-full max-w-sm grid-cols-2 gap-1 p-1.5">
                <TabsTrigger value="pipeline" className="min-h-11 py-2 font-semibold">
                  Pipeline
                </TabsTrigger>
                <TabsTrigger value="sources" className="min-h-11 py-2 font-semibold">
                  Sources
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pipeline" className="focus-visible:outline-none">
                <div className="h-64 w-full md:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="stage"
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                        stroke="var(--border)"
                        tickMargin={6}
                      />
                      <YAxis
                        allowDecimals={false}
                        width={32}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                        stroke="var(--border)"
                      />
                      <RechartsTooltip
                        cursor={{ fill: 'var(--sand)', opacity: 0.45 }}
                        content={<EspressoTip formatValue={v => leadsWord(Math.round(v))} />}
                      />
                      <Bar dataKey="count" name="Leads" fill="var(--gold)" radius={[6, 6, 0, 0]} maxBarSize={48} />
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
                          stroke="var(--card)"
                          strokeWidth={2}
                        >
                          {sourceData.map(entry => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<EspressoTip formatValue={v => leadsWord(Math.round(v))} />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* detail sheet */}
      {selectedLead && (
        <LeadSheet
          lead={selectedLead}
          properties={properties}
          onClose={() => setSelectedId(null)}
          onMove={moveLead}
          onAssign={assignLead}
          onAddNote={addNote}
        />
      )}
    </div>
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
