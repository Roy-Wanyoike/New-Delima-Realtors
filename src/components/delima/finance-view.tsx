// Delima Realtors Platform 2.0 — "The Finance Desk" (Task 5-d)
// Mortgage calculator + affordability planner, Kenyan-rate aware.
'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
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
  Info,
  Landmark,
  LineChart,
  Receipt,
  Search,
  Sparkles,
  Wallet,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  color?: string
}

/** Espresso/cream chart tooltip — shared by all Delima charts. */
function EspressoTip({
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
    <div className="rounded-md border border-gold/40 bg-espresso px-3 py-2 text-cream shadow-lg dark:border-gold/30 dark:text-foreground">
      {label !== undefined && labelFormatter && (
        <p className="mb-1 text-[11px] font-semibold tracking-wide text-gold-soft">
          {labelFormatter(label)}
        </p>
      )}
      <div className="space-y-0.5">
        {payload.map((item, i) => (
          <p key={i} className="text-xs font-medium">
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
}

/** Numeric input that shows full formatKes formatting on blur, raw digits on focus. */
function MoneyInput({ id, label, value, onChange, hint }: MoneyInputProps) {
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
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        className="h-11 border-border bg-card font-medium tabular-nums"
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
        <Label htmlFor={id} className="text-sm font-semibold">
          {label}
        </Label>
        <span className="text-sm font-semibold text-gold-deep tabular-nums dark:text-gold">{caption}</span>
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

  const onPickListing = (id: string) => {
    setSelectedListing(id)
    const p = properties.find(x => x.id === id)
    if (p && p.status !== 'FOR_RENT') setPrice(p.priceKes)
    else if (p) setPrice(p.priceKes) // rentals priced monthly — still loads for reference
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      {/* ---------------- header ---------------- */}
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 max-w-2xl"
      >
        <p className="eyebrow mb-3">Finance</p>
        <h2 className="gold-underline font-display text-3xl leading-tight sm:text-4xl md:text-5xl">
          Own it with <span className="gold-gradient-text">clarity</span>
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
          Run the numbers before you fall in love with the view. Kenyan rates, honest math,
          zero surprises — from deposit to final payment.
        </p>
      </motion.header>

      <Tabs defaultValue="mortgage" className="w-full">
        <TabsList className="mb-8 grid h-auto w-full max-w-md grid-cols-2 gap-1 p-1.5">
          <TabsTrigger
            value="mortgage"
            className="min-h-11 gap-2 py-2 text-sm font-semibold sm:text-[0.95rem]"
          >
            <Calculator className="size-4" aria-hidden="true" /> Mortgage
          </TabsTrigger>
          <TabsTrigger
            value="affordability"
            className="min-h-11 gap-2 py-2 text-sm font-semibold sm:text-[0.95rem]"
          >
            <Wallet className="size-4" /> Affordability
          </TabsTrigger>
        </TabsList>

        {/* ================= MORTGAGE TAB ================= */}
        <TabsContent value="mortgage" className="mt-0 focus-visible:outline-none">
          <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
            {/* inputs */}
            <Card className="luxury-card h-fit border-border/80">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 font-display text-xl">
                  <Landmark className="size-5 text-gold-deep dark:text-gold" aria-hidden="true" />
                  Mortgage calculator
                </CardTitle>
                <CardDescription>Shape the deal, we handle the arithmetic.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="listing-pick">Load from a listing</Label>
                  <Select value={selectedListing} onValueChange={onPickListing}>
                    <SelectTrigger id="listing-pick" aria-label="Load price from a listing" className="h-11 w-full">
                      <SelectValue placeholder="Choose a Delima listing…" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {loading && <div className="px-3 py-2 text-sm text-muted-foreground">Loading listings…</div>}
                      {error && <div className="px-3 py-2 text-sm text-destructive">Could not load listings.</div>}
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

                <MoneyInput
                  id="fin-price"
                  label="Property price (KES)"
                  value={price}
                  onChange={v => setPrice(v)}
                  hint="Purchase price agreed with the seller"
                />

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
              </CardContent>
            </Card>

            {/* results */}
            <div className="min-w-0 space-y-6">
              {/* derived cards */}
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <Card className="luxury-shadow border-espresso/10 bg-espresso text-cream dark:border-gold/25 dark:bg-espresso-soft dark:text-foreground">
                  <CardContent className="p-4 md:p-5">
                    <p className="eyebrow mb-2 dark:text-gold-soft">Monthly repayment</p>
                    <p className="font-display text-2xl leading-tight gold-gradient-text tabular-nums sm:text-3xl xl:text-[1.7rem]">
                      {formatKes(Math.round(result.monthly))}
                    </p>
                    <p className="mt-2 text-[11px] leading-snug text-cream/70 dark:text-foreground/70">
                      {principal > 0
                        ? `Loan ${formatKes(principal, { compact: true })} over ${termYears} yrs`
                        : 'No loan'}
                    </p>
                  </CardContent>
                </Card>

                <StatCard
                  icon={<BadgePercent className="size-4" aria-hidden="true" />}
                  label="Total interest"
                  value={formatKes(Math.round(result.totalInterest), { compact: true })}
                  sub={`across ${loanMonths > 0 ? Math.ceil(loanMonths / 12) : 0} yrs`}
                />
                <StatCard
                  icon={<Receipt className="size-4" aria-hidden="true" />}
                  label="Total payable"
                  value={formatKes(Math.round(result.totalPayable), { compact: true })}
                  sub="principal + interest"
                />
                <StatCard
                  icon={<Building2 className="size-4" aria-hidden="true" />}
                  label="Loan-to-value"
                  value={`${Math.round(result.ltvPct)}%`}
                  sub={`deposit ${formatKes(deposit, { compact: true })}`}
                />
              </div>

              {/* amortization */}
              {principal <= 0 ? (
                <Card className="border-dashed border-gold/40 bg-sand/40 dark:bg-espresso-soft/60">
                  <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full gold-gradient-bg text-espresso">
                      <Sparkles className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-xl">You own it outright</h3>
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                      Your deposit covers the full purchase price — no loan, no interest,
                      nothing but the keys. Adjust the deposit slider below 100% to model financing.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="border-border/80">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 font-display text-lg">
                        <LineChart className="size-5 text-gold-deep dark:text-gold" aria-hidden="true" />
                        Loan balance over time
                      </CardTitle>
                      <CardDescription>
                        {extraMonthly > 0 && loanMonths < baselineMonths
                          ? `Extra payments clear the loan ${baselineMonths - loanMonths} months earlier (${Math.ceil(loanMonths / 12)} yrs vs ${Math.ceil(baselineMonths / 12)} yrs).`
                          : 'Remaining balance month by month — the gold empties as you build equity.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 w-full md:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={result.schedule} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="delimaBalanceFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.55} />
                                <stop offset="100%" stopColor="var(--gold)" stopOpacity={0.04} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis
                              dataKey="month"
                              ticks={yearTicks}
                              tickFormatter={(m: number | string) => `Y${Math.round(Number(m) / 12)}`}
                              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                              stroke="var(--border)"
                              tickMargin={6}
                            />
                            <YAxis
                              tickFormatter={axisKes}
                              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                              stroke="var(--border)"
                              width={52}
                            />
                            <Tooltip
                              cursor={{ stroke: 'var(--gold)', strokeDasharray: '4 4' }}
                              content={
                                <EspressoTip
                                  formatValue={v => formatKes(v)}
                                  labelFormatter={l => `Month ${String(l)} · Year ${Math.max(1, Math.ceil(Number(l) / 12))}`}
                                />
                              }
                            />
                            <Area
                              type="monotone"
                              dataKey="balance"
                              name="Balance"
                              stroke="var(--gold)"
                              strokeWidth={2.5}
                              fill="url(#delimaBalanceFill)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/80">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 font-display text-lg">
                        <CalendarClock className="size-5 text-gold-deep dark:text-gold" aria-hidden="true" />
                        Yearly amortization
                      </CardTitle>
                      <CardDescription>What each year of the loan actually costs you.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="max-h-96 delima-scroll">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="font-semibold">Year</TableHead>
                              <TableHead className="text-right font-semibold">Principal paid</TableHead>
                              <TableHead className="text-right font-semibold">Interest paid</TableHead>
                              <TableHead className="text-right font-semibold">Balance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.years.map(row => (
                              <TableRow key={row.year}>
                                <TableCell className="font-medium">Year {row.year}</TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {formatKes(Math.round(row.principal))}
                                </TableCell>
                                <TableCell className="text-right tabular-nums text-muted-foreground">
                                  {formatKes(Math.round(row.interest))}
                                </TableCell>
                                <TableCell className="text-right font-semibold tabular-nums text-gold-deep dark:text-gold">
                                  {formatKes(Math.round(row.balance))}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ================= AFFORDABILITY TAB ================= */}
        <TabsContent value="affordability" className="mt-0 focus-visible:outline-none">
          <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
            <Card className="luxury-card h-fit border-border/80">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 font-display text-xl">
                  <Wallet className="size-5 text-gold-deep dark:text-gold" aria-hidden="true" />
                  What can I afford?
                </CardTitle>
                <CardDescription>Built on the one-third income rule Kenyan banks apply.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
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
              </CardContent>
            </Card>

            <div className="min-w-0 space-y-6">
              <Card className="luxury-shadow border-espresso/10 bg-espresso text-cream dark:border-gold/25 dark:bg-espresso-soft dark:text-foreground">
                <CardContent className="p-6 md:p-8">
                  <p className="eyebrow mb-3 dark:text-gold-soft">Your budget</p>
                  <p className="font-display text-4xl leading-none gold-gradient-text tabular-nums sm:text-5xl md:text-6xl">
                    {formatKes(Math.round(afford.budget))}
                  </p>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/80 dark:text-foreground/80">
                    With {formatKes(income, { compact: true })} net monthly, lenders cap your
                    repayment near a third of income. After {formatKes(obligations, { compact: true })} of
                    existing obligations you can carry roughly{' '}
                    <span className="font-semibold text-gold-soft">
                      {formatKes(Math.round(afford.maxRepayment))}
                    </span>{' '}
                    per month — supporting a loan of{' '}
                    <span className="font-semibold text-gold-soft">
                      {formatKes(Math.round(afford.maxLoan), { compact: true })}
                    </span>{' '}
                    plus your {formatKes(depositAvailable, { compact: true })} deposit.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      size="lg"
                      className="h-11 min-h-11 gold-gradient-bg px-6 font-semibold text-espresso shadow-md hover:opacity-90"
                      disabled={!canSearchHomes}
                      onClick={() => setFilterAndGo({ maxPrice: Math.round(afford.budget), minPrice: null }, 'properties')}
                      aria-label={`See matching homes up to ${formatKes(Math.round(afford.budget))}`}
                    >
                      <Search className="size-4" aria-hidden="true" />
                      See matching homes
                    </Button>
                    {!canSearchHomes && (
                      <p className="text-xs text-cream/70 dark:text-foreground/70">
                        Budget under KES 5M — raise income, deposit or term to unlock search.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  icon={<Wallet className="size-4" aria-hidden="true" />}
                  label="Max monthly repayment"
                  value={formatKes(Math.round(afford.maxRepayment))}
                  sub="⅓ of income − obligations"
                />
                <StatCard
                  icon={<Landmark className="size-4" aria-hidden="true" />}
                  label="Indicative loan"
                  value={formatKes(Math.round(afford.maxLoan), { compact: true })}
                  sub={`${affordRate.toFixed(1)}% over ${affordTerm} yrs`}
                />
                <StatCard
                  icon={<Sparkles className="size-4" aria-hidden="true" />}
                  label="Your deposit"
                  value={formatKes(depositAvailable, { compact: true })}
                  sub="added on top of the loan"
                />
              </div>

              <Card className="border-gold/30 bg-sand/50 dark:border-gold/25 dark:bg-espresso-soft/60">
                <CardContent className="flex items-start gap-3 p-5">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-deep dark:text-gold">
                    <Info className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Kenyan lending context</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Kenyan banks typically lend 3.5–5× annual income at 11–15% p.a. (CBK).
                      Mortgage loans above KES 8M may also carry additional risk pricing, and
                      lenders will want proof of 6+ months of income. Always confirm terms with
                      your bank — this planner is an estimate, not an offer.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ---------------------------- sub-cards ---------------------------- */

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode
  label: string
  value: string
  sub: string
}) {
  return (
    <Card className="luxury-card border-border/80">
      <CardContent className="p-4 md:p-5">
        <div className="mb-2 flex items-center gap-2 text-gold-deep dark:text-gold">
          {icon}
          <p className="eyebrow">{label}</p>
        </div>
        <p className="font-display text-xl tabular-nums sm:text-2xl">{value}</p>
        <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}
