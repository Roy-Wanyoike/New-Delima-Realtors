// Delima Realtors Platform 2.0 — compact listing & neighborhood cards
// Owner: principal-engineer-a (Task 5-a). Shared building blocks used by
// home-view, and importable by properties / map / insights views.
'use client'

import { useState } from 'react'
import { Bath, BedDouble, Image as ImageIcon, Ruler, TrendingUp } from 'lucide-react'
import type { NeighborhoodDTO, PropertyDTO } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { formatKes, formatPriceForStatus, formatSqm, statusLabel } from '@/lib/format'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* SmartImage — plain <img> with graceful gold-gradient fallback       */
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
        className={cn('gold-gradient-bg flex items-center justify-center', className)}
      >
        {fallbackLabel ? (
          <span className="font-display text-3xl font-bold text-white/85">
            {fallbackLabel.charAt(0).toUpperCase()}
          </span>
        ) : (
          <ImageIcon className="size-7 text-white/80" aria-hidden="true" />
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
      className={cn('object-cover', className)}
      onError={() => setFailed(true)}
    />
  )
}

/* ------------------------------------------------------------------ */
/* PropertyMiniCard — compact horizontal listing card                  */
/* ------------------------------------------------------------------ */

export function PropertyMiniCard({ property }: { property: PropertyDTO }) {
  const openProperty = useAppStore(s => s.openProperty)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${property.title} — ${property.neighborhood}`}
      onClick={() => openProperty(property.slug)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openProperty(property.slug)
        }
      }}
      className="luxury-card group flex h-44 w-full cursor-pointer overflow-hidden rounded-xl border bg-card luxury-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* image — 40% left */}
      <div className="relative w-[40%] shrink-0 overflow-hidden">
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

      {/* details */}
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <p className="eyebrow">{property.neighborhood}</p>
        <h3 className="mt-1.5 line-clamp-2 font-display text-base leading-snug">
          {property.title}
        </h3>
        <div className="mt-auto">
          <p className="text-base font-bold text-gold-deep dark:text-gold">
            {formatPriceForStatus(property.priceKes, property.status)}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1" aria-label={`${property.bedrooms} bedrooms`}>
              <BedDouble className="size-3.5" aria-hidden="true" />
              {property.bedrooms}
            </span>
            <span className="flex items-center gap-1" aria-label={`${property.bathrooms} bathrooms`}>
              <Bath className="size-3.5" aria-hidden="true" />
              {property.bathrooms}
            </span>
            <span className="flex items-center gap-1" aria-label={`${property.sqm} square metres`}>
              <Ruler className="size-3.5" aria-hidden="true" />
              {formatSqm(property.sqm)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* NeighborhoodCard — image card with gradient overlay                 */
/* ------------------------------------------------------------------ */

export interface NeighborhoodStat {
  latestYoY: number
  avgPricePerSqm: number
}

export function NeighborhoodCard({
  neighborhood,
  stat,
  badge,
  count,
}: {
  neighborhood: NeighborhoodDTO
  stat?: NeighborhoodStat
  badge?: string
  count?: number
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
      className="luxury-card group relative h-64 cursor-pointer overflow-hidden rounded-xl border luxury-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <SmartImage
        src={neighborhood.image}
        alt={neighborhood.name}
        fallbackLabel={neighborhood.name}
        className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/95 via-espresso/35 to-transparent" />
      {badge && (
        <span className="gold-gradient-bg absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#1f1810]">
          {badge}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-display text-xl text-[#f0e9dc]">{neighborhood.name}</h3>
        <p className="mt-0.5 text-xs font-medium text-[#f0e9dc]/80">
          {count !== undefined
            ? `${count} ${count === 1 ? 'Property' : 'Properties'} · ${formatKes(avg, { compact: true })} / sqm`
            : `${formatKes(avg, { compact: true })} / sqm`}
        </p>
        {yoy !== undefined && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <TrendingUp
              className={cn('size-3.5', yoy < 0 ? 'text-rose-300' : 'text-gold-soft')}
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
