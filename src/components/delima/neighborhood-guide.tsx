// Delima Realtors Platform 2.0 — Neighborhood Atlas deep-dive
// Owner: principal-engineer-neighborhood-guide (Task 1E).
// Self-contained, fully responsive tabbed atlas of 9 Nairobi micro-markets:
// hero + highlights + market snapshot (avg/sqm, YoY, 12m sparkline, volume,
// active listings, price range) + recent activity strip + specialist CTA.
//
// NOTE on `MarketStatDTO`: the task spec references `MarketStatDTO`, which is
// not defined in @/lib/types. The equivalent live type is `MarketPoint`
// (month / medianPriceKes / pricePerSqm / volume / yoyChangePct). We alias it
// locally so the public prop signature matches the spec verbatim while staying
// type-safe against the data returned by /api/stats (insights.neighborhoods[].series).
'use client'

import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bath,
  BedDouble,
  Check,
  MapPin,
  Phone,
  Ruler,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SmartImage } from '@/components/delima/mini-cards'
import type { MarketPoint, NeighborhoodDTO, PropertyDTO } from '@/lib/types'
import { formatKes, formatPriceForStatus, formatSqm, statusLabel } from '@/lib/format'
import { cn } from '@/lib/utils'

export type MarketStatDTO = MarketPoint

interface NeighborhoodGuideProps {
  neighborhoods: NeighborhoodDTO[]
  marketStats: Record<string, MarketStatDTO[]>
  properties: PropertyDTO[]
  onExploreProperties: (neighborhoodSlug: string) => void
}

const EASE = [0.22, 1, 0.36, 1] as const

/* ------------------------------------------------------------------ */
/* Sparkline — pure inline SVG, gold stroke, no chart library          */
/* ------------------------------------------------------------------ */

function Sparkline({
  data,
  className,
  width = 280,
  height = 56,
}: {
  data: number[]
  className?: string
  width?: number
  height?: number
}) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          'flex h-14 items-center justify-center rounded-md border border-dashed border-border/60 text-xs text-muted-foreground',
          className,
        )}
      >
        Trend data unavailable
      </div>
    )
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 6
  const usableH = height - pad * 2
  const stepX = data.length > 1 ? width / (data.length - 1) : 0

  const points = data.map((v, i) => {
    const x = data.length > 1 ? i * stepX : width / 2
    const y = pad + (1 - (v - min) / range) * usableH
    return [x, y] as const
  })

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ')

  const areaPath =
    data.length > 1
      ? `${linePath} L${width.toFixed(2)} ${height} L0 ${height} Z`
      : ''

  const last = points[points.length - 1]
  const ariaLabel =
    data.length > 1
      ? `12-month median price trend, ranging from ${formatKes(min, { compact: true })} to ${formatKes(max, { compact: true })}`
      : `Median price at ${formatKes(data[0], { compact: true })}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('h-14 w-full', className)}
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id="delima-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>
      {areaPath && <path className="text-gold" d={areaPath} fill="url(#delima-spark-fill)" />}
      <path
        className="text-gold"
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={last[0]}
        cy={last[1]}
        r={3.5}
        className="fill-gold"
        stroke="hsl(var(--card))"
        strokeWidth={1.5}
      />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* RecentSaleMiniCard                                                  */
/* ------------------------------------------------------------------ */

function RecentSaleMiniCard({ property }: { property: PropertyDTO }) {
  return (
    <article className="luxury-card group flex h-44 overflow-hidden rounded-xl border bg-card">
      <div className="relative w-[42%] shrink-0 overflow-hidden">
        <SmartImage
          src={property.images[0]}
          alt={property.title}
          fallbackLabel={property.neighborhood}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-full bg-espresso/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-soft backdrop-blur-sm">
          {statusLabel[property.status]}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {property.neighborhood}
        </p>
        <h4 className="mt-1 line-clamp-2 font-display text-sm leading-snug">
          {property.title}
        </h4>
        <div className="mt-auto">
          <p className="text-sm font-bold text-gold-deep dark:text-gold">
            {formatPriceForStatus(property.priceKes, property.status)}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1" aria-label={`${property.bedrooms} bedrooms`}>
              <BedDouble className="size-3" aria-hidden="true" /> {property.bedrooms}
            </span>
            <span className="flex items-center gap-1" aria-label={`${property.bathrooms} bathrooms`}>
              <Bath className="size-3" aria-hidden="true" /> {property.bathrooms}
            </span>
            <span className="flex items-center gap-1" aria-label={`${property.sqm} square metres`}>
              <Ruler className="size-3" aria-hidden="true" /> {formatSqm(property.sqm)}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* StatRow                                                             */
/* ------------------------------------------------------------------ */

function StatRow({
  label,
  value,
  sub,
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2.5 last:border-b-0">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {sub && <p className="mt-0.5 text-[11px] text-muted-foreground/80">{sub}</p>}
      </div>
      <div className="text-right font-display text-base text-foreground">{value}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function NeighborhoodGuide({
  neighborhoods,
  marketStats,
  properties,
  onExploreProperties,
}: NeighborhoodGuideProps) {
  const [activeSlug, setActiveSlug] = useState<string>(neighborhoods[0]?.slug ?? '')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const active = useMemo(
    () => neighborhoods.find(n => n.slug === activeSlug) ?? neighborhoods[0] ?? null,
    [neighborhoods, activeSlug],
  )

  const stats = useMemo(() => {
    if (!active) return null
    const series = marketStats[active.slug] ?? []
    const last = series.length > 0 ? series[series.length - 1] : undefined
    const yoy = last?.yoyChangePct
    const totalVolume = series.reduce((sum, s) => sum + (s.volume ?? 0), 0)
    const medianSeries = series.map(s => s.medianPriceKes)

    // "Active listings" = inventory in this neighborhood that is not already SOLD.
    const hoodListings = properties.filter(
      p => p.neighborhoodSlug === active.slug && p.status !== 'SOLD',
    )
    const activeCount = hoodListings.length
    const prices = hoodListings.map(p => p.priceKes)
    const minPrice = prices.length ? Math.min(...prices) : null
    const maxPrice = prices.length ? Math.max(...prices) : null

    // Recent activity = SOLD or FOR_SALE listings, newest first, top 3.
    const recent = properties
      .filter(
        p =>
          p.neighborhoodSlug === active.slug &&
          (p.status === 'SOLD' || p.status === 'FOR_SALE'),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3)

    return { series, yoy, totalVolume, medianSeries, activeCount, minPrice, maxPrice, recent }
  }, [active, marketStats, properties])

  function focusTab(idx: number) {
    if (neighborhoods.length === 0) return
    const next = ((idx % neighborhoods.length) + neighborhoods.length) % neighborhoods.length
    const el = tabRefs.current[next]
    if (el) {
      el.focus()
      setActiveSlug(neighborhoods[next].slug)
    }
  }

  function onTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, idx: number) {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        focusTab(idx + 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        focusTab(idx - 1)
        break
      case 'Home':
        e.preventDefault()
        focusTab(0)
        break
      case 'End':
        e.preventDefault()
        focusTab(neighborhoods.length - 1)
        break
      default:
        break
    }
  }

  if (!active || !stats) {
    // No neighborhoods to render — let the parent decide whether to show the section at all.
    return null
  }

  const yoyPos = (stats.yoy ?? 0) >= 0
  const priceRangeLabel =
    stats.minPrice !== null && stats.maxPrice !== null
      ? stats.minPrice === stats.maxPrice
        ? formatKes(stats.minPrice, { compact: true })
        : `${formatKes(stats.minPrice, { compact: true })} – ${formatKes(stats.maxPrice, { compact: true })}`
      : '—'

  return (
    <section
      aria-labelledby="neighborhood-guide-heading"
      className="bg-sand/40 py-16 dark:bg-sand/20 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: EASE }}
          className="max-w-2xl"
        >
          <p className="eyebrow">Neighborhood Atlas</p>
          <h2
            id="neighborhood-guide-heading"
            className="gold-underline mt-3 font-display text-3xl md:text-4xl"
          >
            Live Where Nairobi Lives Well
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Delima tracks nine of Nairobi&apos;s most sought-after micro-markets — from the
            jacaranda lanes of Karen to the ridges of Runda — with twelve months of price-per-square-metre
            data for each. Dive into a neighborhood below to see year-on-year momentum, traded volume,
            active inventory and the latest signatures to change hands. Every figure is refreshed
            monthly from our own transaction desk, never from portal estimates, so the picture you see
            is the picture our agents are pricing to today.
          </p>
        </motion.header>

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
          className="mt-8"
        >
          <div
            role="tablist"
            aria-label="Neighborhood selector"
            aria-orientation="horizontal"
            className="delima-scroll -mx-4 flex snap-x snap-mandatory gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
          >
            {neighborhoods.map((n, idx) => {
              const selected = n.slug === active.slug
              return (
                <button
                  key={n.slug}
                  ref={el => {
                    tabRefs.current[idx] = el
                  }}
                  role="tab"
                  type="button"
                  id={`ng-tab-${n.slug}`}
                  aria-selected={selected}
                  aria-controls={`ng-panel-${n.slug}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveSlug(n.slug)}
                  onKeyDown={e => onTabKeyDown(e, idx)}
                  className={cn(
                    'shrink-0 snap-start whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                    selected
                      ? 'border-gold text-gold-deep dark:text-gold'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {n.name}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Active panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.slug}
            role="tabpanel"
            id={`ng-panel-${active.slug}`}
            aria-labelledby={`ng-tab-${active.slug}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mt-8 grid gap-6 lg:grid-cols-2"
          >
            {/* Left column — hero + description + highlights + browse CTA */}
            <div className="flex flex-col overflow-hidden rounded-2xl border bg-card luxury-shadow">
              <div className="relative h-56 sm:h-64 md:h-72">
                <SmartImage
                  src={active.image}
                  alt={`A signature view of ${active.name}, Nairobi`}
                  fallbackLabel={active.name}
                  className="absolute inset-0 h-full w-full"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/15 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft">
                    <MapPin className="size-3.5" aria-hidden="true" /> Nairobi, Kenya
                  </p>
                  <h3 className="mt-1.5 font-display text-3xl text-[#f0e9dc] sm:text-4xl">
                    {active.name}
                  </h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">{active.description}</p>

                {active.highlights.length > 0 && (
                  <ul className="mt-5 space-y-2.5" aria-label={`${active.name} highlights`}>
                    {active.highlights.map((h, i) => (
                      <li key={`${i}-${h.slice(0, 24)}`} className="flex items-start gap-2.5 text-sm">
                        <span
                          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-deep dark:text-gold"
                          aria-hidden="true"
                        >
                          <Check className="size-3.5" />
                        </span>
                        <span className="leading-relaxed text-foreground/90">{h}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto pt-6">
                  <Button
                    type="button"
                    onClick={() => onExploreProperties(active.slug)}
                    className="gold-gradient-bg h-12 min-h-[44px] w-full px-6 font-semibold text-[#1f1810] hover:opacity-90 sm:w-auto"
                  >
                    Browse {stats.activeCount}{' '}
                    {stats.activeCount === 1 ? 'home' : 'homes'} in {active.name}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right column — stats card */}
            <Card className="luxury-card luxury-shadow border-border/70">
              <CardContent className="flex h-full flex-col p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow">Market Snapshot</p>
                    <h3 className="mt-1 font-display text-xl">{active.name} at a glance</h3>
                  </div>
                  <span
                    className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-deep dark:text-gold sm:flex"
                    aria-hidden="true"
                  >
                    <TrendingUp className="size-5" />
                  </span>
                </div>

                {/* Big numbers */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/60 bg-sand/40 p-3.5 dark:bg-accent/30">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Avg / sqm
                    </p>
                    <p className="mt-1 font-display text-2xl leading-tight text-foreground">
                      {formatKes(active.avgPricePerSqm, { compact: true })}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/80">trailing 12m</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-sand/40 p-3.5 dark:bg-accent/30">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Latest YoY
                    </p>
                    <p
                      className={cn(
                        'mt-1 flex items-center gap-1 font-display text-2xl leading-tight',
                        stats.yoy === undefined
                          ? 'text-muted-foreground'
                          : yoyPos
                            ? 'text-emerald-600 dark:text-emerald-500'
                            : 'text-rose-600 dark:text-rose-500',
                      )}
                    >
                      {stats.yoy === undefined ? (
                        <span>—</span>
                      ) : (
                        <>
                          {yoyPos ? (
                            <ArrowUpRight className="size-5" aria-hidden="true" />
                          ) : (
                            <ArrowDownRight className="size-5" aria-hidden="true" />
                          )}
                          {yoyPos ? '+' : ''}
                          {stats.yoy.toFixed(1)}%
                        </>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/80">year-on-year</p>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      12-month median price
                    </p>
                    <p className="text-[11px] text-muted-foreground/80">
                      {stats.series.length} {stats.series.length === 1 ? 'month' : 'months'}
                    </p>
                  </div>
                  <Sparkline data={stats.medianSeries} />
                </div>

                {/* Stat rows */}
                <div className="mt-3">
                  <StatRow
                    label="Trailing 12m volume"
                    value={`${stats.totalVolume} ${stats.totalVolume === 1 ? 'sale' : 'sales'}`}
                  />
                  <StatRow
                    label="Active listings"
                    value={stats.activeCount > 0 ? stats.activeCount : '—'}
                  />
                  <StatRow label="Price range" value={priceRangeLabel} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Recent activity strip */}
        {stats.recent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: EASE }}
            className="mt-10"
          >
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Recent activity</p>
                <h3 className="mt-1 font-display text-xl">Latest in {active.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => onExploreProperties(active.slug)}
                className="text-sm font-medium text-gold-deep underline-offset-4 hover:underline dark:text-gold"
              >
                See all
              </button>
            </div>
            <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
              {stats.recent.map(p => (
                <RecentSaleMiniCard key={p.slug} property={p} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer CTA — talk to a specialist */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: EASE }}
          className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-gold/30 bg-card p-6 luxury-shadow sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div>
            <p className="eyebrow">Speak with a local expert</p>
            <h3 className="mt-2 font-display text-2xl">
              Talk to a {active.name} specialist
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Our {active.name} desk has walked these streets for years — they know the titles,
              the quiet listings and the fair price for every line on this page. Start the
              conversation today.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => onExploreProperties(active.slug)}
            className="gold-gradient-bg h-12 min-h-[48px] shrink-0 px-7 font-semibold text-[#1f1810] hover:opacity-90"
          >
            <Phone className="size-4" aria-hidden="true" /> Browse {active.name} homes
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
