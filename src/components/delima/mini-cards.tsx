// Delima Realtors 3.0 — compact listing & neighborhood cards
// Owner: REV-1 (shell engineer). Shared building blocks used by home-view,
// neighborhood-guide and the AI assistant chat.
// Exports: SmartImage, PropertyMiniCard, NeighborhoodCard, type NeighborhoodStat
'use client'

import { useState } from 'react'
import { Bath, BedDouble, Image as ImageIcon, MapPin, Ruler, TrendingUp } from 'lucide-react'
import type { NeighborhoodDTO, PropertyDTO } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { useI18n, usePriceFormatter, useStatusLabel } from '@/lib/i18n'
import { formatKes, formatSqm } from '@/lib/format'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* SmartImage — plain <img> with graceful shimmer/brand fallback       */
/* ------------------------------------------------------------------ */

export function SmartImage({
  src,
  alt,
  className,
  eager = false,
  fallbackLabel,
}: {
  src?: string
  alt: string
  className?: string
  eager?: boolean
  fallbackLabel?: string
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'relative flex items-center justify-center overflow-hidden bg-brand-soft',
          className,
        )}
      >
        <span aria-hidden="true" className="shimmer absolute inset-0 opacity-60" />
        {fallbackLabel ? (
          <span className="relative font-display text-3xl font-extrabold text-brand/70">
            {fallbackLabel.charAt(0).toUpperCase()}
          </span>
        ) : (
          <ImageIcon className="relative size-7 text-brand/50" aria-hidden="true" />
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('bg-muted object-cover', className)}
      onError={() => setFailed(true)}
    />
  )
}

/* ------------------------------------------------------------------ */
/* PropertyMiniCard — compact horizontal card (AI chat, rails, grids)  */
/* ~72px thumb left · title / location / price right                   */
/* ------------------------------------------------------------------ */

export function PropertyMiniCard({
  property,
  className,
}: {
  property: PropertyDTO
  className?: string
}) {
  const openProperty = useAppStore(s => s.openProperty)
  const { t } = useI18n()
  const statusLabel = useStatusLabel()
  const formatPriceFor = usePriceFormatter()
  const formatPriceForStatus = (price: number, status: PropertyDTO['status']) =>
    formatPriceFor(price, status)

  return (
    <button
      type="button"
      onClick={() => openProperty(property.slug)}
      aria-label={`${property.title} — ${property.neighborhood}, ${formatPriceForStatus(property.priceKes, property.status)}`}
      className={cn(
        'group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-line bg-white p-2 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_16px_36px_-16px_rgba(12,59,46,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <span className="relative size-[72px] shrink-0 overflow-hidden rounded-xl">
        <SmartImage
          src={property.images[0]}
          alt={property.title}
          fallbackLabel={property.neighborhood}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5">
        <span className="truncate text-sm font-bold text-ink">{property.title}</span>
        <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0 text-sun-deep" aria-hidden="true" />
          <span className="truncate">{property.neighborhood}</span>
          <span aria-hidden="true" className="text-line">
            ·
          </span>
          <span className="shrink-0">{statusLabel[property.status]}</span>
        </span>
        <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span className="text-sm font-extrabold text-brand">
            {formatPriceForStatus(property.priceKes, property.status)}
          </span>
          <span className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-0.5" aria-label={`${property.bedrooms} bedrooms`}>
              <BedDouble className="size-3" aria-hidden="true" />
              {property.bedrooms}
            </span>
            <span className="inline-flex items-center gap-0.5" aria-label={`${property.bathrooms} bathrooms`}>
              <Bath className="size-3" aria-hidden="true" />
              {property.bathrooms}
            </span>
            <span className="inline-flex items-center gap-0.5" aria-label={`${property.sqm} square metres`}>
              <Ruler className="size-3" aria-hidden="true" />
              {formatSqm(property.sqm)}
            </span>
          </span>
        </span>
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* NeighborhoodCard — photo card with evergreen overlay + sun accents  */
/* ------------------------------------------------------------------ */

export interface NeighborhoodStat {
  latestYoY: number
  avgPricePerSqm: number
}

export function NeighborhoodCard({
  neighborhood,
  stat,
}: {
  neighborhood: NeighborhoodDTO
  stat?: NeighborhoodStat
}) {
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)
  const avg = stat?.avgPricePerSqm ?? neighborhood.avgPricePerSqm
  const yoy = stat?.latestYoY

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Explore properties in ${neighborhood.name}`}
      onClick={() => setFilterAndGo({ neighborhood: neighborhood.slug }, 'properties')}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setFilterAndGo({ neighborhood: neighborhood.slug }, 'properties')
        }
      }}
      className="card-modern group relative h-56 w-full cursor-pointer overflow-hidden rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <SmartImage
        src={neighborhood.image}
        alt={neighborhood.name}
        fallbackLabel={neighborhood.name}
        className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-110"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-brand-deep/95 via-brand-deep/35 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
        <h3 className="font-display text-xl font-bold text-white">{neighborhood.name}</h3>
        <p className="flex items-center gap-1 text-xs font-medium text-white/80">
          <MapPin className="size-3.5 shrink-0 text-sun" aria-hidden="true" />
          Nairobi · {formatKes(avg, { compact: true })} / sqm
        </p>
        {yoy !== undefined && (
          <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-sun/90 px-2.5 py-1 text-[11px] font-bold text-brand-deep backdrop-blur-sm">
            <TrendingUp
              className={cn('size-3.5', yoy < 0 && 'rotate-180')}
              aria-hidden="true"
            />
            {yoy > 0 ? '+' : ''}
            {yoy.toFixed(1)}% YoY
          </span>
        )}
      </div>
    </div>
  )
}
