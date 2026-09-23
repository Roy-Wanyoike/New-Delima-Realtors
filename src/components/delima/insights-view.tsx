// Delima Realtors Platform 2.0 — Market Insights (issue #57)
// "Nairobi Price Atlas" — KPIs, 12-month price curve, volume bars, heat table.
'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Crown,
  Leaf,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useInsights } from '@/hooks/use-delima-data'
import { useAppStore } from '@/lib/store'
import { formatKes, formatMonth, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

/* theme-aware chart palette (no blue/indigo anywhere) */
function useIsDark(): boolean {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const el = document.documentElement
    const update = () => setDark(el.classList.contains('dark'))
    update()
    const obs = new MutationObserver(update)
    obs.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

const CLAY_NEGATIVE = '#b4552d' // warm terracotta for negative YoY (never default red)

function KpiCard({
  icon: Icon, label, value, sub,
}: {
  icon: LucideIcon
  label: string
  value: string
  sub: string
}) {
  return (
    <Card className="luxury-card border-border/70">
      <CardContent className="p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-gold/15 text-gold-deep dark:text-gold" aria-hidden="true">
            <Icon className="size-4.5" />
          </span>
          <p className="eyebrow">{label}</p>
        </div>
        <p className="mt-3 font-display text-2xl leading-tight md:text-[1.7rem]">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}

const tooltipStyle = {
  backgroundColor: '#1f1810',
  border: '1px solid #d4af37',
  borderRadius: 10,
  boxShadow: '0 18px 45px -18px rgba(31,24,16,0.45)',
  fontSize: 12,
  padding: '8px 12px',
}
const tooltipLabel = { color: '#e9d8a6', fontWeight: 700, marginBottom: 2 }
const tooltipItem = { color: '#faf7f1' }

function AtlasContent({ onRetry }: { onRetry: () => void }) {
  const { insights, loading, error } = useInsights()
  const setFilterAndGo = useAppStore((s) => s.setFilterAndGo)
  const dark = useIsDark()
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

  const gold = dark ? '#d4af37' : '#c9a227'
  const grid = dark ? '#3a2f1e' : '#e5dcc8'
  const tick = dark ? '#b3a58a' : '#6f6350'

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
        <div className="grid gap-6 xl:grid-cols-2">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !insights || !nbs.length) {
    return (
      <Card className="mx-auto max-w-lg border-gold/30 luxury-shadow">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-gold/15 text-gold-deep dark:text-gold">
            <AlertTriangle className="size-7" />
          </span>
          <div>
            <h3 className="font-display text-xl">Market data unavailable</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error ?? 'No neighborhood statistics were returned.'}</p>
          </div>
          <Button onClick={onRetry} className="h-11 min-w-[140px] gold-gradient-bg border-0 text-espresso hover:opacity-90">
            <RotateCcw className="size-4" /> Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* KPI row */}
      {kpis && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={TrendingUp}
            label="Avg YoY appreciation"
            value={`${kpis.avgYoY >= 0 ? '+' : ''}${kpis.avgYoY.toFixed(1)}%`}
            sub="mean latest YoY across all neighborhoods"
          />
          <KpiCard
            icon={Activity}
            label="Most active"
            value={kpis.mostActive.name}
            sub={`${kpis.mostActive.totalVolume12m} transactions in 12 months`}
          />
          <KpiCard
            icon={Crown}
            label="Premium address"
            value={kpis.premium.name}
            sub={`${formatKes(kpis.premium.avgPricePerSqm)} per sqm average`}
          />
          <KpiCard
            icon={Leaf}
            label="Value pick"
            value={kpis.value.name}
            sub={`${formatKes(kpis.value.avgPricePerSqm)} per sqm average`}
          />
        </div>
      )}

      {/* price curve */}
      <Card className="border-border/70 luxury-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Price curve</p>
              <h3 className="mt-1 font-display text-xl">KES per sqm — trailing twelve months</h3>
            </div>
            <Tabs value={selected} onValueChange={setSelected}>
              <TabsList className="delima-scroll h-auto w-full max-w-full justify-start overflow-x-auto sm:w-auto">
                <TabsTrigger value="ALL" className="shrink-0">All (avg)</TabsTrigger>
                {nbs.map((n) => (
                  <TabsTrigger key={n.slug} value={n.slug} className="shrink-0">{n.name}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={grid} strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: tick, fontSize: 11 }} tickLine={false} axisLine={{ stroke: grid }} />
                <YAxis
                  tick={{ fill: tick, fontSize: 11 }}
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
                <Line
                  type="monotone"
                  dataKey="kes"
                  stroke={gold}
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: gold, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: gold, stroke: '#1f1810', strokeWidth: 1.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* volume bars */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/70 luxury-shadow">
          <CardContent className="p-4 md:p-6">
            <p className="eyebrow">Transaction volume</p>
            <h3 className="mt-1 font-display text-xl">Volume traded per neighborhood — 12 months</h3>
            <div className="mt-4 h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke={grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: tick, fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: grid }}
                    interval={0}
                    angle={-28}
                    textAnchor="end"
                    height={58}
                  />
                  <YAxis
                    tick={{ fill: tick, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tickFormatter={(v: number) => `${v}`}
                  />
                  <Tooltip
                    cursor={{ fill: gold, opacity: 0.08 }}
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabel}
                    itemStyle={tooltipItem}
                    formatter={(v) => [`${v} transactions`, '12m volume']}
                  />
                  <Bar dataKey="volume" fill={gold} radius={[6, 6, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* insight of the month */}
        {insight && (
          <Card className="relative overflow-hidden border-gold/40 luxury-shadow">
            <div aria-hidden="true" className="gold-gradient-bg absolute inset-x-0 top-0 h-1" />
            <CardContent className="flex h-full flex-col p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-full bg-gold/15 text-gold-deep dark:text-gold" aria-hidden="true">
                  <Sparkles className="size-4.5" />
                </span>
                <p className="eyebrow">Insight of the month</p>
              </div>
              <p className="mt-4 font-display text-2xl leading-snug">
                {insight.strongest.name} leads Nairobi appreciation at{' '}
                <span className="gold-gradient-text font-bold">
                  {insight.strongest.latestYoY >= 0 ? '+' : ''}{insight.strongest.latestYoY.toFixed(1)}% YoY
                </span>
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                Median pricing in {insight.strongest.name} reached{' '}
                <span className="font-semibold text-foreground">
                  {formatKes(insight.strongest.series.at(-1)?.medianPriceKes ?? 0)}
                </span>{' '}
                in {formatMonth(insight.latestMonth)}. Across the atlas, values averaged{' '}
                <span className="font-semibold text-foreground">
                  {kpis && `${kpis.avgYoY >= 0 ? '+' : ''}${kpis.avgYoY.toFixed(1)}%`}
                </span>{' '}
                year-on-year, while {kpis?.value.name} remains the smartest entry point at{' '}
                <span className="font-semibold text-foreground">{formatKes(kpis?.value.avgPricePerSqm ?? 0)}/sqm</span> —
                a {Math.round(((kpis?.premium.avgPricePerSqm ?? 0) / (kpis?.value.avgPricePerSqm ?? 1) - 1) * 100)}%
                gap to the premium {kpis?.premium.name} tier.
              </p>
              <Button
                variant="outline"
                onClick={() => setFilterAndGo({ neighborhood: insight.strongest.slug }, 'properties')}
                className="mt-5 h-11 w-fit border-gold/40 hover:bg-gold/10 hover:text-gold-deep dark:hover:text-gold"
              >
                Explore {insight.strongest.name} listings <ArrowUpRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* heat table */}
      <Card className="border-border/70 luxury-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="eyebrow">Neighborhood heat table</p>
              <h3 className="mt-1 font-display text-xl">Latest figures, ranked by KES / sqm</h3>
            </div>
            <p className="text-xs text-muted-foreground">Click a row to browse its listings</p>
          </div>
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="bg-sand/70 hover:bg-sand/70 dark:bg-accent/40 dark:hover:bg-accent/40">
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
                        style={{ backgroundColor: dark ? `rgba(212,175,55,${heatAlpha})` : `rgba(201,162,39,${heatAlpha})` }}
                      >
                        {formatKes(n.avgPricePerSqm)}
                      </TableCell>
                      <TableCell>
                        <span className={cn('font-bold', pos ? 'text-gold-deep dark:text-gold' : '')} style={!pos ? { color: CLAY_NEGATIVE } : undefined}>
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
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export default function InsightsView() {
  const [attempt, setAttempt] = useState(0)
  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="eyebrow">Market Intelligence</p>
        <h2 className="gold-underline mt-2 font-display text-3xl md:text-4xl">Nairobi Price Atlas</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Twelve months of data across Delima&apos;s neighborhoods — price curves, traded volume and
          year-on-year momentum, distilled into one view.
        </p>
      </header>
      <AtlasContent key={attempt} onRetry={() => setAttempt((a) => a + 1)} />
    </div>
  )
}
