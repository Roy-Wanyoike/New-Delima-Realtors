'use client'

// Delima Realtors Platform 2.0 — luxury listing card (Task 5-b)
import { useState } from 'react'
import { ArrowUpRight, Bath, BedDouble, Heart, Home, MapPin, Ruler, Scale, Share2, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { formatPriceForStatus, formatSqm, statusLabel } from '@/lib/format'
import type { PropertyDTO, PropertyStatus } from '@/lib/types'

function statusBadgeClass(status: PropertyStatus): string {
  switch (status) {
    case 'FOR_SALE':
      return 'gold-gradient-bg border-transparent text-espresso'
    case 'FOR_RENT':
      return 'border-transparent bg-espresso/80 text-cream dark:text-[#f0e9dc] backdrop-blur-sm'
    case 'NEW_DEVELOPMENT':
      return 'border-gold/60 bg-background/70 text-gold-deep backdrop-blur-sm dark:text-gold'
    case 'SOLD':
      return 'border-transparent bg-espresso text-cream dark:text-[#f0e9dc]'
  }
}

export function PropertyCard({ property, compact = false }: { property: PropertyDTO; compact?: boolean }) {
  const openProperty = useAppStore(s => s.openProperty)
  const setHoveredSlug = useAppStore(s => s.setHoveredSlug)
  const favorites = useAppStore(s => s.favorites)
  const toggleFavorite = useAppStore(s => s.toggleFavorite)
  const compare = useAppStore(s => s.compare)
  const toggleCompare = useAppStore(s => s.toggleCompare)

  const isFav = favorites.includes(property.slug)
  const isComp = compare.includes(property.slug)

  const { toast } = useToast()

  const [imgError, setImgError] = useState(false)
  const img = property.images.length > 0 ? property.images[0] : undefined

  async function handleShare(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    const shareUrl = `https://delima.co.ke/property/${property.slug}`
    const text = `Check out ${property.title} — ${formatPriceForStatus(property.priceKes, property.status)} on Delima Realtors`
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title: property.title, text, url: shareUrl })
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        toast({ title: 'Link copied', description: 'Share it with anyone looking for a Nairobi home.' })
      }
    } catch {
      // User dismissed the share sheet (AbortError) or the clipboard write failed — fail silently
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`View ${property.title} in ${property.neighborhood}`}
      onClick={() => openProperty(property.slug)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openProperty(property.slug)
        }
      }}
      onMouseEnter={() => setHoveredSlug(property.slug)}
      onMouseLeave={() => setHoveredSlug(null)}
      className="luxury-card group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-card text-card-foreground luxury-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring print:break-inside-avoid print:border-espresso/30 print:bg-white print:text-espresso print:shadow-none"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-sand dark:bg-espresso-soft print:h-32">
        {img && !imgError ? (
          <img
            src={img}
            alt={property.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full flex-col items-center justify-center gap-2 gold-gradient-bg text-espresso/70"
          >
            <Home className="size-8" />
            <span className="font-display text-sm tracking-wide">Delima Realtors</span>
          </div>
        )}

        {/* Status + featured badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <Badge
            className={cn('px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider shadow-sm', statusBadgeClass(property.status))}
          >
            {statusLabel[property.status]}
          </Badge>
          {property.featured && (
            <Badge className="border-transparent bg-gold px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-espresso shadow-sm">
              ★ Featured
            </Badge>
          )}
        </div>

        {/* Favorite + compare actions */}
        <div className="absolute right-3 top-3 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            aria-label={isFav ? `Remove ${property.title} from saved homes` : `Save ${property.title}`}
            aria-pressed={isFav}
            onClick={() => toggleFavorite(property.slug)}
            className={cn(
              'flex size-11 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring print:hidden',
              isFav ? 'border-gold/60 bg-card/90 text-gold-deep dark:text-gold' : 'border-white/30 bg-background/70 hover:bg-background',
            )}
          >
            <Heart className={cn('size-5', isFav && 'fill-gold text-gold')} aria-hidden />
          </button>
          <button
            type="button"
            aria-label={isComp ? `Remove ${property.title} from comparison` : `Add ${property.title} to comparison`}
            aria-pressed={isComp}
            onClick={() => toggleCompare(property.slug)}
            className={cn(
              'flex size-11 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring print:hidden',
              isComp ? 'gold-gradient-bg border-transparent text-espresso' : 'border-white/30 bg-background/70 hover:bg-background',
            )}
          >
            <Scale className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label={`Share ${property.title}`}
            onClick={handleShare}
            className="flex size-11 items-center justify-center rounded-full border border-white/30 bg-background/70 shadow-sm backdrop-blur-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring print:hidden"
          >
            <Share2 className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={cn('flex flex-1 flex-col gap-2', compact ? 'p-3' : 'p-4')}>
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0 text-gold-deep dark:text-gold" aria-hidden />
          <span className="eyebrow truncate">{property.neighborhood}</span>
        </div>
        <h3 className={cn('font-display leading-snug', compact ? 'text-base' : 'text-lg')}>
          {property.title}
        </h3>
        <p className={cn('font-bold text-gold-deep dark:text-gold', compact ? 'text-base' : 'text-lg')}>
          {formatPriceForStatus(property.priceKes, property.status)}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BedDouble className="size-4" aria-hidden />
            {property.bedrooms} bd
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="size-4" aria-hidden />
            {property.bathrooms} ba
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler className="size-4" aria-hidden />
            {formatSqm(property.sqm)}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-1.5">
          <span className="flex items-center gap-1 text-sm text-muted-foreground" aria-label={`Rated ${property.rating.toFixed(1)} out of 5`}>
            <Star className="size-4 fill-gold text-gold" aria-hidden />
            {property.rating.toFixed(1)}
          </span>
          {!compact && (
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:text-gold">
              View
              <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          )}
        </div>
        <p className="hidden pt-1.5 text-[11px] text-muted-foreground print:block">
          View online: delima.co.ke/property/{property.slug}
        </p>
      </div>
    </article>
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card luxury-shadow" aria-hidden>
      <Skeleton className="aspect-[4/3] w-full rounded-none border-0" />
      <div className="flex flex-col gap-2.5 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  )
}
