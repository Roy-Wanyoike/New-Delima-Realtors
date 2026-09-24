// Delima Realtors 3.0 — Neighbourhoods Atlas (homepage "Locations" section)
// Owner: REV-2 (homepage engineer).
// Rewritten for the 3.0 design system: the old tabbed deep-dive was replaced
// by a swipeable horizontal snap-scroll row of neighbourhood cards — image,
// name, live listing count and avg price per sqm. Whole card navigates to the
// properties view filtered by that neighbourhood.
'use client'

import Image from 'next/image'
import { MapPin } from 'lucide-react'
import type { NeighborhoodDTO } from '@/lib/types'
import { formatKes } from '@/lib/format'
import { Section, SectionHeading } from './ui-kit'

interface NeighborhoodGuideProps {
  neighborhoods: NeighborhoodDTO[]
  /** live listing counts keyed by neighborhood slug (computed by the caller) */
  countsBySlug?: Record<string, number>
  /** show skeleton cards while the caller's data hooks are loading */
  loading?: boolean
  /** navigate to the properties view filtered by neighborhood slug */
  onExplore?: (slug: string) => void
}

/* ------------------------------ Atlas card ------------------------------ */

function AtlasCard({
  neighborhood,
  count,
  onExplore,
}: {
  neighborhood: NeighborhoodDTO
  count: number
  onExplore?: (slug: string) => void
}) {
  return (
    <button
      type="button"
      role="listitem"
      onClick={() => onExplore?.(neighborhood.slug)}
      aria-label={`Explore ${count > 0 ? count : 'new'} ${count === 1 ? 'property' : 'properties'} in ${neighborhood.name}`}
      className="card-modern group w-[240px] shrink-0 snap-start overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-sun sm:w-[280px]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={neighborhood.image}
          alt={`A signature view of ${neighborhood.name}, Nairobi`}
          fill
          sizes="(max-width: 640px) 240px, 280px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-brand shadow-sm backdrop-blur">
          {count > 0 ? `${count} ${count === 1 ? 'listing' : 'listings'}` : 'New'}
        </span>
      </div>

      <div className="p-4">
        <h3 className="flex items-center gap-1.5 text-base font-bold text-ink transition-colors group-hover:text-brand">
          <MapPin className="size-4 shrink-0 text-sun-deep" aria-hidden="true" />
          {neighborhood.name}
        </h3>
        <p className="mt-1 text-sm">
          <span className="font-bold text-sun-deep">
            {formatKes(neighborhood.avgPricePerSqm, { compact: true })}
          </span>
          <span className="text-muted-foreground"> avg/m²</span>
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
          Explore
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </p>
      </div>
    </button>
  )
}

/* -------------------------------- Section ------------------------------- */

export default function NeighborhoodGuide({
  neighborhoods,
  countsBySlug = {},
  loading = false,
  onExplore,
}: NeighborhoodGuideProps) {
  // Nothing to show and nothing on the way — let the parent skip the section.
  if (!loading && neighborhoods.length === 0) return null

  return (
    <Section tone="paper">
      <SectionHeading
        align="left"
        eyebrow="Locations"
        title={<>Explore Nairobi&rsquo;s most sought-after addresses</>}
        description="From the jacaranda lanes of Karen to the ridges of Runda — nine micro-markets, each tracked monthly by our own transaction desk. Swipe through and find your side of the city."
      />

      {loading ? (
        <div aria-hidden="true" className="-mx-4 flex gap-4 overflow-hidden px-4 sm:mx-0 sm:px-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer h-[320px] w-[240px] shrink-0 rounded-2xl sm:w-[280px]" />
          ))}
        </div>
      ) : (
        <div
          role="list"
          aria-label="Nairobi neighbourhoods"
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
        >
          {neighborhoods.map(n => (
            <AtlasCard
              key={n.slug}
              neighborhood={n}
              count={countsBySlug[n.slug] ?? 0}
              onExplore={onExplore}
            />
          ))}
        </div>
      )}
    </Section>
  )
}
