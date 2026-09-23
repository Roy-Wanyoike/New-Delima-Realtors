// Delima Realtors Platform 2.0 — Map Search (issue #54)
// Bespoke SVG map of Nairobi — fully self-drawn, no external tiles or services.
'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { AlertTriangle, Home, Maximize, Minus, Plus, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { filterProperties, useInsights, useProperties } from '@/hooks/use-delima-data'
import { useAppStore } from '@/lib/store'
import { formatKes, formatPriceForStatus, statusLabel, typeLabel } from '@/lib/format'
import {
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  type NeighborhoodDTO,
  type PropertyDTO,
  type PropertyStatus,
  type PropertyType,
} from '@/lib/types'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Geometry — viewBox covers lat [-1.36, -1.22], lng [36.69, 36.85]    */
/* ------------------------------------------------------------------ */

const W = 800
const H = 700
const LAT_MIN = -1.36
const LAT_MAX = -1.22
const LNG_MIN = 36.69
const LNG_MAX = 36.85
const K_MAX = 6
const CLUSTER_K = 1.5 // k > 1.5 → individual pins with price labels
const ZOOM_IN_TARGET = 2.6

const px = (lng: number) => ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W
const py = (lat: number) => ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

interface Transform { x: number; y: number; k: number }
const IDENTITY: Transform = { x: 0, y: 0, k: 1 }
const clampT = (t: Transform): Transform => {
  const k = clamp(t.k, 1, K_MAX)
  return { x: clamp(t.x, W * (1 - k), 0), y: clamp(t.y, H * (1 - k), 0), k }
}

/* ------------------------------------------------------------------ */
/* Static map features (stylised, geo coordinates)                     */
/* ------------------------------------------------------------------ */

const PARKS: Array<{ name: string; poly: [number, number][] }> = [
  { name: 'Karura Forest', poly: [[-1.23, 36.84], [-1.23, 36.852], [-1.27, 36.852], [-1.275, 36.838], [-1.252, 36.832]] },
  { name: 'Nairobi National Park', poly: [[-1.325, 36.75], [-1.325, 36.85], [-1.36, 36.85], [-1.36, 36.76]] },
  { name: 'Ngong Forest', poly: [[-1.34, 36.69], [-1.34, 36.72], [-1.36, 36.72], [-1.36, 36.69]] },
  { name: 'Arboretum', poly: [[-1.288, 36.8], [-1.288, 36.812], [-1.296, 36.812], [-1.296, 36.8]] },
]

const RIVER: [number, number][] = [
  [-1.27, 36.69], [-1.275, 36.72], [-1.283, 36.76], [-1.29, 36.8], [-1.296, 36.83], [-1.305, 36.85],
]

const ROADS = [
  'M 636 332 C 620 400 640 500 690 700',
  'M 636 332 C 560 420 440 520 260 660',
  'M 630 340 C 580 460 480 560 380 690',
  'M 636 332 C 560 280 460 240 300 200 S 120 180 0 170',
  'M 660 300 C 700 220 740 140 770 40',
  'M 620 300 C 600 220 590 120 600 10',
  'M 300 200 C 380 170 480 140 640 90',
  'M 260 660 C 300 560 340 480 420 420 S 560 370 700 380',
]

const ROAD_LABELS: Array<{ text: string; x: number; y: number }> = [
  { text: 'Uhuru Hwy', x: 655, y: 512 },
  { text: 'Ngong Rd', x: 352, y: 592 },
  { text: 'Waiyaki Way', x: 208, y: 178 },
  { text: 'Thika Hwy', x: 738, y: 92 },
  { text: 'Langata Rd', x: 470, y: 590 },
]

const MAX_PRICE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Any price', value: 'ANY' },
  { label: 'KES 25M', value: '25000000' },
  { label: 'KES 50M', value: '50000000' },
  { label: 'KES 75M', value: '75000000' },
  { label: 'KES 100M', value: '100000000' },
  { label: 'KES 150M', value: '150000000' },
  { label: 'KES 200M', value: '200000000' },
]

const PRICE_BANDS: Array<{ label: string; opacity: number }> = [
  { label: 'Value', opacity: 0.1 },
  { label: 'Mid', opacity: 0.18 },
  { label: 'Prime', opacity: 0.26 },
  { label: 'Trophy', opacity: 0.34 },
]

/* ------------------------------------------------------------------ */
/* Small shared bits                                                   */
/* ------------------------------------------------------------------ */

function Thumb({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div className={cn('gold-gradient-bg flex shrink-0 items-center justify-center text-espresso', className)} aria-hidden="true">
        <Home className="size-4" />
      </div>
    )
  }
  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)} className={cn('shrink-0 object-cover', className)} />
  )
}

/* ------------------------------------------------------------------ */
/* Map pins                                                            */
/* ------------------------------------------------------------------ */

function PropertyPin({
  p, x, y, hovered, showLabel, onSelect, onHover,
}: {
  p: PropertyDTO
  x: number
  y: number
  hovered: boolean
  showLabel: boolean
  onSelect: () => void
  onHover: (slug: string | null) => void
}) {
  return (
    <g
      transform={`translate(${x},${y})`}
      role="button"
      tabIndex={0}
      aria-label={`${p.title}, ${formatKes(p.priceKes)}`}
      className="cursor-pointer outline-none"
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
      onMouseEnter={() => onHover(p.slug)}
      onMouseLeave={() => onHover(null)}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {hovered && <circle r={11} className="delima-pin-pulse" fill="var(--gold)" />}
      <circle r={hovered ? 8.5 : 6.5} fill="url(#delima-pin-gold)" stroke="var(--espresso)" strokeWidth={hovered ? 2 : 1.4} className="transition-all duration-200" />
      <circle r={15} fill="transparent" />
      {showLabel && (
        <text
          y={-13} textAnchor="middle" fontSize={10.5} fontWeight={700}
          fill="var(--gold-deep)" stroke="var(--background)" strokeWidth={3} paintOrder="stroke"
          className="pointer-events-none select-none"
        >
          {formatKes(p.priceKes, { compact: true })}
        </text>
      )}
    </g>
  )
}

function ClusterPin({
  nb, count, x, y, active, onZoom, onHover,
}: {
  nb: NeighborhoodDTO
  count: number
  x: number
  y: number
  active: boolean
  onZoom: () => void
  onHover: (slug: string | null) => void
}) {
  return (
    <g
      transform={`translate(${x},${y})`}
      role="button"
      tabIndex={0}
      aria-label={`${count} ${count === 1 ? 'property' : 'properties'} in ${nb.name}. Zoom in.`}
      className="cursor-pointer outline-none"
      onClick={onZoom}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onZoom() } }}
      onMouseEnter={() => onHover(nb.slug)}
      onMouseLeave={() => onHover(null)}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {active && <circle r={20} className="delima-pin-pulse" fill="var(--gold)" />}
      <circle r={active ? 18 : 15} fill="url(#delima-pin-gold)" stroke="var(--espresso)" strokeWidth={1.6} className="transition-all duration-200" />
      <text y={4.5} textAnchor="middle" fontSize={13} fontWeight={800} fill="#1f1810" className="pointer-events-none select-none">{count}</text>
      <text
        y={30} textAnchor="middle" fontSize={10} fontWeight={700} letterSpacing={1.4}
        fill="var(--foreground)" fillOpacity={0.85} stroke="var(--background)" strokeWidth={3} paintOrder="stroke"
        className="pointer-events-none select-none uppercase"
      >
        {nb.name}
      </text>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Content (remountable for retry)                                     */
/* ------------------------------------------------------------------ */

function MapContent({ onRetry }: { onRetry: () => void }) {
  const { properties, loading, error } = useProperties()
  const { neighborhoods, loading: nbLoading, error: nbError } = useInsights()

  const filters = useAppStore((s) => s.filters)
  const setFilters = useAppStore((s) => s.setFilters)
  const resetFilters = useAppStore((s) => s.resetFilters)
  const hoveredSlug = useAppStore((s) => s.hoveredSlug)
  const setHoveredSlug = useAppStore((s) => s.setHoveredSlug)
  const openProperty = useAppStore((s) => s.openProperty)

  const [t, setT] = useState<Transform>(IDENTITY)
  const [dragging, setDragging] = useState(false)
  const [hoveredNb, setHoveredNb] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)

  const filtered = useMemo(() => filterProperties(properties, filters), [properties, filters])
  const pinMode = t.k > CLUSTER_K

  const hoveredProp = useMemo(
    () => filtered.find((p) => p.slug === hoveredSlug) ?? null,
    [filtered, hoveredSlug],
  )

  const clusters = useMemo(() => {
    const counts = new Map<string, number>()
    filtered.forEach((p) => counts.set(p.neighborhoodSlug, (counts.get(p.neighborhoodSlug) ?? 0) + 1))
    return counts
  }, [filtered])

  // Price→fill-opacity mapper (plain derivation, cheap for 9 neighborhoods)
  const priceOpacity = (v: number) => {
    if (!neighborhoods.length) return 0.18
    const min = Math.min(...neighborhoods.map(n => n.avgPricePerSqm))
    const max = Math.max(...neighborhoods.map(n => n.avgPricePerSqm))
    const span = Math.max(1, max - min)
    return 0.1 + ((v - min) / span) * 0.24
  }

  /* ---------------- zoom / pan ---------------- */

  const zoomToPoint = useCallback((lat: number, lng: number, k: number) => {
    setT(clampT({ x: W / 2 - k * px(lng), y: H / 2 - k * py(lat), k }))
  }, [])

  const zoomBy = useCallback((factor: number) => {
    setT((prev) => {
      const k = clamp(prev.k * factor, 1, K_MAX)
      return clampT({
        x: W / 2 - ((W / 2 - prev.x) * k) / prev.k,
        y: H / 2 - ((H / 2 - prev.y) * k) / prev.k,
        k,
      })
    })
  }, [])

  const resetView = useCallback(() => setT(IDENTITY), [])

  // Keep map in sync when the neighborhood filter changes (AI handoff / heat-table drill-in).
  // Derived during render (React-recommended) instead of a synchronous effect.
  const [lastNbFilter, setLastNbFilter] = useState<{ nb: string; applied: boolean }>({
    nb: filters.neighborhood,
    applied: false,
  })
  if (lastNbFilter.nb !== filters.neighborhood || (!lastNbFilter.applied && filters.neighborhood !== 'ALL')) {
    if (filters.neighborhood === 'ALL') {
      setLastNbFilter(prev => ({ nb: filters.neighborhood, applied: true }))
      setT(IDENTITY)
    } else {
      const nb = neighborhoods.find((n) => n.slug === filters.neighborhood)
      if (nb) {
        // Only mark applied once the zoom actually happened — while insights
        // data is still loading the neighborhood is missing and we must retry
        // on a later render instead of silently no-oping the AI handoff.
        setLastNbFilter(prev => ({ nb: filters.neighborhood, applied: true }))
        zoomToPoint(nb.lat, nb.lng, ZOOM_IN_TARGET)
      } else if (lastNbFilter.nb !== filters.neighborhood) {
        setLastNbFilter(prev => ({ nb: filters.neighborhood, applied: false }))
      }
    }
  }

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (t.k <= 1 || e.button !== 0) return
    svgRef.current?.setPointerCapture(e.pointerId)
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: t.x, oy: t.y }
    setDragging(true)
  }
  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const d = dragRef.current
    const rect = svgRef.current?.getBoundingClientRect()
    if (!d || !rect) return
    const vbPerPx = Math.max(W / rect.width, H / rect.height)
    setT((prev) => clampT({ ...prev, x: d.ox + (e.clientX - d.sx) * vbPerPx, y: d.oy + (e.clientY - d.sy) * vbPerPx }))
  }
  const endDrag = () => {
    dragRef.current = null
    setDragging(false)
  }

  /* ---------------- loading / error ---------------- */

  if (loading || nbLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-[50vh] w-full rounded-2xl lg:h-[640px]" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || nbError) {
    return (
      <Card className="mx-auto max-w-lg border-gold/30 luxury-shadow">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-gold/15 text-gold-deep dark:text-gold">
            <AlertTriangle className="size-7" />
          </span>
          <div>
            <h3 className="font-display text-xl">The map couldn&apos;t load</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error ?? nbError}</p>
          </div>
          <Button onClick={onRetry} className="h-11 min-w-[140px] gold-gradient-bg border-0 text-espresso hover:opacity-90">
            <RotateCcw className="size-4" /> Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  /* ---------------- derived render data ---------------- */

  const hoveredX = hoveredProp ? t.x + t.k * px(hoveredProp.lng) : 0
  const hoveredY = hoveredProp ? t.y + t.k * py(hoveredProp.lat) : 0
  let cardX = hoveredX + 16
  if (cardX + 196 > W - 4) cardX = hoveredX - 16 - 196
  cardX = Math.max(4, cardX)
  let cardY = hoveredY - 100
  if (cardY < 4) cardY = hoveredY + 16
  cardY = clamp(cardY, 4, H - 100)

  return (
    <div className="space-y-4">
      {/* keyframes for pin pulse (kept local — globals.css is shared) */}
      <style>{`
        @keyframes delima-pin-pulse { 0% { opacity:.6; transform:scale(.5); } 70% { opacity:0; transform:scale(2); } 100% { opacity:0; transform:scale(2); } }
        .delima-pin-pulse { animation: delima-pin-pulse 1.5s ease-out infinite; transform-origin: center; transform-box: fill-box; }
      `}</style>

      {/* ---------------- top bar: quick filters ---------------- */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 luxury-shadow md:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filters.type} onValueChange={(v) => setFilters({ type: v as PropertyType | 'ALL' })}>
            <SelectTrigger aria-label="Filter by property type" className="h-11 w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              {PROPERTY_TYPES.map((ty) => (
                <SelectItem key={ty} value={ty}>{typeLabel[ty]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(v) => setFilters({ status: v as PropertyStatus | 'ALL' })}>
            <SelectTrigger aria-label="Filter by listing status" className="h-11 w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {PROPERTY_STATUSES.map((st) => (
                <SelectItem key={st} value={st}>{statusLabel[st]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.maxPrice != null ? String(filters.maxPrice) : 'ANY'}
            onValueChange={(v) => setFilters({ maxPrice: v === 'ANY' ? null : Number(v) })}
          >
            <SelectTrigger aria-label="Filter by maximum price" className="h-11 w-[150px]">
              <SelectValue placeholder="Max price" />
            </SelectTrigger>
            <SelectContent>
              {MAX_PRICE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={resetFilters}
            aria-label="Reset all filters"
            className="h-11 border-gold/40 hover:bg-gold/10 hover:text-gold-deep dark:hover:text-gold"
          >
            <RotateCcw className="size-4" /> Reset
          </Button>

          <Badge variant="secondary" className="ml-auto h-9 px-3 text-xs font-semibold">
            {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'}
          </Badge>
        </div>

        {/* legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Avg KES / sqm</span>
          <div className="flex items-center gap-2">
            {PRICE_BANDS.map((b) => (
              <span key={b.label} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="inline-block size-3.5 rounded-[3px] border border-gold/50"
                  style={{ backgroundColor: 'var(--gold)', opacity: b.opacity }}
                />
                <span className="text-[11px] text-muted-foreground">{b.label}</span>
              </span>
            ))}
          </div>
          <span className="ml-auto hidden text-[11px] text-muted-foreground sm:block">
            Drag to pan · Click a cluster to zoom · Pins show prices from {CLUSTER_K + 0.1}× zoom
          </span>
        </div>
      </div>

      {/* ---------------- map + list ---------------- */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* map */}
        <div className="relative min-w-0 flex-1">
          <div
            className={cn(
              'relative h-[50vh] w-full overflow-hidden rounded-2xl border bg-sand luxury-shadow lg:h-[640px]',
              dragging ? 'map-grabbing' : t.k > 1 ? 'map-grab' : '',
            )}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="xMidYMid meet"
              className="h-full w-full touch-none"
              role="application"
              aria-label="Interactive map of Nairobi neighborhoods and listings. Use the zoom buttons to explore."
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={endDrag}
            >
              <defs>
                <radialGradient id="delima-pin-gold" cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor="#f1e3a3" />
                  <stop offset="55%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#a3820f" />
                </radialGradient>
              </defs>

              <g transform={`translate(${t.x},${t.y}) scale(${t.k})`}>
                {/* base */}
                <rect x={0} y={0} width={W} height={H} fill="var(--sand)" />

                {/* faint survey grid */}
                <g className="pointer-events-none select-none">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <line key={`v${i}`} x1={(i + 1) * 100} y1={0} x2={(i + 1) * 100} y2={H} stroke="var(--border)" strokeWidth={0.6} opacity={0.55} vectorEffect="non-scaling-stroke" />
                  ))}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <line key={`h${i}`} x1={0} y1={(i + 1) * 100} x2={W} y2={(i + 1) * 100} stroke="var(--border)" strokeWidth={0.6} opacity={0.55} vectorEffect="non-scaling-stroke" />
                  ))}
                </g>

                {/* green spaces — olive/clay tones (no blue) */}
                {PARKS.map((park) => (
                  <polygon
                    key={park.name}
                    points={park.poly.map(([la, ln]) => `${px(ln)},${py(la)}`).join(' ')}
                    fill="var(--clay)"
                    fillOpacity={0.22}
                    stroke="var(--clay)"
                    strokeOpacity={0.35}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                    className="pointer-events-none"
                  >
                    <title>{park.name}</title>
                  </polygon>
                ))}

                {/* Nairobi River — clay tone */}
                <polyline
                  points={RIVER.map(([la, ln]) => `${px(ln)},${py(la)}`).join(' ')}
                  fill="none" stroke="var(--clay)" strokeOpacity={0.6} strokeWidth={1.6}
                  vectorEffect="non-scaling-stroke" className="pointer-events-none"
                />

                {/* roads */}
                <g className="pointer-events-none select-none" fill="none">
                  {ROADS.map((d, i) => (
                    <path key={i} d={d} stroke="var(--border)" strokeWidth={i < 3 ? 2.4 : 1.8} strokeOpacity={0.9} vectorEffect="non-scaling-stroke" />
                  ))}
                  <path d={ROADS[0]} stroke="var(--gold)" strokeOpacity={0.4} strokeWidth={1.2} strokeDasharray="7 7" vectorEffect="non-scaling-stroke" />
                  <path d={ROADS[1]} stroke="var(--gold)" strokeOpacity={0.4} strokeWidth={1.2} strokeDasharray="7 7" vectorEffect="non-scaling-stroke" />
                  {ROAD_LABELS.map((rl) => (
                    <text
                      key={rl.text} x={rl.x} y={rl.y} fontSize={8.5} letterSpacing={1.1} fill="var(--muted-foreground)"
                      fillOpacity={0.85} stroke="var(--sand)" strokeWidth={2.5} paintOrder="stroke" className="uppercase"
                    >
                      {rl.text}
                    </text>
                  ))}
                </g>

                {/* neighborhood polygons — gold fill opacity scales with price quartile */}
                {neighborhoods.map((nb) => {
                  const isTarget = filters.neighborhood === nb.slug
                  const isHot = hoveredNb === nb.slug || hoveredProp?.neighborhoodSlug === nb.slug
                  return (
                    <g key={nb.slug} onMouseEnter={() => setHoveredNb(nb.slug)} onMouseLeave={() => setHoveredNb(null)}>
                      <title>{`${nb.name} — avg ${formatKes(nb.avgPricePerSqm)} / sqm`}</title>
                      <polygon
                        points={nb.polygon.map(([la, ln]) => `${px(ln)},${py(la)}`).join(' ')}
                        fill="var(--gold)"
                        fillOpacity={priceOpacity(nb.avgPricePerSqm) + (isHot ? 0.14 : 0) + (isTarget ? 0.08 : 0)}
                        stroke={isTarget ? 'var(--gold-deep)' : 'var(--gold)'}
                        strokeOpacity={isTarget ? 0.95 : 0.55}
                        strokeWidth={isTarget ? 2 : 1.3}
                        strokeDasharray={isTarget ? '5 4' : undefined}
                        vectorEffect="non-scaling-stroke"
                        className="transition-[fill-opacity] duration-300"
                      />
                    </g>
                  )
                })}

                {/* neighborhood labels (pin mode — clusters render their own) */}
                {pinMode && neighborhoods.map((nb) => (
                  <text
                    key={nb.slug} x={px(nb.lng)} y={py(nb.lat) + 27} textAnchor="middle"
                    fontSize={10} letterSpacing={1.6} fontWeight={600}
                    fill="var(--foreground)" fillOpacity={0.6}
                    stroke="var(--sand)" strokeWidth={3} paintOrder="stroke"
                    className="pointer-events-none select-none uppercase"
                  >
                    {nb.name}
                  </text>
                ))}

                {/* Nairobi CBD — landmark marker */}
                <g transform={`translate(${px(36.8172)},${py(-1.2864)})`} className="pointer-events-none select-none">
                  <path d="M -11 -4 L 0 -13 L 11 -4 Z" fill="var(--gold-deep)" />
                  <rect x={-9.5} y={-3} width={19} height={2.6} fill="var(--gold-deep)" />
                  <rect x={-8.5} y={0.6} width={2.8} height={9} fill="var(--gold-deep)" />
                  <rect x={-4.4} y={0.6} width={2.8} height={9} fill="var(--gold-deep)" />
                  <rect x={-0.3} y={0.6} width={2.8} height={9} fill="var(--gold-deep)" />
                  <rect x={3.8} y={0.6} width={2.8} height={9} fill="var(--gold-deep)" />
                  <rect x={-11} y={10.6} width={22} height={2.6} fill="var(--gold-deep)" />
                  <text
                    y={26} textAnchor="middle" fontSize={9.5} fontWeight={700} letterSpacing={1.8}
                    fill="var(--foreground)" fillOpacity={0.75} stroke="var(--sand)" strokeWidth={3} paintOrder="stroke" className="uppercase"
                  >
                    Nairobi CBD
                  </text>
                </g>

                {/* pins / clusters */}
                {pinMode
                  ? filtered.map((p) => (
                      <PropertyPin
                        key={p.slug}
                        p={p}
                        x={px(p.lng)}
                        y={py(p.lat)}
                        hovered={hoveredSlug === p.slug}
                        showLabel
                        onSelect={() => openProperty(p.slug)}
                        onHover={setHoveredSlug}
                      />
                    ))
                  : neighborhoods
                      .filter((nb) => (clusters.get(nb.slug) ?? 0) > 0)
                      .map((nb) => (
                        <ClusterPin
                          key={nb.slug}
                          nb={nb}
                          count={clusters.get(nb.slug) ?? 0}
                          x={px(nb.lng)}
                          y={py(nb.lat)}
                          active={hoveredNb === nb.slug}
                          onZoom={() => zoomToPoint(nb.lat, nb.lng, ZOOM_IN_TARGET)}
                          onHover={setHoveredNb}
                        />
                      ))}
              </g>

              {/* compass rose (fixed chrome, corner) */}
              <g transform="translate(54,66)" className="pointer-events-none select-none" opacity={0.92}>
                <circle r={27} fill="var(--card)" fillOpacity={0.75} stroke="var(--gold)" strokeWidth={1.3} />
                <circle r={20} fill="none" stroke="var(--gold)" strokeOpacity={0.5} strokeWidth={0.8} strokeDasharray="2 3.5" />
                <path d="M 0 -17 L 4.5 0 L -4.5 0 Z" fill="var(--gold)" />
                <path d="M 0 17 L 4.5 0 L -4.5 0 Z" fill="var(--clay)" />
                <text y={-31} textAnchor="middle" fontSize={9.5} fontWeight={800} fill="var(--gold-deep)">N</text>
                <text y={40} textAnchor="middle" fontSize={8} fontWeight={600} fill="var(--muted-foreground)">S</text>
                <text x={33} y={3.5} textAnchor="middle" fontSize={8} fontWeight={600} fill="var(--muted-foreground)">E</text>
                <text x={-33} y={3.5} textAnchor="middle" fontSize={8} fontWeight={600} fill="var(--muted-foreground)">W</text>
              </g>

              {/* scale legend (fixed chrome, bottom-right) */}
              <g transform={`translate(${W - 148},${H - 34})`} className="pointer-events-none select-none">
                <path d="M 0 0 H 90 M 0 -5 V 5 M 90 -5 V 5 M 45 -3 V 3" stroke="var(--foreground)" strokeOpacity={0.7} strokeWidth={1.4} fill="none" />
                <text x={45} y={-9} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--foreground)" fillOpacity={0.75} stroke="var(--sand)" strokeWidth={3} paintOrder="stroke">
                  2 km
                </text>
              </g>

              {/* floating mini card for the hovered pin */}
              {hoveredProp && (
                <foreignObject x={cardX} y={cardY} width={196} height={92} className="pointer-events-none">
                  <div className="flex h-full w-full items-stretch gap-2.5 rounded-xl border border-gold/40 bg-card p-2 luxury-shadow">
                    <Thumb src={hoveredProp.images[0]} alt={hoveredProp.title} className="w-14 rounded-lg" />
                    <div className="min-w-0 flex-1 py-0.5">
                      <p className="truncate text-[11px] font-semibold leading-tight">{hoveredProp.title}</p>
                      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{hoveredProp.neighborhood} · {typeLabel[hoveredProp.type]}</p>
                      <p className="mt-1 text-[11px] font-bold text-gold-deep dark:text-gold">{formatPriceForStatus(hoveredProp.priceKes, hoveredProp.status)}</p>
                    </div>
                  </div>
                </foreignObject>
              )}
            </svg>

            {/* zoom controls */}
            <div className="absolute right-3 top-3 flex flex-col gap-1.5">
              <Button
                size="icon"
                variant="outline"
                aria-label="Zoom in"
                onClick={() => zoomBy(1.45)}
                className="size-11 rounded-lg border-border/70 bg-card/90 backdrop-blur hover:bg-gold/15 hover:text-gold-deep dark:hover:text-gold"
              >
                <Plus className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Zoom out"
                onClick={() => zoomBy(1 / 1.45)}
                className="size-11 rounded-lg border-border/70 bg-card/90 backdrop-blur hover:bg-gold/15 hover:text-gold-deep dark:hover:text-gold"
              >
                <Minus className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Reset map view"
                onClick={resetView}
                className="size-11 rounded-lg border-border/70 bg-card/90 backdrop-blur hover:bg-gold/15 hover:text-gold-deep dark:hover:text-gold"
              >
                <Maximize className="size-4" />
              </Button>
            </div>

            <p className="absolute bottom-2 left-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
              Stylised map — not to scale
            </p>
          </div>
        </div>

        {/* synced list panel */}
        <aside className="w-full shrink-0 lg:w-[380px]" aria-label="Filtered listings list">
          <div className="flex items-center justify-between px-1 pb-2">
            <h3 className="font-display text-lg">Matching residences</h3>
            <Badge variant="outline" className="border-gold/40 text-gold-deep dark:text-gold">{filtered.length}</Badge>
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
              <Home className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No listings match these filters. Try widening your search.</p>
            </div>
          ) : (
            <div className="delima-scroll max-h-[420px] overflow-y-auto rounded-xl border bg-card p-2 lg:max-h-[588px]">
              <ul className="space-y-1">
                {filtered.map((p) => {
                  const active = hoveredSlug === p.slug
                  return (
                    <li key={p.slug}>
                      <button
                        onClick={() => openProperty(p.slug)}
                        onMouseEnter={() => setHoveredSlug(p.slug)}
                        onMouseLeave={() => setHoveredSlug(null)}
                        aria-label={`Open ${p.title}, ${formatKes(p.priceKes)}`}
                        className={cn(
                          'flex min-h-[64px] w-full items-center gap-3 rounded-lg p-2 text-left transition-colors',
                          active ? 'bg-gold/10 ring-1 ring-gold/50' : 'hover:bg-sand/70 dark:hover:bg-accent/60',
                        )}
                      >
                        <Thumb src={p.images[0]} alt={p.title} className="h-12 w-12 rounded-lg" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{p.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">{p.neighborhood} · {typeLabel[p.type]} · {p.bedrooms} bed</span>
                          <span className="block text-sm font-bold text-gold-deep dark:text-gold">{formatPriceForStatus(p.priceKes, p.status)}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export default function MapView() {
  const [attempt, setAttempt] = useState(0)
  return <MapContent key={attempt} onRetry={() => setAttempt((a) => a + 1)} />
}
