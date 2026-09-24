// Delima Realtors 3.0 — Market Insights
// "Nairobi Price Atlas" — KPI StatBlocks, 12-month price area curve, YoY bars,
// volume bars, insight of the month and the neighborhood heat table.
// All data transforms and navigation logic preserved from 2.0; charts now use
// the frozen --chart-1..5 tokens (light mode only).
'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  Crown,
  Leaf,
  LineChart,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Container, EmptyState, Reveal, StatBlock } from '@/components/delima/ui-kit'
import { useInsights } from '@/hooks/use-delima-data'
import { useAppStore } from '@/lib/store'
import { formatKes, formatMonth, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

const TERRACOTTA = '#b4552d' // warm terracotta for negative YoY (never default red)

/* Shared, light-mode chart chrome */
const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid var(--line)',
  borderRadius: 12,
  boxShadow: '0 12px 30px -12px rgba(12, 59, 46, 0.25)',
  fontSize: 12,
  padding: '8px 12px',
}
const tooltipLabel = { color: 'var(--muted-foreground)', fontWeight: 600, marginBottom: 2 }
const tooltipItem = { color: 'var(--ink)', fontWeight: 700 }
const tickStyle = { fill: 'var(--muted-foreground)', fontSize: 12 }
const axisLine = { stroke: 'var(--line)' }

function AtlasContent({ onRetry }: { onRetry: () => void }) {
  const { insights, loading, error } = useInsights()
  const setFilterAndGo = useAppStore((s) => s.setFilterAndGo)
  const [selected, setSelected] = useState<string>('ALL')

  const nbs = insights?.neighborhoods ?? []

  const kpis = useMemo(() => {
    if (!nbs.length) return null
    const avgYoY = nbs.reduce((a, n) => a + n.latestYoY, 0) / nbs.length
    const mostActive = [...nbs].sort((a, b) => b.totalVolume12m - a.totalVolume12m)[0]
    const premium = [...nbs].sort((a, b) => b.avgPricePerSqm - a.avgPricePerSqm)[0]
    const value = [...nbs].sort((a, b) => a.avgPricePerSqm - b.avgPricePerSqm)[0]
    return { avgYoY, mostActive, premium, value }
  }, [nbs])

  const lineData = useMemo(() => {
    if (!nbs.length) return []
    if (selected !== 'ALL') {
      const nb = nbs.find((n) => n.slug === selected)
      return nb ? nb.series.map((s) => ({ month: formatMonth(s.month), kes: s.pricePerSqm })) : []
    }
    const months = nbs[0]?.series.map((s) => s.month) ?? []
    return months.map((m) => {
      const vals = nbs
        .map((n) => n.series.find((s) => s.month === m)?.pricePerSqm)
        .filter((v): v is number => typeof v === 'number')
      return { month: formatMonth(m), kes: Math.round(vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length)) }
    })
  }, [nbs, selected])

  const yoyData = useMemo(
    () => nbs.map((n) => ({ name: n.name, yoy: n.latestYoY })).sort((a, b) => b.yoy - a.yoy),
    [nbs],
  )

  const barData = useMemo(
    () => nbs.map((n) => ({ name: n.name, volume: n.totalVolume12m })).sort((a, b) => b.volume - a.volume),
    [nbs],
  )

  const tableRows = useMemo(
    () =>
      nbs
        .map((n) => ({ ...n, latestMedian: n.series.at(-1)?.medianPriceKes ?? 0 }))
        .sort((a, b) => b.avgPricePerSqm - a.avgPricePerSqm),
    [nbs],
  )

  const insight = useMemo(() => {
    if (!nbs.length || !kpis) return null
    const strongest = [...nbs].sort((a, b) => b.latestYoY - a.latestYoY)[0]
    const latestMonth = strongest.series.at(-1)?.month ?? ''
    return { strongest, latestMonth }
  }, [nbs, kpis])

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading market data">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="shimmer h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="shimmer h-80 rounded-2xl" />
        <div className="grid gap-6 xl:grid-cols-2">
          <Skeleton className="shimmer h-72 rounded-2xl" />
          <Skeleton className="shimmer h-72 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !insights || !nbs.length) {
    return (
      <EmptyState
        icon={LineChart}
        title="Market data unavailable"
        description={error ?? 'No neighborhood statistics were returned.'}
        action={
          <Button onClick={onRetry} className="rounded-full">
            <RotateCcw className="size-4" aria-hidden="true" /> Try again
          </Button>
        }
        className="mx-auto max-w-lg"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI row */}
      {kpis && (
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatBlock
              icon={TrendingUp}
              value={`${kpis.avgYoY >= 0 ? '+' : ''}${kpis.avgYoY.toFixed(1)}%`}
              label="Avg YoY appreciation — all neighborhoods"
            />
            <StatBlock
              icon={Activity}
              value={kpis.mostActive.name}
              label={`Most active — ${kpis.mostActive.totalVolume12m} transactions in 12 months`}
            />
            <StatBlock
              icon={Crown}
              value={kpis.premium.name}
              label={`Premium address — ${formatKes(kpis.premium.avgPricePerSqm)} / sqm average`}
            />
            <StatBlock
              icon={Leaf}
              value={kpis.value.name}
              label={`Value pick — ${formatKes(kpis.value.avgPricePerSqm)} / sqm average`}
            />
          </div>
        </Reveal>
      )}

      {/* price curve */}
      <Reveal delay={0.05}>
        <section className="card-modern rounded-2xl p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Price curve</p>
              <h3 className="mt-1 text-xl font-bold">KES per sqm — trailing twelve months</h3>
            </div>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger aria-label="Choose neighborhood" className="h-11 w-full rounded-xl sm:w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All neighborhoods (avg)</SelectItem>
                {nbs.map((n) => (
                  <SelectItem key={n.slug} value={n.slug}>{n.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="atlasSunFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={tickStyle} tickLine={false} axisLine={axisLine} />
                <YAxis
                  tick={tickStyle}
                  tickLine={false}
                  axisLine={false}
                  width={58}
                  domain={['auto', 'auto']}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}K`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabel}
                  itemStyle={tooltipItem}
                  formatter={(v) => [formatKes(Number(v)), 'KES / sqm']}
                />
                <Area
                  type="monotone"
                  dataKey="kes"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#atlasSunFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--chart-1)', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </Reveal>

      {/* YoY + volume */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Reveal delay={0.08}>
          <section className="card-modern h-full rounded-2xl p-5">
            <p className="eyebrow">Year-on-year momentum</p>
            <h3 className="mt-1 text-xl font-bold">Latest YoY change per neighborhood</h3>
            <div className="mt-4 h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yoyData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={tickStyle}
                    tickLine={false}
                    axisLine={axisLine}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={64}
                  />
                  <YAxis
                    tick={tickStyle}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <ReferenceLine y={0} stroke="var(--line)" />
                  <Tooltip
                    cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabel}
                    itemStyle={tooltipItem}
                    formatter={(v) => [`${Number(v).toFixed(1)}% YoY`, 'Growth']}
                  />
                  <Bar dataKey="yoy" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {yoyData.map((d) => (
                      <Cell key={d.name} fill={d.yoy >= 0 ? 'var(--chart-1)' : TERRACOTTA} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.12}>
          <section className="card-modern h-full rounded-2xl p-5">
            <p className="eyebrow">Transaction volume</p>
            <h3 className="mt-1 text-xl font-bold">Volume traded per neighborhood — 12 months</h3>
            <div className="mt-4 h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={tickStyle}
                    tickLine={false}
                    axisLine={axisLine}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={64}
                  />
                  <YAxis tick={tickStyle} tickLine={false} axisLine={false} width={48} />
                  <Tooltip
                    cursor={{ fill: 'var(--sun)', opacity: 0.08 }}
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabel}
                    itemStyle={tooltipItem}
                    formatter={(v) => [`${v} transactions`, '12m volume']}
                  />
                  <Bar dataKey="volume" fill="var(--chart-2)" radius={[8, 8, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </Reveal>
      </div>

      {/* insight of the month */}
      {insight && kpis && (
        <Reveal delay={0.05}>
          <section className="card-modern relative overflow-hidden rounded-2xl p-5 sm:p-6">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sun via-sun-deep to-brand" />
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-2xl bg-sun-soft text-sun-deep" aria-hidden="true">
                <Sparkles className="size-4.5" />
              </span>
              <p className="eyebrow">Insight of the month</p>
            </div>
            <p className="mt-4 text-xl font-extrabold leading-snug sm:text-2xl">
              {insight.strongest.name} leads Nairobi appreciation at{' '}
              <span className="text-gradient-brand">
                {insight.strongest.latestYoY >= 0 ? '+' : ''}{insight.strongest.latestYoY.toFixed(1)}% YoY
              </span>
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Median pricing in {insight.strongest.name} reached{' '}
              <span className="font-semibold text-foreground">
                {formatKes(insight.strongest.series.at(-1)?.medianPriceKes ?? 0)}
              </span>{' '}
              in {formatMonth(insight.latestMonth)}. Across the atlas, values averaged{' '}
              <span className="font-semibold text-foreground">
                {kpis.avgYoY >= 0 ? '+' : ''}{kpis.avgYoY.toFixed(1)}%
              </span>{' '}
              year-on-year, while {kpis.value.name} remains the smartest entry point at{' '}
              <span className="font-semibold text-foreground">{formatKes(kpis.value.avgPricePerSqm)}/sqm</span> —
              a {Math.round(((kpis.premium.avgPricePerSqm) / (kpis.value.avgPricePerSqm) - 1) * 100)}%
              gap to the premium {kpis.premium.name} tier.
            </p>
            <Button
              variant="outline"
              onClick={() => setFilterAndGo({ neighborhood: insight.strongest.slug }, 'properties')}
              className="mt-5 h-11 w-fit rounded-full border-line hover:bg-brand-soft hover:text-brand"
            >
              Explore {insight.strongest.name} listings <ArrowUpRight className="size-4" aria-hidden="true" />
            </Button>
          </section>
        </Reveal>
      )}

      {/* heat table */}
      <Reveal delay={0.08}>
        <section className="card-modern rounded-2xl p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="eyebrow">Neighborhood heat table</p>
              <h3 className="mt-1 text-xl font-bold">Latest figures, ranked by KES / sqm</h3>
            </div>
            <p className="text-xs text-muted-foreground">Click a row to browse its listings</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-brand-soft/50 hover:bg-brand-soft/50">
                  <TableHead className="uppercase tracking-wider">Neighborhood</TableHead>
                  <TableHead className="uppercase tracking-wider">Median price</TableHead>
                  <TableHead className="uppercase tracking-wider">KES / sqm</TableHead>
                  <TableHead className="uppercase tracking-wider">YoY</TableHead>
                  <TableHead className="text-right uppercase tracking-wider">12m volume</TableHead>
                  <TableHead className="w-10" aria-hidden="true" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((n, idx) => {
                  const heatAlpha = 0.05 + 0.17 * (1 - idx / Math.max(1, tableRows.length - 1))
                  const pos = n.latestYoY >= 0
                  return (
                    <TableRow
                      key={n.slug}
                      onClick={() => setFilterAndGo({ neighborhood: n.slug }, 'properties')}
                      className="cursor-pointer"
                      aria-label={`View ${n.name} listings`}
                    >
                      <TableCell className="font-semibold">{n.name}</TableCell>
                      <TableCell>{formatKes(n.latestMedian)}</TableCell>
                      <TableCell
                        className="font-medium"
                        style={{ backgroundColor: `rgba(232, 163, 61, ${heatAlpha})` }}
                      >
                        {formatKes(n.avgPricePerSqm)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn('font-bold', pos && 'text-brand')}
                          style={!pos ? { color: TERRACOTTA } : undefined}
                        >
                          {pos ? '+' : ''}{n.latestYoY.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(n.totalVolume12m)}</TableCell>
                      <TableCell aria-hidden="true">
                        <ArrowUpRight className="size-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      </Reveal>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export default function InsightsView() {
  const [attempt, setAttempt] = useState(0)
  return (
    <Container className="py-10 sm:py-16">
      <Reveal>
        <header className="max-w-2xl">
          <p className="eyebrow">Market intelligence</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Nairobi Price Atlas</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Twelve months of data across Delima&apos;s neighborhoods — price curves, traded volume and
            year-on-year momentum, distilled into one view.
          </p>
        </header>
      </Reveal>
      <div className="mt-10">
        <AtlasContent key={attempt} onRetry={() => setAttempt((a) => a + 1)} />
      </div>
    </Container>
  )
}
