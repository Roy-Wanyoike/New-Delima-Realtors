// Delima Realtors Platform 2.0 — AI Valuation (issue #56)
// 3-step wizard → POST /api/valuation → ValuationResult card.
'use client'

import { Fragment, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Award,
  BrainCircuit,
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  MapPin,
  MapPinned,
  RotateCcw,
  Ruler,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useInsights, useProperties } from '@/hooks/use-delima-data'
import { useToast } from '@/hooks/use-toast'
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

const STEP_LABELS = ['Property', 'Location', 'Contact']

function CompThumb() {
  return (
    <span className="gold-gradient-bg flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-espresso" aria-hidden="true">
      <Home className="size-4" />
    </span>
  )
}

function AnalyzingCard() {
  return (
    <Card className="border-gold/40 luxury-shadow">
      <CardContent className="flex flex-col items-center gap-5 p-10 text-center">
        <div className="flex items-center gap-1.5" aria-label="Analyzing">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 animate-bounce rounded-full bg-gold" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <BrainCircuit className="size-10 text-gold-deep dark:text-gold" aria-hidden="true" />
        <div>
          <p className="font-display text-xl">Analyzing Nairobi comparables…</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Matching your home against live inventory, condition and vintage across nine neighborhoods.
          </p>
        </div>
        <div className="w-full max-w-sm space-y-2.5 pt-2">
          <Skeleton className="shimmer h-3 w-3/4 mx-auto" />
          <Skeleton className="shimmer h-3 w-full" />
          <Skeleton className="shimmer h-3 w-5/6 mx-auto" />
        </div>
      </CardContent>
    </Card>
  )
}

function ResultCard({ result, onRestart }: { result: ValuationResult; onRestart: () => void }) {
  const { toast } = useToast()
  const paragraphs = result.narrative.split(/\n{2,}|\n/).map((s) => s.trim()).filter(Boolean)

  return (
    <Card className="border-gold/40 luxury-shadow">
      <div aria-hidden="true" className="gold-gradient-bg h-1 rounded-t-xl" />
      <CardContent className="p-6">
        <p className="eyebrow">Your AI valuation</p>
        <p className="mt-3 font-display text-sm text-muted-foreground">Estimated market range</p>
        <p className="font-display text-2xl leading-tight md:text-3xl">
          {formatKes(result.lowKes)} <span className="text-muted-foreground">—</span> {formatKes(result.highKes)}
        </p>
        <p className="mt-2 font-display text-xl">
          Mid estimate{' '}
          <span className="gold-gradient-text font-bold">{formatKes(result.midKes)}</span>
        </p>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">Confidence</span>
            <span className="font-bold text-gold-deep dark:text-gold">{result.confidence}%</span>
          </div>
          <Progress value={result.confidence} className="h-2 [&>[data-slot=progress-indicator]]:bg-gold" aria-label={`Confidence ${result.confidence}%`} />
        </div>

        <Separator className="my-5" />

        <div className="space-y-3">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
          ))}
        </div>

        <Separator className="my-5" />

        <p className="eyebrow mb-3">Comparable listings used</p>
        <ul className="space-y-2.5">
          {result.comps.map((c) => (
            <li key={`${c.title}-${c.priceKes}`} className="flex items-center gap-3 rounded-lg border bg-background p-2.5">
              <CompThumb />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{c.title}</p>
                <p className="truncate text-xs text-muted-foreground">{c.neighborhood} · {formatSqm(c.sqm)}</p>
                <p className="truncate text-[11px] italic text-muted-foreground">{c.similarityNote}</p>
              </div>
              <p className="shrink-0 text-sm font-bold text-gold-deep dark:text-gold">{formatKes(c.priceKes, { compact: true })}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={() => toast({ title: 'Valuation visit booked', description: 'Our team will call you within 24 hours to confirm a slot.' })}
            className="h-11 min-h-[44px] flex-1 gold-gradient-bg border-0 text-espresso hover:opacity-90 sm:flex-none"
          >
            <CalendarCheck className="size-4" /> Book a valuation visit
          </Button>
          <Button variant="outline" onClick={onRestart} className="h-11 min-h-[44px] border-gold/40 hover:bg-gold/10 hover:text-gold-deep dark:hover:text-gold">
            <RotateCcw className="size-4" /> Value another property
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */

function WizardContent() {
  const { neighborhoods } = useInsights()
  const { properties } = useProperties()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
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

  const sqmNum = Number(form.sqm)
  const yearNum = Number(form.yearBuilt)
  const step1Valid = sqmNum >= 20 && yearNum >= 1900 && yearNum <= 2026
  const step2Valid = form.neighborhood !== ''
  const step3Valid =
    form.name.trim().length >= 2 &&
    /^\S+@\S+\.\S+$/.test(form.email.trim()) &&
    form.phone.trim().length >= 7
  const stepValid = step === 1 ? step1Valid : step === 2 ? step2Valid : step3Valid

  const submit = async () => {
    if (!step3Valid || loading) return
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
    setStep(1)
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      {/* stepper */}
      <Card className="border-border/70">
        <CardContent className="p-4 md:p-5">
          <ol className="flex items-center gap-2" aria-label={`Step ${step} of 3: ${STEP_LABELS[step - 1]}`}>
            {STEP_LABELS.map((label, i) => {
              const n = i + 1
              const done = step > n
              const current = step === n
              return (
                <Fragment key={label}>
                  {i > 0 && <div aria-hidden="true" className={cn('h-px flex-1', step > i ? 'bg-gold' : 'bg-border')} />}
                  <li className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex size-9 items-center justify-center rounded-full border text-xs font-bold transition-colors',
                        done && 'gold-gradient-bg border-transparent text-espresso',
                        current && 'border-gold text-gold-deep ring-2 ring-gold/30 dark:text-gold',
                        !done && !current && 'bg-muted text-muted-foreground',
                      )}
                    >
                      {done ? <Check className="size-4" /> : n}
                    </span>
                    <span className={cn('hidden text-[11px] font-bold uppercase tracking-wider sm:block', current ? 'text-foreground' : 'text-muted-foreground')}>
                      {label}
                    </span>
                  </li>
                </Fragment>
              )
            })}
          </ol>
          <Progress
            value={(step / 3) * 100}
            className="mt-3 h-1.5 [&>[data-slot=progress-indicator]]:bg-gold"
            aria-label={`${Math.round((step / 3) * 100)}% complete`}
          />
        </CardContent>
      </Card>

      {loading ? (
        <AnalyzingCard />
      ) : result ? (
        <ResultCard result={result} onRestart={restart} />
      ) : (
        <Card className="border-border/70 luxury-shadow">
          <CardContent className="p-6">
            {error && (
              <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
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
                    <Label htmlFor="val-sqm">Size (sqm)</Label>
                    <Input
                      id="val-sqm" type="number" inputMode="numeric" min={20} max={5000} placeholder="e.g. 420"
                      value={form.sqm} onChange={(e) => set({ sqm: e.target.value })} className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 sm:max-w-[calc(50%-0.5rem)]">
                  <Label htmlFor="val-year">Year built</Label>
                  <Input
                    id="val-year" type="number" inputMode="numeric" min={1900} max={2026} placeholder="e.g. 2015"
                    value={form.yearBuilt} onChange={(e) => set({ yearBuilt: e.target.value })} className="h-11"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="grid gap-4">
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
                  <Label>Condition</Label>
                  <RadioGroup value={form.condition} onValueChange={(v) => set({ condition: v as Condition })} className="grid gap-3 sm:grid-cols-3">
                    {CONDITIONS.map((c) => (
                      <Label
                        key={c.value}
                        htmlFor={`cond-${c.value}`}
                        className={cn(
                          'flex min-h-[76px] cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-left transition-colors',
                          form.condition === c.value ? 'border-gold bg-gold/10 ring-1 ring-gold/40' : 'hover:bg-sand/60 dark:hover:bg-accent/50',
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
                <div className="space-y-1.5 sm:max-w-[240px]">
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
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="val-name">Full name</Label>
                    <Input id="val-name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Amina Wanjiru" className="h-11" autoComplete="name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="val-email">Email</Label>
                    <Input id="val-email" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@example.com" className="h-11" autoComplete="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="val-phone">Phone</Label>
                    <Input id="val-phone" type="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+254 7…" className="h-11" autoComplete="tel" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="val-notes">Notes (optional)</Label>
                  <Textarea
                    id="val-notes" value={form.notes} onChange={(e) => set({ notes: e.target.value })}
                    placeholder="Renovations, pool, DSQ, acreage — anything our valuers should know."
                    className="min-h-[96px] delima-scroll" rows={3}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your details create a private valuation request with our brokerage team — no spam, ever.
                </p>
              </motion.div>
            )}

            {/* nav buttons */}
            <div className="mt-6 flex gap-3">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className="h-11 min-h-[44px] border-gold/40 hover:bg-gold/10 hover:text-gold-deep dark:hover:text-gold"
                >
                  <ChevronLeft className="size-4" /> Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  onClick={() => setStep((s) => Math.min(3, s + 1))}
                  disabled={!stepValid}
                  className="h-11 min-h-[44px] flex-1 gold-gradient-bg border-0 text-espresso hover:opacity-90"
                >
                  Continue <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => void submit()}
                  disabled={!stepValid || loading}
                  className="h-11 min-h-[44px] flex-1 gold-gradient-bg border-0 text-espresso hover:opacity-90"
                >
                  <Sparkles className="size-4" /> Get my AI valuation
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* right column — how it works + trust markers */

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
    <div className="space-y-6 lg:sticky lg:top-24">
      <Card className="border-border/70 luxury-shadow">
        <CardContent className="p-6">
          <p className="eyebrow">How it works</p>
          <h3 className="mt-1 font-display text-xl">From key details to a defensible range</h3>
          <ol className="mt-5 space-y-5">
            {HOW_IT_WORKS.map((s, i) => (
              <li key={s.title} className="flex gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-deep dark:text-gold" aria-hidden="true">
                  <s.icon className="size-4.5" />
                </span>
                <div>
                  <p className="text-sm font-bold">
                    <span className="mr-1.5 text-gold-deep dark:text-gold">{i + 1}.</span>
                    {s.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {TRUST.map((tItem) => (
              <div key={tItem.label} className="flex items-center gap-2.5 rounded-lg border bg-sand/50 p-3 dark:bg-accent/40">
                <tItem.icon className="size-4.5 shrink-0 text-gold-deep dark:text-gold" aria-hidden="true" />
                <p className="text-xs font-semibold leading-snug">{tItem.label}</p>
              </div>
            ))}
          </div>
          <Separator className="my-5" />
          <blockquote>
            <p className="font-display text-base italic leading-relaxed">
              &ldquo;The AI estimate landed within 4% of our final Karen sale price — and the comparables made pricing the house effortless.&rdquo;
            </p>
            <footer className="mt-3 text-xs font-semibold text-muted-foreground">— W. Kamau, seller, Karen</footer>
          </blockquote>
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export default function ValuationView() {
  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="eyebrow">AI Valuation</p>
        <h2 className="gold-underline mt-2 font-display text-3xl md:text-4xl">What is your Nairobi home worth?</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Three quick steps. Our engine benchmarks your property against live Delima inventory,
          adjusts for condition and vintage, and returns a confidence-scored range in seconds.
        </p>
      </header>
      <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
        <WizardContent />
        <AsidePanel />
      </div>
    </div>
  )
}
