// Delima Realtors 3.0 — modern property card
// FROZEN CONTRACT:
//   export function PropertyCard({ property, active, onHover, className })
//   export function PropertyCardSkeleton({ className })
// REV-1 (shell agent) owns this file and may refine visuals but MUST keep
// these export names and props. Consumers: properties-view, property-detail.

'use client'

import * as React from 'react'
import Image from 'next/image'
import { Bath, BedDouble, Heart, MapPin, Maximize, Star } from 'lucide-react'
import type { PropertyDTO } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useI18n, usePriceFormatter, useStatusLabel, useTypeLabel } from '@/lib/i18n'
import { useSavedToggle } from '@/hooks/use-saved'

const statusChip: Record<PropertyDTO['status'], { cls: string; dot: string }> = {
  FOR_SALE: { cls: 'bg-brand text-white', dot: 'bg-emerald-300' },
  FOR_RENT: { cls: 'bg-sun text-brand-deep', dot: 'bg-amber-700' },
  SOLD: { cls: 'bg-stone-600 text-white', dot: 'bg-stone-300' },
  NEW_DEVELOPMENT: { cls: 'bg-white text-brand border border-line', dot: 'bg-sun' },
}

export function PropertyCard({
  property,
  active = false,
  onHover,
  className,
}: {
  property: PropertyDTO
  /** highlighted state (map ↔ list sync) */
  active?: boolean
  onHover?: (slug: string | null) => void
  className?: string
}) {
  const openProperty = useAppStore(s => s.openProperty)
  const { t } = useI18n()
  const statusLabel = useStatusLabel()
  const typeLabel = useTypeLabel()
  const formatPrice = usePriceFormatter()
  const { saved: isFavorite, toggle: toggleFavorite } = useSavedToggle(property.slug)
  const cover = property.images?.[0]

  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`${property.title} — ${formatPrice(property.priceKes, property.status)}`}
      onClick={() => openProperty(property.slug)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openProperty(property.slug)
        }
      }}
      onMouseEnter={() => onHover?.(property.slug)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        'card-modern group cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-sun',
        active && 'ring-2 ring-sun ring-offset-2 ring-offset-paper',
        className,
      )}
    >
      {/* media */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No photo</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        {/* status chip */}
        <span
          className={cn(
            'absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide',
            statusChip[property.status].cls,
          )}
        >
          <span className={cn('size-1.5 rounded-full', statusChip[property.status].dot)} />
          {statusLabel[property.status]}
        </span>

        {/* favorite */}
        <button
          onClick={e => {
            stop(e)
            toggleFavorite(property.slug)
          }}
          aria-label={isFavorite ? t('common.saved') : t('common.save')}
          aria-pressed={isFavorite}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-stone-700 shadow-sm backdrop-blur transition hover:scale-110 hover:text-rose-600"
        >
          <Heart className={cn('size-4', isFavorite && 'fill-rose-600 text-rose-600')} />
        </button>

        {/* price on media */}
        <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur">
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-brand">
            {formatPrice(property.priceKes, property.status)}
          </span>
        </div>
      </div>

      {/* body */}
      <div className="space-y-3 p-4 sm:p-5">
        <div>
          <h3 className="line-clamp-1 text-[15px] sm:text-base font-bold text-ink group-hover:text-brand transition-colors">
            {property.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-sun-deep" />
            <span className="truncate">{property.neighborhood}, Nairobi</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] font-medium text-stone-600">
          <span className="inline-flex items-center gap-1.5">
            <BedDouble className="size-4 text-brand" />
            {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bd`}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bath className="size-4 text-brand" />
            {property.bathrooms} ba
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Maximize className="size-4 text-brand" />
            {property.sqm.toLocaleString('en-KE')} m²
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-sun text-sun" />
            {property.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {typeLabel[property.type]}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-brand transition-transform group-hover:translate-x-0.5">
            {t('card.viewDetails')} <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </article>
  )
}

export function PropertyCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('card-modern overflow-hidden', className)} aria-hidden>
      <div className="aspect-[4/3] shimmer" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 rounded shimmer" />
        <div className="h-4 w-1/2 rounded shimmer" />
        <div className="flex gap-3 pt-1">
          <div className="h-4 w-14 rounded shimmer" />
          <div className="h-4 w-14 rounded shimmer" />
          <div className="h-4 w-16 rounded shimmer" />
        </div>
        <div className="h-px bg-line" />
        <div className="h-4 w-24 rounded shimmer" />
      </div>
    </div>
  )
}
