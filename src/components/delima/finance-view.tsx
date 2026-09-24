// Delima Realtors 3.0 — "Mortgage & ownership costs" studio (Task REV-5)
// Mortgage calculator + affordability planner, Kenyan-rate aware.
// All math preserved exactly (computeMortgage, 1/3-income affordability,
// extra-payment early payoff, LTV); visuals rebuilt on the 3.0 design system.
'use client'

import { useMemo, useState, type ReactNode } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BadgePercent,
  Building2,
  Calculator,
  CalendarClock,
  Coins,
  HandCoins,
  Info,
  Landmark,
  LineChart,
  Receipt,
  ScrollText,
  Search,
  Sparkles,
  Wallet,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProperties } from '@/hooks/use-delima-data'
import { useAppStore } from '@/lib/store'
import { formatKes } from '@/lib/format'
import type { PropertyDTO } from '@/lib/types'
import { DismissibleNote, Reveal, Section, StatBlock } from './ui-kit'

/* ----------------------------- helpers ----------------------------- */

/** Compact tick formatter for chart axes: 12,500,000 → "12.5M". */
function axisKes(v: number): string {
  if (Math.abs(v) >= 1_000_000) {
    const m = v / 1_000_000
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  if (Math.abs(v) >= 1_000) return `${Math.round(v / 1_000)}K`
  return `${Math.round(v)}`
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
  labelFormatter,
}: {
  active?: boolean
  payload?: TooltipItem[]
  label?: string | number
  formatValue?: (v: number) => string
  labelFormatter?: (l: string | number) => string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-xl border border-brand-mid/60 bg-brand px-3 py-2 text-white shadow-lg">
      {label !== undefined && labelFormatter && (
        <p className="mb-1 text-[11px] font-bold tracking-wide text-sun">
          {labelFormatter(label)}
        </p>
      )}
      <div className="space-y-0.5">
        {payload.map((item, i) => (
          <p key={i} className="text-xs font-semibold">
            {item.name ? `${item.name}: ` : ''}
            {formatValue ? formatValue(Number(item.value ?? 0)) : String(item.value ?? '')}
          </p>
        ))}
      </div>
    </div>
  )
}

/* ------------------------- money input field ------------------------ */

interface MoneyInputProps {
  id: string
  label: string
  value: number
  onChange: (v: number) => void
  hint?: string
  /** Visually hide the label (used under sliders that already carry one). */
  srLabel?: boolean
}

/** Numeric input that shows full formatKes formatting on blur, raw digits on focus. */
function MoneyInput({ id, label, value, onChange, hint, srLabel = false }: MoneyInputProps) {
  const [focused, setFocused] = useState(false)
  const [raw, setRaw] = useState('')
  const [lastValue, setLastValue] = useState(value)

  // Derive raw display from external value updates during render (React-recommended pattern)
  if (!focused && value !== lastValue) {
    setLastValue(value)
    setRaw(value ? String(Math.round(value)) : '')
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={srLabel ? 'sr-only' : 'text-sm font-semibold text-ink'}>
        {label}
      </Label>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        className="h-11 rounded-xl border-line bg-white font-semibold tabular-nums text-ink"
        value={focused ? raw : value > 0 ? formatKes(value) : ''}
        placeholder="0"
        onFocus={() => {
          setFocused(true)
          setRaw(value ? String(Math.round(value)) : '')
        }}
        onBlur={() => setFocused(false)}
        onChange={e => {
          const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 12)
          setRaw(digits)
          onChange(digits ? Number(digits) : 0)
        }}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/* --------------------------- slider field --------------------------- */

interface SliderFieldProps {
  id: string
  label: string
  caption: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  ariaValueText?: string
}

function SliderField({ id, label, caption, value, min, max, step, onChange, ariaValueText }: SliderFieldProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </Label>
        <span className="font-mono text-sm font-bold text-brand">{caption}</span>
      </div>
      <Slider
        id={id}
        aria-label={label}
        aria-valuetext={ariaValueText}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={v => onChange(v[0] ?? min)}
      />
    </div>
  )
}

/* -------------------------- amortization --------------------------- */

interface YearRow {
  year: number
  principal: number
  interest: number
  balance: number
}

interface MortgageResult {
  monthly: number
  months: number
  totalInterest: number
  totalPayable: number
  ltvPct: number
  schedule: Array<{ month: number; balance: number }>
  years: YearRow[]
}

/**
 * Standard amortization: M = P·r(1+r)^n / ((1+r)^n − 1); r = annual/12.
 * Handles r = 0, zero principal, and extra monthly payments (early payoff).
 */
function computeMortgage(
  principal: number,
  annualRatePct: number,
  years: number,
  extraMonthly: number,
): MortgageResult {
  const empty: MortgageResult = {
    monthly: 0,
    months: 0,
    totalInterest: 0,
    totalPayable: 0,
    ltvPct: 0,
    schedule: [],
    years: [],
  }
  if (principal <= 0) return empty

  const n = Math.max(1, Math.round(years * 12))
  const r = annualRatePct / 100 / 12

  let base: number
  if (r === 0) {
    base = principal / n
  } else {
    const growth = Math.pow(1 + r, n)
    base = (principal * r * growth) / (growth - 1)
  }
  const monthly = Number.isFinite(base) ? base : 0
  if (monthly <= 0) return empty

  let balance = principal
  let totalInterest = 0
  let months = 0
  const schedule: Array<{ month: number; balance: number }> = [{ month: 0, balance: principal }]
  const yearsRows: YearRow[] = []
  let yearPrincipal = 0
  let yearInterest = 0

  for (let m = 1; m <= n; m++) {
    const interest = balance * r
    let principalPart = monthly + Math.max(0, extraMonthly) - interest
    if (principalPart <= 0) principalPart = 0 // payment below interest — never converges; loop caps at n
    if (principalPart >= balance) principalPart = balance
    balance -= principalPart
    totalInterest += interest
    months = m
    yearPrincipal += principalPart
    yearInterest += interest
    schedule.push({ month: m, balance: Math.max(balance, 0) })

    if (m % 12 === 0 || balance <= 0 || m === n) {
      yearsRows.push({
        year: Math.ceil(m / 12),
        principal: yearPrincipal,
        interest: yearInterest,
        balance: Math.max(balance, 0),
      })
      yearPrincipal = 0
      yearInterest = 0
    }
    if (balance <= 0.005) break
  }

  return {
    monthly,
    months,
    totalInterest,
    totalPayable: principal + totalInterest,
    ltvPct: 0, // filled by caller (needs price)
    schedule,
    years: yearsRows,
  }
}

/* ------------------------ acquisition costs ------------------------ */

interface CostRow {
  icon: ReactNode
  label: string
  note: string
  value: string
  strong?: boolean
}

/** One-off Kenyan acquisition costs, computed from the current price. */
function useAcquisitionCosts(price: number): { rows: CostRow[]; total: string } {
  return useMemo(() => {
    const stampDuty = price * 0.04 // 4% urban / 2% rural — urban rate shown
    const legalFees = price * 0.015 * 1.16 // ~1.5% + 16% VAT
    const valuation = price * 0.0025 // ~0.25%
    const commissionLow = price * 0.0125 // 1.25%
    const commissionHigh = price * 0.025 // 2.5%
    const totalLow = stampDuty + legalFees + valuation + commissionLow
    const totalHigh = stampDuty + legalFees + valuation + commissionHigh

    const rows: CostRow[] = [
      {
        icon: <Landmark className="size-4" aria-hidden="true" />,
        label: 'Stamp duty',
        note: '4% urban · 2% rural',
        value: formatKes(Math.round(stampDuty)),
      },
      {
        icon: <ScrollText className="size-4" aria-hidden="true" />,
        label: 'Legal fees',
        note: '~1.5% + VAT',
        value: formatKes(Math.round(legalFees)),
      },
      {
        icon: <Building2 className="size-4" aria-hidden="true" />,
        label: 'Valuation',
        note: '~0.25%',
        value: formatKes(Math.round(valuation)),
      },
      {
        icon: <HandCoins className="size-4" aria-hidden="true" />,
        label: 'Agent commission',
        note: '1.25% – 2.5%',
        value: `${formatKes(Math.round(commissionLow), { compact: true })} – ${formatKes(Math.round(commissionHigh), { compact: true })}`,
      },
    ]
    return {
      rows,
      total: `${formatKes(Math.round(totalLow), { compact: true })} – ${formatKes(Math.round(totalHigh), { compact: true })}`,
    }
  }, [price])
}

/* ------------------------------ view ------------------------------- */

export default function FinanceView() {
  const { properties, loading, error } = useProperties()
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)

  // ---- mortgage inputs ----
  const [price, setPrice] = useState(25_000_000)
  const [depositPct, setDepositPct] = useState(20)
  const [ratePct, setRatePct] = useState(12.5)
  const [termYears, setTermYears] = useState(15)
  const [extraMonthly, setExtraMonthly] = useState(0)
  const [selectedListing, setSelectedListing] = useState('')

  // ---- affordability inputs ----
  const [income, setIncome] = useState(450_000)
  const [obligations, setObligations] = useState(80_000)
  const [depositAvailable, setDepositAvailable] = useState(4_000_000)
  const [affordRate, setAffordRate] = useState(12.5)
  const [affordTerm, setAffordTerm] = useState(15)

  const deposit = Math.round((price * depositPct) / 100)
  const principal = Math.max(0, price - deposit)

  const mortgage = useMemo(
    () => computeMortgage(principal, ratePct, termYears, extraMonthly),
    [principal, ratePct, termYears, extraMonthly],
  )
  const loanMonths = mortgage.months
  const baselineMonths = useMemo(
    () => computeMortgage(principal, ratePct, termYears, 0).months,
    [principal, ratePct, termYears],
  )
  const result: MortgageResult = useMemo(
    () => ({ ...mortgage, ltvPct: price > 0 ? (principal / price) * 100 : 0 }),
    [mortgage, price, principal],
  )

  const yearTicks = useMemo(() => {
    const maxMonth = result.schedule.length > 0 ? result.schedule[result.schedule.length - 1].month : termYears * 12
    const ticks: number[] = []
    for (let m = 0; m <= maxMonth; m += 12) ticks.push(m)
    return ticks
  }, [result.schedule, termYears])

  // ---- affordability math (1/3 income rule, inverted amortization) ----
  const afford = useMemo(() => {
    const maxRepayment = Math.max(0, income / 3 - obligations)
    const n = Math.max(1, Math.round(affordTerm * 12))
    const r = affordRate / 100 / 12
    let maxLoan = 0
    if (maxRepayment > 0) {
      if (r === 0) maxLoan = maxRepayment * n
      else maxLoan = maxRepayment * ((1 - Math.pow(1 + r, -n)) / r)
    }
    return { maxRepayment, maxLoan, budget: maxLoan + depositAvailable }
  }, [income, obligations, affordRate, affordTerm, depositAvailable])

  const canSearchHomes = afford.budget > 5_000_000

  const costs = useAcquisitionCosts(price)

  const onPickListing = (id: string) => {
    setSelectedListing(id)
    const p = properties.find(x => x.id === id)
    if (p && p.status !== 'FOR_RENT') setPrice(p.priceKes)
    else if (p) setPrice(p.priceKes) // rentals priced monthly — still loads for reference
  }

  return (
    <div className="flex flex-col">
      <Section className="pb-16 sm:pb-20">
        {/* ---------------- header ---------------- */}
        <Reveal className="mb-10 max-w-2xl sm:mb-12">
          <p className="eyebrow mb-3">Finance desk</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Mortgage &amp; ownership costs
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Run the numbers before you fall in love with the view. Kenyan rates, honest math,
            zero surprises — from deposit to final payment.
          </p>
          <div className="mt-6 h-1 w-14 rounded-full bg-sun" aria-hidden="true" />
        </Reveal>

        <Tabs defaultValue="mortgage" className="w-full">
          <TabsList className="mb-8 grid h-auto w-full max-w-md grid-cols-2 gap-1 rounded-full p-1.5">
            <TabsTrigger
              value="mortgage"
              className="min-h-11 gap-2 rounded-full py-2 text-sm font-semibold sm:text-[0.95rem]"
            >
              <Calculator className="size-4" aria-hidden="true" />
              Mortgage
            </TabsTrigger>
            <TabsTrigger
              value="affordability"
              className="min-h-11 gap-2 rounded-full py-2 text-sm font-semibold sm:text-[0.95rem]"
            >
              <Wallet className="size-4" aria-hidden="true" />
              Affordability
            </TabsTrigger>
          </TabsList>

          {/* ================= MORTGAGE TAB ================= */}
          <TabsContent value="mortgage" className="mt-0 focus-visible:outline-none">
            <div className="grid gap-6 lg:grid-cols-5">
              {/* ---- LEFT: calculator ---- */}
              <Reveal className="lg:col-span-3">
                <div className="card-modern p-6">
                  <header className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <Landmark className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-ink">Mortgage calculator</h2>
                      <p className="text-sm text-muted-foreground">Shape the deal, we handle the arithmetic.</p>
                    </div>
                  </header>

                  <div className="mt-6 space-y-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="listing-pick" className="text-sm font-semibold text-ink">
                        Load from a listing
                      </Label>
                      <Select value={selectedListing} onValueChange={onPickListing}>
                        <SelectTrigger
                          id="listing-pick"
                          aria-label="Load price from a listing"
                          className="h-11 w-full rounded-xl"
                        >
                          <SelectValue placeholder="Choose a Delima listing…" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {loading && (
                            <div className="px-3 py-2 text-sm text-muted-foreground">Loading listings…</div>
                          )}
                          {error && (
                            <div className="px-3 py-2 text-sm text-destructive">Could not load listings.</div>
                          )}
                          {!loading &&
                            !error &&
                            properties.map((p: PropertyDTO) => (
                              <SelectItem key={p.id} value={p.id} className="max-w-full">
                                <span className="block max-w-[16rem] truncate sm:max-w-[18rem]">
                                  {p.title} — {formatKes(p.priceKes, { compact: true })}
                                </span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* price: slider + numeric display */}
                    <SliderField
                      id="fin-price"
                      label="Property price"
                      caption={formatKes(price, { compact: true })}
                      value={price}
                      min={2_000_000}
                      max={200_000_000}
                      step={500_000}
                      onChange={setPrice}
                      ariaValueText={`Purchase price ${formatKes(price)}`}
                    />
                    <MoneyInput
                      id="fin-price-exact"
                      label="Property price (KES)"
                      srLabel
                      value={price}
                      onChange={v => setPrice(v)}
                      hint="Purchase price agreed with the seller — type for an exact figure"
                    />

                    <Separator className="bg-line" />

                    <SliderField
                      id="fin-deposit"
                      label="Deposit"
                      caption={`${depositPct}% · ${formatKes(deposit, { compact: true })}`}
                      value={depositPct}
                      min={0}
                      max={50}
                      step={1}
                      onChange={setDepositPct}
                      ariaValueText={`${depositPct} percent deposit, ${formatKes(deposit)}`}
                    />

                    <SliderField
                      id="fin-rate"
                      label="Annual interest"
                      caption={`${ratePct.toFixed(1)}%`}
                      value={ratePct}
                      min={5}
                      max={20}
                      step={0.1}
                      onChange={setRatePct}
                      ariaValueText={`${ratePct.toFixed(1)} percent per annum`}
                    />

                    <SliderField
                      id="fin-term"
                      label="Term"
                      caption={`${termYears} years`}
                      value={termYears}
                      min={5}
                      max={25}
                      step={1}
                      onChange={setTermYears}
                      ariaValueText={`${termYears} years`}
                    />

                    <MoneyInput
                      id="fin-extra"
                      label="Extra monthly payment (optional)"
                      value={extraMonthly}
                      onChange={v => setExtraMonthly(v)}
                      hint="Pay a little more each month to finish the loan early"
                    />
                  </div>

                  <Separator className="my-6 bg-line" />

                  {/* ---- result ---- */}
                  <div aria-live="polite">
                    <p className="eyebrow mb-1">Monthly repayment</p>
                    <p className="font-mono text-4xl font-extrabold tracking-tight text-brand">
                      {formatKes(Math.round(result.monthly))}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {principal > 0
                        ? `Loan ${formatKes(principal, { compact: true })} over ${termYears} yrs at ${ratePct.toFixed(1)}%`
                        : 'No loan — deposit covers the full price'}
                    </p>

                    {/* mini breakdown: principal vs interest */}
                    <dl className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-brand-soft/70 p-3.5">
                        <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand">
                          <Coins className="size-3.5" aria-hidden="true" />
                          Principal
                        </dt>
                        <dd className="mt-1 font-mono text-sm font-bold text-ink sm:text-base">
                          {formatKes(principal, { compact: true })}
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-sun-soft p-3.5">
                        <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-sun-deep">
                          <BadgePercent className="size-3.5" aria-hidden="true" />
                          Interest
                        </dt>
                        <dd className="mt-1 font-mono text-sm font-bold text-ink sm:text-base">
                          {formatKes(Math.round(result.totalInterest), { compact: true })}
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-muted p-3.5">
                        <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                          <Receipt className="size-3.5" aria-hidden="true" />
                          Total
                        </dt>
                        <dd className="mt-1 font-mono text-sm font-bold text-ink sm:text-base">
                          {formatKes(Math.round(result.totalPayable), { compact: true })}
                        </dd>
                      </div>
                    </dl>
                    {extraMonthly > 0 && loanMonths < baselineMonths && (
                      <p className="mt-3 rounded-xl bg-brand-soft/70 px-3.5 py-2.5 text-xs font-semibold text-brand">
                        Extra payments clear the loan {baselineMonths - loanMonths} months earlier (
                        {Math.ceil(loanMonths / 12)} yrs vs {Math.ceil(baselineMonths / 12)} yrs).
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>

              {/* ---- RIGHT: one-off acquisition costs ---- */}
              <Reveal delay={0.08} className="lg:col-span-2">
                <div className="flex h-full flex-col gap-4">
                  <div className="card-modern flex-1 p-6">
                    <header className="flex items-center gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sun-soft text-sun-deep">
                        <Receipt className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-ink">One-off acquisition costs</h2>
                        <p className="text-sm text-muted-foreground">On top of the purchase price.</p>
                      </div>
                    </header>

                    <ul className="mt-5">
                      {costs.rows.map(row => (
                        <li
                          key={row.label}
                          className="flex items-start justify-between gap-3 border-b border-line py-3.5 last:border-b-0"
                        >
                          <div className="flex min-w-0 items-start gap-2.5">
                            <span className="mt-0.5 text-brand">{row.icon}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-ink">{row.label}</p>
                              <p className="text-xs text-muted-foreground">{row.note}</p>
                            </div>
                          </div>
                          <p className="whitespace-nowrap pt-0.5 font-mono text-sm font-bold tabular-nums text-ink">
                            {row.value}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <Separator className="my-4 bg-line" />

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold uppercase tracking-wide text-brand">Typical total</p>
                      <p className="font-mono text-base font-extrabold tabular-nums text-brand">{costs.total}</p>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Computed live from the {formatKes(price, { compact: true })} price above — stamp duty
                      at the urban rate and commission at both ends of the range.
                    </p>
                  </div>

                  <DismissibleNote>
                    <strong className="font-bold">Estimates only</strong> — confirm with your advocate.
                  </DismissibleNote>
                </div>
              </Reveal>
            </div>

            {/* ---- amortization ---- */}
            {principal <= 0 ? (
              <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-sun/50 bg-sun-soft/50 p-10 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-sun text-brand-deep">
                  <Sparkles className="size-6" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-bold text-ink">You own it outright</h3>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  Your deposit covers the full purchase price — no loan, no interest, nothing but
                  the keys. Adjust the deposit slider below 100% of the price to model financing.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 lg:grid-cols-5">
                <Reveal className="lg:col-span-3">
                  <div className="card-modern h-full p-6">
                    <header className="flex items-center gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        <LineChart className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-ink">Loan balance over time</h2>
                        <p className="text-sm text-muted-foreground">
                          Remaining balance month by month — the amber empties as you build equity.
                        </p>
                      </div>
                    </header>
                    <div className="mt-4 h-64 w-full md:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result.schedule} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="delimaBalanceFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                              <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.04} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                          <XAxis
                            dataKey="month"
                            ticks={yearTicks}
                            tickFormatter={(m: number | string) => `Y${Math.round(Number(m) / 12)}`}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                            stroke="var(--line)"
                            tickMargin={6}
                          />
                          <YAxis
                            tickFormatter={axisKes}
                            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                            stroke="var(--line)"
                            width={52}
                          />
                          <Tooltip
                            cursor={{ stroke: 'var(--chart-2)', strokeDasharray: '4 4' }}
                            content={
                              <BrandTip
                                formatValue={v => formatKes(v)}
                                labelFormatter={l => `Month ${String(l)} · Year ${Math.max(1, Math.ceil(Number(l) / 12))}`}
                              />
                            }
                          />
                          <Area
                            type="monotone"
                            dataKey="balance"
                            name="Balance"
                            stroke="var(--chart-2)"
                            strokeWidth={2.5}
                            fill="url(#delimaBalanceFill)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.08} className="lg:col-span-2">
                  <div className="card-modern h-full p-6">
                    <header className="flex items-center gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        <CalendarClock className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-ink">Yearly amortization</h2>
                        <p className="text-sm text-muted-foreground">What each year of the loan actually costs you.</p>
                      </div>
                    </header>
                    <ScrollArea className="delima-scroll mt-4 max-h-80">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold">Year</TableHead>
                            <TableHead className="text-right font-semibold">Principal</TableHead>
                            <TableHead className="text-right font-semibold">Interest</TableHead>
                            <TableHead className="text-right font-semibold">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.years.map(row => (
                            <TableRow key={row.year}>
                              <TableCell className="font-semibold">Year {row.year}</TableCell>
                              <TableCell className="text-right font-mono text-xs tabular-nums">
                                {formatKes(Math.round(row.principal))}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                                {formatKes(Math.round(row.interest))}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs font-bold tabular-nums text-brand">
                                {formatKes(Math.round(row.balance))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </Reveal>
              </div>
            )}
          </TabsContent>

          {/* ================= AFFORDABILITY TAB ================= */}
          <TabsContent value="affordability" className="mt-0 focus-visible:outline-none">
            <div className="grid gap-6 lg:grid-cols-5">
              <Reveal className="lg:col-span-3">
                <div className="card-modern p-6">
                  <header className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <Wallet className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-ink">What can I afford?</h2>
                      <p className="text-sm text-muted-foreground">
                        Built on the one-third income rule Kenyan banks apply.
                      </p>
                    </div>
                  </header>
                  <div className="mt-6 space-y-5">
                    <MoneyInput
                      id="fin-income"
                      label="Monthly net income (KES)"
                      value={income}
                      onChange={setIncome}
                      hint="Take-home pay after tax and deductions"
                    />
                    <MoneyInput
                      id="fin-obligations"
                      label="Monthly obligations (KES)"
                      value={obligations}
                      onChange={setObligations}
                      hint="Existing loans, cards, support you already commit"
                    />
                    <MoneyInput
                      id="fin-deposit-avail"
                      label="Deposit available (KES)"
                      value={depositAvailable}
                      onChange={setDepositAvailable}
                      hint="Savings you can put down on day one"
                    />
                    <Separator className="bg-line" />
                    <SliderField
                      id="fin-afford-rate"
                      label="Expected interest"
                      caption={`${affordRate.toFixed(1)}%`}
                      value={affordRate}
                      min={5}
                      max={20}
                      step={0.1}
                      onChange={setAffordRate}
                      ariaValueText={`${affordRate.toFixed(1)} percent per annum`}
                    />
                    <SliderField
                      id="fin-afford-term"
                      label="Term"
                      caption={`${affordTerm} years`}
                      value={affordTerm}
                      min={5}
                      max={25}
                      step={1}
                      onChange={setAffordTerm}
                      ariaValueText={`${affordTerm} years`}
                    />
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.08} className="lg:col-span-2">
                <div className="soft-shadow flex h-full flex-col rounded-3xl bg-brand p-6 text-white sm:p-8">
                  <p className="eyebrow mb-3 text-sun">Your budget</p>
                  <p
                    aria-live="polite"
                    className="font-mono text-4xl font-extrabold leading-none tracking-tight sm:text-5xl"
                  >
                    {formatKes(Math.round(afford.budget))}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-white/75">
                    With {formatKes(income, { compact: true })} net monthly, lenders cap your
                    repayment near a third of income. After {formatKes(obligations, { compact: true })} of
                    existing obligations you can carry roughly{' '}
                    <span className="font-bold text-sun">
                      {formatKes(Math.round(afford.maxRepayment))}
                    </span>{' '}
                    per month — supporting a loan of{' '}
                    <span className="font-bold text-sun">
                      {formatKes(Math.round(afford.maxLoan), { compact: true })}
                    </span>{' '}
                    plus your {formatKes(depositAvailable, { compact: true })} deposit.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:mt-auto">
                    <Button
                      size="lg"
                      className="btn-sun h-12 min-h-11 rounded-full px-6 font-bold"
                      disabled={!canSearchHomes}
                      onClick={() => setFilterAndGo({ maxPrice: Math.round(afford.budget), minPrice: null }, 'properties')}
                      aria-label={`See matching homes up to ${formatKes(Math.round(afford.budget))}`}
                    >
                      <Search className="size-4" aria-hidden="true" />
                      See matching homes
                    </Button>
                    {!canSearchHomes && (
                      <p className="text-xs text-white/70">
                        Budget under KES 5M — raise income, deposit or term to unlock search.
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatBlock
                icon={Wallet}
                label="Max monthly repayment"
                value={formatKes(Math.round(afford.maxRepayment))}
                className="rounded-3xl"
              />
              <StatBlock
                icon={Landmark}
                label="Indicative loan"
                value={formatKes(Math.round(afford.maxLoan), { compact: true })}
                className="rounded-3xl"
              />
              <StatBlock
                icon={Sparkles}
                label="Your deposit"
                value={formatKes(depositAvailable, { compact: true })}
                className="rounded-3xl"
              />
            </div>

            <DismissibleNote className="mt-6">
              <span className="flex items-start gap-2">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="font-bold">Kenyan lending context:</strong> banks typically lend
                  3.5–5× annual income at 11–15% p.a. (CBK). Mortgages above KES 8M may carry extra
                  risk pricing, and lenders want proof of 6+ months of income. Confirm terms with
                  your bank — this planner is an estimate, not an offer.
                </span>
              </span>
            </DismissibleNote>
          </TabsContent>
        </Tabs>
      </Section>
    </div>
  )
}
