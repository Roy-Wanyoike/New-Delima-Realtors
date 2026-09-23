// Delima Realtors Platform 2.0 — home experience (classic edition)
// Redesign: classic estate-agency language inspired by onlyhomesproperties.co.ke —
// serif headlines with gold italic accents, integrated purpose/type/location
// search, ink-navy stats band, badge-adorned location cards, split why-us,
// testimonial carousel, gold CTA band. Sections are local subcomponents.
'use client'

import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  LineChart,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import type { FilterState, MarketPoint, PropertyType } from '@/lib/types'
import { PROPERTY_TYPES } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { useInsights, useProperties } from '@/hooks/use-delima-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NeighborhoodCard, PropertyMiniCard, SmartImage } from './mini-cards'
import type { NeighborhoodStat } from './mini-cards'
import Testimonials from './testimonials'
import NeighborhoodGuide from './neighborhood-guide'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop'

const WHY_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1400&auto=format&fit=crop'

const TYPE_LABELS: Record<PropertyType, string> = {
  APARTMENT: 'Apartment',
  VILLA: 'Villa',
  TOWNHOUSE: 'Townhouse',
  PENTHOUSE: 'Penthouse',
  OFFICE: 'Office',
  LAND: 'Land',
  COMMERCIAL: 'Commercial',
}

/* Classic badges per neighborhood slug (reference-style TRENDING/PREMIUM tags) */
const HOOD_BADGES: Record<string, string> = {
  karen: 'Signature',
  westlands: 'Trending',
  muthaiga: 'Prestige',
  runda: 'Family choice',
  kilimani: 'High yield',
  kileleshwa: 'Rising star',
  langata: 'Spacious',
  kitisuru: 'Quiet luxury',
  loresho: 'Garden living',
}

const VALUE_PROPS = [
  {
    icon: KeyRound,
    title: 'Off-market access',
    body: 'Quiet listings in Karen and Runda that never reach the portals — shared first with the Delima circle.',
  },
  {
    icon: ShieldCheck,
    title: 'Title due diligence',
    body: 'Every title is vetted by our legal desk before it reaches your shortlist, so you sign with total peace of mind.',
  },
  {
    icon: LineChart,
    title: 'Market intelligence',
    body: 'Twelve months of price-per-sqm data across nine neighbourhoods, distilled into advice you can act on.',
  },
]

/* ------------------------------------------------------------------ */
/* HomeView                                                            */
/* ------------------------------------------------------------------ */

export default function HomeView() {
  const { insights, neighborhoods } = useInsights()
  const { properties } = useProperties()
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)

  // Build per-neighborhood 12-month market series for the NeighborhoodGuide
  const marketStatsBySlug = useMemo(() => {
    const map: Record<string, MarketPoint[]> = {}
    if (insights?.neighborhoods) {
      for (const n of insights.neighborhoods) map[n.slug] = n.series
    }
    return map
  }, [insights])

  return (
    <div className="flex flex-col">
      <HeroSection />
      <StatsBand />
      <FeaturedSection />
      <LocationsSection />
      <WhyDelimaSection />
      <AIConciergeBand />
      {neighborhoods.length > 0 && (
        <NeighborhoodGuide
          neighborhoods={neighborhoods}
          marketStats={marketStatsBySlug}
          properties={properties}
          onExploreProperties={slug => setFilterAndGo({ neighborhood: slug }, 'properties')}
        />
      )}
      <Testimonials />
      <CtaBand />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function FadeUp({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function ErrorRetryCard({ message }: { message: string }) {
  return (
    <div className="luxury-shadow mx-auto flex max-w-xl flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
      <span className="gold-gradient-bg flex size-12 items-center justify-center rounded-full">
        <AlertTriangle className="size-5 text-[#1f1810]" aria-hidden="true" />
      </span>
      <h3 className="font-display text-xl">Something interrupted the view</h3>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button
        onClick={() => window.location.reload()}
        className="gold-gradient-bg min-h-[44px] px-6 font-semibold text-[#1f1810] hover:opacity-90"
      >
        <RotateCcw className="size-4" aria-hidden="true" /> Try again
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* HERO — classic: serif headline, dual CTA, integrated search card    */
/* ------------------------------------------------------------------ */

interface HeroSearch {
  status: 'ALL' | 'FOR_SALE' | 'FOR_RENT'
  type: PropertyType | 'ALL'
  neighborhood: string // slug or 'ALL'
}

function HeroSection() {
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)
  const { neighborhoods } = useInsights()
  const [search, setSearch] = useState<HeroSearch>({ status: 'ALL', type: 'ALL', neighborhood: 'ALL' })
  const [q, setQ] = useState('')

  const POPULAR = useMemo(
    () =>
      neighborhoods
        .filter(n => ['karen', 'runda', 'westlands', 'muthaiga', 'kilimani'].includes(n.slug))
        .concat(neighborhoods.filter(n => !['karen', 'runda', 'westlands', 'muthaiga', 'kilimani'].includes(n.slug)))
        .slice(0, 6),
    [neighborhoods],
  )

  function submitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const filters: Partial<FilterState> = {
      status: search.status,
      type: search.type,
      neighborhood: search.neighborhood,
      q,
    }
    setFilterAndGo(filters, 'properties')
  }

  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden">
      <SmartImage
        eager
        src={HERO_IMAGE}
        alt="Golden-hour view of a luxury Nairobi villa with a pool"
        className="absolute inset-0 h-full w-full"
        fallbackLabel="Delima"
      />
      {/* classic navy wash — deep on the left where the type sits, open on the right */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0a1626]/95 via-[#10233f]/75 to-[#10233f]/30"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/90 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs font-bold uppercase tracking-[0.3em] text-gold-soft"
          >
            Nairobi · Luxury &amp; Investment Property
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-display text-4xl leading-[1.1] text-white sm:text-6xl"
          >
            Homes of <span className="accent-italic">distinction</span> in the
            city&rsquo;s finest addresses
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base"
          >
            From leafy Karen villas to penthouses above Westlands, Delima curates
            Kenya&rsquo;s most exceptional residences — including off-market homes you
            will not find on any portal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button
              onClick={() => setFilterAndGo({}, 'properties')}
              className="gold-gradient-bg min-h-[48px] rounded-full px-8 font-semibold text-[#1f1810] hover:opacity-90"
            >
              Explore Properties
            </Button>
            <Button
              variant="outline"
              onClick={() => setFilterAndGo({}, 'agents')}
              className="min-h-[48px] rounded-full border-white/40 bg-white/5 px-8 text-white backdrop-blur hover:bg-white hover:text-espresso"
            >
              Speak to an Agent
            </Button>
          </motion.div>

          {/* integrated classic search card */}
          <motion.form
            onSubmit={submitSearch}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="luxury-shadow mt-10 grid grid-cols-1 gap-3 rounded-xl border border-white/20 bg-white/[0.08] p-3 backdrop-blur-xl sm:grid-cols-[1fr_1fr_1fr_auto]"
            aria-label="Property search"
          >
            <div>
              <label htmlFor="hero-purpose" className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-[0.22em] text-white/60">
                Purpose
              </label>
              <Select
                value={search.status}
                onValueChange={v => setSearch(s => ({ ...s, status: v as HeroSearch['status'] }))}
              >
                <SelectTrigger id="hero-purpose" className="h-11 min-h-[44px] border-white/25 bg-white/10 text-white data-[placeholder]:text-white/70">
                  <SelectValue placeholder="Any Purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Any Purpose</SelectItem>
                  <SelectItem value="FOR_SALE">Buy</SelectItem>
                  <SelectItem value="FOR_RENT">Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="hero-type" className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-[0.22em] text-white/60">
                Property Type
              </label>
              <Select
                value={search.type}
                onValueChange={v => setSearch(s => ({ ...s, type: v as HeroSearch['type'] }))}
              >
                <SelectTrigger id="hero-type" className="h-11 min-h-[44px] border-white/25 bg-white/10 text-white data-[placeholder]:text-white/70">
                  <SelectValue placeholder="Any Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Any Type</SelectItem>
                  {PROPERTY_TYPES.map(t => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="hero-location" className="mb-1.5 block text-[0.6rem] font-bold uppercase tracking-[0.22em] text-white/60">
                Location
              </label>
              <Select
                value={search.neighborhood}
                onValueChange={v => setSearch(s => ({ ...s, neighborhood: v }))}
              >
                <SelectTrigger id="hero-location" className="h-11 min-h-[44px] border-white/25 bg-white/10 text-white data-[placeholder]:text-white/70">
                  <SelectValue placeholder="Any Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Any Location</SelectItem>
                  {neighborhoods.map(n => (
                    <SelectItem key={n.slug} value={n.slug}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                className="gold-gradient-bg h-11 min-h-[44px] w-full gap-2 rounded-md px-6 font-semibold text-[#1f1810] hover:opacity-90 sm:w-auto"
              >
                <Search className="size-4" aria-hidden="true" /> Search
              </Button>
            </div>
            {/* free-text search row (hidden submit keeps Enter working) */}
            <Input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Or search 'villa in Karen with pool'…"
              aria-label="Search properties by keyword"
              className="h-11 min-h-[44px] border-white/25 bg-white/10 text-white placeholder:text-white/50 sm:col-span-4"
            />
          </motion.form>

          {/* popular areas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2"
          >
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-white/50">
              Popular:
            </span>
            {POPULAR.map(n => (
              <button
                key={n.slug}
                type="button"
                onClick={() => setFilterAndGo({ neighborhood: n.slug }, 'properties')}
                className="min-h-[36px] border-b border-transparent pb-0.5 text-sm font-medium text-white/80 underline-offset-4 transition-colors hover:border-gold hover:text-gold-soft"
              >
                {n.name}
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* STATS BAND — ink navy with gold serif numerals                      */
/* ------------------------------------------------------------------ */

function BandStat({ value, label, loading }: { value: string; label: string; loading?: boolean }) {
  return (
    <div className="flex min-w-[150px] flex-1 flex-col items-center gap-2 text-center">
      {loading ? (
        <span className="shimmer h-10 w-28 rounded-md" aria-hidden="true" />
      ) : (
        <span className="font-display text-3xl text-gold-soft md:text-4xl">{value}</span>
      )}
      <span className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-white/55">
        {label}
      </span>
    </div>
  )
}

function StatsBand() {
  const { properties, loading } = useProperties()
  const { insights, neighborhoods, loading: hoodsLoading } = useInsights()

  const portfolioBn = useMemo(() => {
    const total = properties.reduce((sum, p) => sum + p.priceKes, 0)
    return total > 0 ? (total / 1e9).toFixed(1) : null
  }, [properties])

  const dataMonths = insights?.neighborhoods[0]?.series.length ?? 0

  return (
    <section className="border-y border-gold/25 bg-ink py-10 dark:bg-[#0d1b30]" aria-label="Delima at a glance">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-center gap-x-8 gap-y-8 px-4 sm:px-6 md:gap-x-14 lg:px-8">
        <BandStat
          value={String(properties.length)}
          label="Curated Residences"
          loading={loading && properties.length === 0}
        />
        <BandStat
          value={String(neighborhoods.length || 9)}
          label="Signature Neighborhoods"
          loading={hoodsLoading && neighborhoods.length === 0}
        />
        <BandStat
          value={portfolioBn ? `KES ${portfolioBn}B+` : 'KES 2B+'}
          label="Portfolio Under Our Care"
          loading={loading && properties.length === 0}
        />
        <BandStat value={dataMonths ? `${dataMonths} Months` : '12 Months'} label="Of Market Data" />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* FEATURED RESIDENCES                                                 */
/* ------------------------------------------------------------------ */

function FeaturedSection() {
  const { properties, loading, error } = useProperties()
  const setView = useAppStore(s => s.setView)
  const featured = useMemo(() => properties.filter(p => p.featured), [properties])
  const rowRef = useRef<HTMLDivElement>(null)

  function scrollRow(dir: -1 | 1) {
    rowRef.current?.scrollBy({ left: dir * 344, behavior: 'smooth' })
  }

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Featured Properties</p>
            <h2 className="gold-underline mt-3 font-display text-3xl md:text-4xl">
              Handpicked homes worth discovering
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden gap-2 sm:flex">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollRow(-1)}
                aria-label="Scroll featured residences left"
                className="size-11 rounded-full border-gold/40 text-gold-deep hover:bg-gold hover:text-[#1f1810] dark:text-gold dark:hover:text-[#17110b]"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollRow(1)}
                aria-label="Scroll featured residences right"
                className="size-11 rounded-full border-gold/40 text-gold-deep hover:bg-gold hover:text-[#1f1810] dark:text-gold dark:hover:text-[#17110b]"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setView('properties')}
              className="min-h-[44px] rounded-full border-espresso/25 dark:border-white/25"
            >
              View All Properties
            </Button>
          </div>
        </FadeUp>

        {error ? (
          <FadeUp className="mt-10">
            <ErrorRetryCard message={error} />
          </FadeUp>
        ) : loading ? (
          <div className="mt-10 flex gap-5 overflow-hidden" aria-hidden="true">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="shimmer h-44 w-[300px] shrink-0 rounded-xl sm:w-[340px]" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            New signature residences are being curated — check back shortly.
          </p>
        ) : (
          <div
            ref={rowRef}
            className="delima-scroll -mx-4 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0"
          >
            {featured.map(p => (
              <div key={p.slug} className="w-[300px] shrink-0 snap-start sm:w-[340px]">
                <PropertyMiniCard property={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* LOCATIONS — image cards with classic badges + live counts           */
/* ------------------------------------------------------------------ */

function LocationsSection() {
  const { insights, neighborhoods, loading, error } = useInsights()
  const { properties } = useProperties()

  const statBySlug = useMemo(() => {
    const map = new Map<string, NeighborhoodStat>()
    insights?.neighborhoods.forEach(n =>
      map.set(n.slug, { latestYoY: n.latestYoY, avgPricePerSqm: n.avgPricePerSqm }),
    )
    return map
  }, [insights])

  const countBySlug = useMemo(() => {
    const map = new Map<string, number>()
    properties.forEach(p => map.set(p.neighborhoodSlug, (map.get(p.neighborhoodSlug) ?? 0) + 1))
    return map
  }, [properties])

  return (
    <section className="bg-sand/60 py-16 md:py-24 dark:bg-sand/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="max-w-2xl">
          <p className="eyebrow">Where we operate</p>
          <h2 className="gold-underline mt-3 font-display text-3xl md:text-4xl">
            Explore Nairobi&rsquo;s most sought-after addresses
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            From the jacaranda lanes of Karen to the towers of Westlands — discover
            prime neighbourhoods where your next chapter awaits, each with live
            pricing and handpicked homes.
          </p>
        </FadeUp>

        {error ? (
          <FadeUp className="mt-10">
            <ErrorRetryCard message={error} />
          </FadeUp>
        ) : loading ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="shimmer h-64 rounded-xl" />
            ))}
          </div>
        ) : (
          <FadeUp className="mt-10">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
              {neighborhoods.map(n => (
                <NeighborhoodCard
                  key={n.slug}
                  neighborhood={n}
                  stat={statBySlug.get(n.slug)}
                  badge={HOOD_BADGES[n.slug]}
                  count={countBySlug.get(n.slug)}
                />
              ))}
            </div>
          </FadeUp>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* WHY DELIMA — classic split: image left, checklist right             */
/* ------------------------------------------------------------------ */

function WhyDelimaSection() {
  const setView = useAppStore(s => s.setView)

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <FadeUp className="relative">
          <div className="luxury-shadow overflow-hidden rounded-xl border">
            <SmartImage
              src={WHY_IMAGE}
              alt="Keys handed over at a Delima residence"
              fallbackLabel="Delima"
              className="h-[420px] w-full"
            />
          </div>
          {/* classic gold corner frame accent */}
          <div
            aria-hidden="true"
            className="absolute -bottom-4 -right-4 -z-10 hidden h-40 w-40 rounded-xl border-2 border-gold/50 md:block"
          />
          <div
            aria-hidden="true"
            className="absolute -left-4 -top-4 -z-10 hidden h-40 w-40 rounded-xl border-2 border-gold/50 md:block"
          />
        </FadeUp>

        <div>
          <FadeUp>
            <p className="eyebrow">Why Delima</p>
            <h2 className="gold-underline mt-3 font-display text-3xl md:text-4xl">
              A partner you can trust with life&rsquo;s biggest decision
            </h2>
          </FadeUp>
          <ul className="mt-8 space-y-6">
            {VALUE_PROPS.map((v, i) => {
              const Icon = v.icon
              return (
                <FadeUp key={v.title} delay={i * 0.08}>
                  <li className="flex gap-4">
                    <span className="gold-gradient-bg flex size-11 shrink-0 items-center justify-center rounded-full">
                      <Check className="size-5 text-[#1f1810]" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-display text-xl">{v.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                        {v.body}
                      </span>
                    </span>
                  </li>
                </FadeUp>
              )
            })}
          </ul>
          <FadeUp delay={0.3}>
            <Button
              variant="outline"
              onClick={() => setView('agents')}
              className="mt-9 min-h-[44px] rounded-full border-espresso/25 px-7 dark:border-white/25"
            >
              Meet the team
            </Button>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* AI CONCIERGE BAND                                                   */
/* ------------------------------------------------------------------ */

function AIConciergeBand() {
  const setAssistantOpen = useAppStore(s => s.setAssistantOpen)

  return (
    <section className="border-y border-gold/20 bg-espresso dark:bg-espresso-soft">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between md:py-16 lg:px-8">
        <FadeUp>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold-soft">
            Delima AI · Always On
          </p>
          <h2 className="mt-3 font-display text-3xl text-[#f0e9dc] md:text-4xl">
            Meet your AI property concierge
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#f0e9dc]/70">
            &ldquo;A four-bedroom villa in Karen under 60 million, with a pool&rdquo; — say it in
            plain words and watch curated matches appear in seconds.
          </p>
        </FadeUp>
        <FadeUp delay={0.1} className="shrink-0">
          <Button
            onClick={() => setAssistantOpen(true)}
            className="gold-gradient-bg min-h-[48px] px-7 font-semibold text-[#1f1810] hover:opacity-90"
          >
            <Sparkles className="size-4" aria-hidden="true" /> Ask Delima AI
          </Button>
        </FadeUp>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* CTA BAND — classic gold plaque before the footer                    */
/* ------------------------------------------------------------------ */

function CtaBand() {
  const setView = useAppStore(s => s.setView)

  return (
    <section className="gold-gradient-bg" aria-labelledby="cta-heading">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between md:py-16 lg:px-8">
        <FadeUp>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#5c4a10]">
            Ready to take the next step?
          </p>
          <h2 id="cta-heading" className="mt-3 max-w-xl font-display text-3xl text-[#2a2110] md:text-4xl">
            Let&rsquo;s help you find a place you&rsquo;ll love to call home
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#2a2110]/75">
            Speak to a specialist today — verified titles, off-market access, and
            honest guidance from the first call to the final signature.
          </p>
        </FadeUp>
        <FadeUp delay={0.1} className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <Button
            variant="outline"
            asChild
            className="min-h-[48px] rounded-full border-[#2a2110]/40 bg-transparent px-7 text-[#2a2110] hover:bg-[#2a2110] hover:text-gold-soft"
          >
            <a href="tel:+254727523752" aria-label="Call Delima Realtors on +254 727 523 752">
              <Phone className="size-4" aria-hidden="true" /> +254 727 523 752
            </a>
          </Button>
          <Button
            onClick={() => setView('properties')}
            className="min-h-[48px] rounded-full bg-espresso px-7 font-semibold text-gold-soft hover:bg-black"
          >
            Browse Properties
          </Button>
        </FadeUp>
      </div>
    </section>
  )
}
