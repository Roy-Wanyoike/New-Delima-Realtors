// Delima Realtors 3.0 — AI Valuation
// "What's your home worth?" → POST /api/valuation → confidence-scored ValuationResult.
// All request fields, validation rules and result rendering preserved from 2.0;
// layout flattened from the 3-step wizard into a single modern form grid.
'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Award,
  Bell,
  BrainCircuit,
  CalendarCheck,
  Clock,
  Loader2,
  MapPin,
  MapPinned,
  RotateCcw,
  Ruler,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Container, Reveal, StatBlock, Pill } from '@/components/delima/ui-kit'
import { useInsights, useProperties } from '@/hooks/use-delima-data'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { formatKes, formatSqm, typeLabel } from '@/lib/format'
import { PROPERTY_TYPES, type PropertyType, type ValuationResult } from '@/lib/types'
import { cn, fetchWithTimeout } from '@/lib/utils'

type Condition = 'Exceptional' | 'Well kept' | 'Needs updating'

const CONDITIONS: Array<{ value: Condition; hint: string }> = [
  { value: 'Exceptional', hint: 'Showpiece finishes, premium fittings' },
  { value: 'Well kept', hint: 'Maintained, only minor wear' },
  { value: 'Needs updating', hint: 'Dated, renovation upside' },
]

interface ValForm {
  type: PropertyType
  bedrooms: number
  bathrooms: number
  sqm: string
  yearBuilt: string
  neighborhood: string
  condition: Condition
  parking: number
  name: string
  email: string
  phone: string
  notes: string
}

const INITIAL: ValForm = {
  type: 'VILLA',
  bedrooms: 4,
  bathrooms: 3,
  sqm: '',
  yearBuilt: '',
  neighborhood: '',
  condition: 'Well kept',
  parking: 2,
  name: '',
  email: '',
  phone: '',
  notes: '',
}

/* ------------------------------------------------------------------ */
/* Loading + result states                                             */
/* ------------------------------------------------------------------ */

function AnalyzingCard() {
  return (
    <div className="card-modern p-10 text-center" role="status" aria-live="polite">
      <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2.5 animate-bounce rounded-full bg-sun" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <BrainCircuit className="mx-auto mt-5 size-10 text-brand" aria-hidden="true" />
      <p className="mt-4 text-lg font-bold">Analyzing Nairobi comparables…</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Matching your home against live inventory, condition and vintage across nine neighborhoods.
      </p>
      <div className="mx-auto mt-6 w-full max-w-sm space-y-2.5">
        <Skeleton className="shimmer mx-auto h-3 w-3/4" />
        <Skeleton className="shimmer h-3 w-full" />
        <Skeleton className="shimmer mx-auto h-3 w-5/6" />
      </div>
    </div>
  )
}

function ResultCard({ result, email, onRestart }: { result: ValuationResult; email: string; onRestart: () => void }) {
  const setView = useAppStore((s) => s.setView)
  const { t } = useI18n()
  const { toast } = useToast()
  const [alertsState, setAlertsState] = useState<'idle' | 'loading' | 'saved'>('idle')

  const paragraphs = result.narrative.split(/\n{2,}|\n/).map((s) => s.trim()).filter(Boolean)

  const saveAlerts = async () => {
    if (alertsState !== 'idle') return
    const clean = email.trim()
    if (!/^\S+@\S+\.\S+$/.test(clean)) {
      toast({ title: 'Add your email first', description: 'Update the email field and run the valuation to enable alerts.', variant: 'destructive' })
      return
    }
    setAlertsState('loading')
    try {
      const res = await fetchWithTimeout('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean }),
      })
      if (!res.ok) throw new Error('The alert service is unavailable right now.')
      setAlertsState('saved')
      toast({ title: 'Alerts on', description: "We'll ping you when matching homes hit the market." })
    } catch (e) {
      setAlertsState('idle')
      toast({
        title: 'Alerts not saved',
        description: e instanceof Error ? e.message : 'Please try again in a moment.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-5">
      {/* price range */}
      <div className="card-modern p-5 sm:p-6">
        <p className="eyebrow">{t('valuation.resultEyebrow')}</p>
        <p className="mt-4 text-sm text-muted-foreground">Estimated market range</p>
        <p className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {formatKes(result.lowKes)} <span className="text-muted-foreground">—</span> {formatKes(result.highKes)}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <StatBlock value={formatKes(result.lowKes)} label="Low estimate" icon={TrendingDown} />
          <div className="relative">
            <StatBlock value={formatKes(result.midKes)} label="Mid estimate" icon={Sparkles} className="ring-2 ring-sun" />
            <Pill tone="sun" className="absolute -top-2.5 right-3 px-2 py-0.5 text-[10px]">Most likely</Pill>
          </div>
          <StatBlock value={formatKes(result.highKes)} label="High estimate" icon={TrendingUp} />
        </div>

        <div className="mt-6">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Confidence {result.confidence}%
          </p>
          <Progress
            value={result.confidence}
            className="h-2 [&>[data-slot=progress-indicator]]:bg-sun"
            aria-label={`Confidence ${result.confidence}%`}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={() => setView('agents')}
            className="btn-sun h-12 min-h-[44px] flex-1 rounded-full border-0 px-6 text-sm font-bold sm:flex-none"
          >
            <CalendarCheck className="size-4" aria-hidden="true" /> Talk to an agent
          </Button>
          <Button
            variant="outline"
            onClick={() => void saveAlerts()}
            disabled={alertsState === 'loading'}
            className="h-12 min-h-[44px] rounded-full border-line px-5 text-sm font-semibold hover:bg-brand-soft hover:text-brand"
          >
            {alertsState === 'loading'
              ? <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              : <Bell className="size-4" aria-hidden="true" />}
            {alertsState === 'saved' ? 'Alerts saved' : 'Save & get alerts'}
          </Button>
          <Button
            variant="ghost"
            onClick={onRestart}
            className="h-12 min-h-[44px] rounded-full px-4 text-sm font-semibold text-muted-foreground hover:text-brand"
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Value another
          </Button>
        </div>
      </div>

      {/* narrative */}
      <div className="card-modern p-6">
        <p className="eyebrow mb-3">{t('valuation.notesEyebrow')}</p>
        <div className="space-y-3">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
          ))}
        </div>
      </div>

      {/* comparables */}
      <div>
        <p className="eyebrow mb-3">{t('valuation.compsEyebrow')}</p>
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-brand-soft/50 hover:bg-brand-soft/50">
                <TableHead className="uppercase tracking-wider">Comparable</TableHead>
                <TableHead className="hidden uppercase tracking-wider sm:table-cell">Neighborhood</TableHead>
                <TableHead className="uppercase tracking-wider">Price</TableHead>
                <TableHead className="uppercase tracking-wider">Size</TableHead>
                <TableHead className="hidden uppercase tracking-wider lg:table-cell">Match profile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.comps.map((c) => (
                <TableRow key={`${c.title}-${c.priceKes}`}>
                  <TableCell className="max-w-[180px] truncate font-semibold">{c.title}</TableCell>
                  <TableCell className="hidden sm:table-cell">{c.neighborhood}</TableCell>
                  <TableCell className="font-bold text-brand">{formatKes(c.priceKes)}</TableCell>
                  <TableCell>{formatSqm(c.sqm)}</TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">{c.similarityNote}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

function ValuationForm() {
  const { neighborhoods } = useInsights()
  const { properties } = useProperties()
  const { toast } = useToast()

  const [form, setForm] = useState<ValForm>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ValuationResult | null>(null)

  const set = (patch: Partial<ValForm>) => setForm((f) => ({ ...f, ...patch }))

  const nbOptions = useMemo(() => {
    const seen = new Map<string, string>()
    properties.forEach((p) => seen.set(p.neighborhoodSlug, p.neighborhood))
    neighborhoods.forEach((n) => seen.set(n.slug, n.name))
    return [...seen.entries()].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [neighborhoods, properties])

  // Validation preserved from the 2.0 wizard (all steps combined).
  const sqmNum = Number(form.sqm)
  const yearNum = Number(form.yearBuilt)
  const sizeValid = sqmNum >= 20 && yearNum >= 1900 && yearNum <= 2026
  const nbValid = form.neighborhood !== ''
  const contactValid =
    form.name.trim().length >= 2 &&
    /^\S+@\S+\.\S+$/.test(form.email.trim()) &&
    form.phone.trim().length >= 7
  const valid = sizeValid && nbValid && contactValid

  const submit = async () => {
    if (!valid || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWithTimeout('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          sqm: Math.round(sqmNum),
          yearBuilt: Math.round(yearNum),
          neighborhood: form.neighborhood,
          condition: form.condition,
          parking: form.parking,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          notes: form.notes.trim() || undefined,
        }),
      })
      const data: unknown = await res.json()
      if (!res.ok) {
        const msg = (data as { error?: string })?.error ?? `Valuation failed (${res.status})`
        throw new Error(msg)
      }
      setResult(data as ValuationResult)
      toast({ title: 'Valuation ready', description: 'Scroll down for your estimate, confidence score and comparables.' })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong. Please try again.'
      setError(msg)
      toast({ title: 'Valuation failed', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const restart = () => {
    setForm(INITIAL)
    setResult(null)
    setError(null)
  }

  if (loading) return <AnalyzingCard />
  if (result) return <ResultCard result={result} email={form.email} onRestart={restart} />

  return (
    <div className="card-modern p-5 sm:p-6">
      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); void submit() }}
        className="grid gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="val-nb">Neighborhood</Label>
            <Select value={form.neighborhood} onValueChange={(v) => set({ neighborhood: v })}>
              <SelectTrigger id="val-nb" className="h-11 w-full" aria-label="Neighborhood">
                <SelectValue placeholder="Choose a neighborhood" />
              </SelectTrigger>
              <SelectContent>
                {nbOptions.map((n) => (
                  <SelectItem key={n.slug} value={n.slug}>{n.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="val-type">Property type</Label>
            <Select value={form.type} onValueChange={(v) => set({ type: v as PropertyType })}>
              <SelectTrigger id="val-type" className="h-11 w-full" aria-label="Property type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((ty) => (
                  <SelectItem key={ty} value={ty}>{typeLabel[ty]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="val-beds">Bedrooms</Label>
            <Select value={String(form.bedrooms)} onValueChange={(v) => set({ bedrooms: Number(v) })}>
              <SelectTrigger id="val-beds" className="h-11 w-full" aria-label="Bedrooms">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((b) => (
                  <SelectItem key={b} value={String(b)}>{b === 6 ? '6+' : b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="val-baths">Bathrooms</Label>
            <Select value={String(form.bathrooms)} onValueChange={(v) => set({ bathrooms: Number(v) })}>
              <SelectTrigger id="val-baths" className="h-11 w-full" aria-label="Bathrooms">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7].map((b) => (
                  <SelectItem key={b} value={String(b)}>{b === 7 ? '7+' : b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="val-parking">Parking bays</Label>
            <Select value={String(form.parking)} onValueChange={(v) => set({ parking: Number(v) })}>
              <SelectTrigger id="val-parking" className="h-11 w-full" aria-label="Parking bays">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((b) => (
                  <SelectItem key={b} value={String(b)}>{b === 0 ? 'None' : b === 5 ? '5+' : b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="val-sqm">Size (sqm)</Label>
            <Input
              id="val-sqm" type="number" inputMode="numeric" min={20} max={5000} placeholder="e.g. 420"
              value={form.sqm} onChange={(e) => set({ sqm: e.target.value })} className="h-11 border-line"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="val-year">Year built</Label>
            <Input
              id="val-year" type="number" inputMode="numeric" min={1900} max={2026} placeholder="e.g. 2015"
              value={form.yearBuilt} onChange={(e) => set({ yearBuilt: e.target.value })} className="h-11 border-line"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Condition</Label>
          <RadioGroup value={form.condition} onValueChange={(v) => set({ condition: v as Condition })} className="grid gap-3 sm:grid-cols-3">
            {CONDITIONS.map((c) => (
              <Label
                key={c.value}
                htmlFor={`cond-${c.value}`}
                className={cn(
                  'flex min-h-[76px] cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-left transition-colors',
                  form.condition === c.value
                    ? 'border-sun bg-sun-soft/60 ring-1 ring-sun/40'
                    : 'border-line hover:bg-brand-soft/50',
                )}
              >
                <RadioGroupItem id={`cond-${c.value}`} value={c.value} className="mt-0.5" />
                <span>
                  <span className="block text-sm font-semibold">{c.value}</span>
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{c.hint}</span>
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="val-name">Full name</Label>
            <Input id="val-name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Amina Wanjiru" className="h-11 border-line" autoComplete="name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="val-email">Email</Label>
            <Input id="val-email" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@example.com" className="h-11 border-line" autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="val-phone">Phone</Label>
            <Input id="val-phone" type="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+254 7…" className="h-11 border-line" autoComplete="tel" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="val-notes">Notes (optional)</Label>
          <Textarea
            id="val-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })}
            placeholder="Renovations, pool, DSQ, acreage — anything our valuers should know."
            className="min-h-[96px] border-line delima-scroll" rows={3}
          />
        </div>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="submit"
            disabled={!valid || loading}
            className="btn-sun h-12 min-h-[44px] rounded-full border-0 px-8 text-sm font-bold"
          >
            <Sparkles className="size-4" aria-hidden="true" /> Get my AI valuation
          </Button>
          <p className="text-xs text-muted-foreground">
            {valid
              ? 'Your details create a private valuation request with our brokerage team — no spam, ever.'
              : 'Add size (min 20 sqm), year built (1900–2026), a neighborhood and contact details to continue.'}
          </p>
        </div>
      </form>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Aside — how it works + trust markers                                */
/* ------------------------------------------------------------------ */

const HOW_IT_WORKS = [
  { icon: Ruler, title: 'Describe the property', text: 'Type, size, vintage and condition — sixty seconds, no documents.' },
  { icon: MapPin, title: 'We place it on the atlas', text: 'Your home is matched to one of our nine Nairobi neighborhoods.' },
  { icon: BrainCircuit, title: 'AI weighs live comparables', text: 'The engine benchmarks against Delima\u2019s current inventory, adjusted for condition and age.' },
  { icon: CalendarCheck, title: 'Refine with a visit', text: 'Book a physical valuation to tighten the range before listing.' },
]

const TRUST = [
  { icon: Award, label: 'KES 3.1B+ in valued assets' },
  { icon: MapPinned, label: '9 neighborhoods covered' },
  { icon: Clock, label: 'Instant preliminary estimate' },
  { icon: ShieldCheck, label: 'Confidence-scored output' },
]

function AsidePanel() {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24" aria-label="About the AI valuation">
      <div className="card-modern p-6">
        <p className="eyebrow">How it works</p>
        <h3 className="mt-1 text-xl font-bold">From key details to a defensible range</h3>
        <ol className="mt-5 space-y-5">
          {HOW_IT_WORKS.map((s, i) => (
            <li key={s.title} className="flex gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand" aria-hidden="true">
                <s.icon className="size-4.5" />
              </span>
              <div>
                <p className="text-sm font-bold">
                  <span className="mr-1.5 text-sun-deep">{i + 1}.</span>
                  {s.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="card-modern p-6">
        <div className="grid grid-cols-2 gap-3">
          {TRUST.map((t) => (
            <div key={t.label} className="flex items-center gap-2.5 rounded-xl border border-line bg-brand-soft/50 p-3">
              <t.icon className="size-4.5 shrink-0 text-brand" aria-hidden="true" />
              <p className="text-xs font-semibold leading-snug">{t.label}</p>
            </div>
          ))}
        </div>
        <Separator className="my-5" />
        <blockquote>
          <p className="text-base italic leading-relaxed">
            &ldquo;The AI estimate landed within 4% of our final Karen sale price — and the comparables made pricing the house effortless.&rdquo;
          </p>
          <footer className="mt-3 text-xs font-semibold text-muted-foreground">— W. Kamau, seller, Karen</footer>
        </blockquote>
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------------ */

export default function ValuationView() {
  const { t } = useI18n()
  return (
    <Container className="py-10 sm:py-16">
      <Reveal>
        <header className="max-w-2xl">
          <p className="eyebrow">{t('valuation.eyebrow')}</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {t('valuation.titleFull')}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {t('valuation.heroSub')}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Pill tone="brand">60-second estimate</Pill>
            <Pill tone="outline">Live inventory comps</Pill>
            <Pill tone="outline">Confidence-scored</Pill>
          </div>
        </header>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Reveal delay={0.05}>
          <ValuationForm />
        </Reveal>
        <Reveal delay={0.1}>
          <AsidePanel />
        </Reveal>
      </div>
    </Container>
  )
}
