// Delima Realtors 3.0 — home experience
// Owner: REV-2 (homepage engineer).
// Default export: HomeView. A mobile-first, single-page homepage composed of:
//   1. full-bleed hero with floating search card   5. neighbourhoods atlas (./neighborhood-guide)
//   2. live stats strip (overlapping hero)         6. why-Delima feature grid
//   3. featured listings grid                      7. client stories (./testimonials)
//   4. buy / rent split                            8. AI concierge band
//                                                  9. closing CTA banner
// All sections handle loading skeletons and empty data gracefully (DB may be
// empty while another agent seeds).
'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Handshake,
  Home,
  KeyRound,
  LineChart,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from 'lucide-react'
import type { PropertyType } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { useInsights, useProperties } from '@/hooks/use-delima-data'
import { formatKes, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Container, EmptyState, Reveal, Section, SectionHeading, StatBlock } from './ui-kit'
import { PropertyCard, PropertyCardSkeleton } from './property-card'
import Testimonials from './testimonials'
import NeighborhoodGuide from './neighborhood-guide'

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2400&auto=format&fit=crop'

const BUY_IMAGE =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1600&auto=format&fit=crop'

const RENT_IMAGE =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop'

const SUPPORT_PHONE = '+254727523752'
const SUPPORT_PHONE_LABEL = '+254 727 523 752'

const BUDGET_OPTIONS = [5_000_000, 10_000_000, 25_000_000, 50_000_000, 100_000_000] as const

const TYPE_OPTIONS: Array<{ value: PropertyType; label: string }> = [
  { value: 'TOWNHOUSE', label: 'Houses & townhouses' },
  { value: 'VILLA', label: 'Villas' },
  { value: 'APARTMENT', label: 'Apartments' },
  { value: 'PENTHOUSE', label: 'Penthouses' },
  { value: 'LAND', label: 'Land' },
]

const TRUST_CHIPS = [
  { icon: ShieldCheck, label: 'Title-checked listings' },
  { icon: BadgeCheck, label: 'Verified owners' },
  { icon: KeyRound, label: 'End-to-end support' },
] as const

const EASE = [0.22, 1, 0.36, 1] as const

/* ------------------------------------------------------------------ */
/* 1. HERO                                                             */
/* ------------------------------------------------------------------ */

function SearchTrigger({ icon: Icon, children, label }: { icon: typeof MapPin; children: React.ReactNode; label: string }) {
  return (
    <SelectTrigger
      aria-label={label}
      className="h-11 min-h-[44px] w-full rounded-xl border-line bg-white text-sm font-medium text-ink"
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0 text-brand" aria-hidden="true" />
        <SelectValue />
      </span>
    </SelectTrigger>
  )
}

function HeroSearchCard() {
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)
  const { neighborhoods, loading: hoodsLoading } = useInsights()

  const [location, setLocation] = useState('ALL')
  const [type, setType] = useState('ALL')
  const [budget, setBudget] = useState('ALL')

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFilterAndGo(
      {
        neighborhood: location,
        type: type === 'ALL' ? 'ALL' : (type as PropertyType),
        maxPrice: budget === 'ALL' ? null : Number(budget),
      },
      'properties',
    )
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-3 shadow-xl">
      <div className="grid gap-2 sm:grid-cols-4">
        {hoodsLoading && neighborhoods.length === 0 ? (
          <div className="shimmer h-11 min-h-[44px] rounded-xl" aria-hidden="true" />
        ) : (
          <Select value={location} onValueChange={setLocation}>
            <SearchTrigger icon={MapPin} label="Location">
              <SelectValue />
            </SearchTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Nairobi</SelectItem>
              {neighborhoods.map(n => (
                <SelectItem key={n.slug} value={n.slug}>
                  {n.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={type} onValueChange={setType}>
          <SearchTrigger icon={Building2} label="Property type">
            <SelectValue />
          </SearchTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any type</SelectItem>
            {TYPE_OPTIONS.map(t => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={budget} onValueChange={setBudget}>
          <SearchTrigger icon={Wallet} label="Maximum budget">
            <SelectValue />
          </SearchTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any budget</SelectItem>
            {BUDGET_OPTIONS.map(v => (
              <SelectItem key={v} value={String(v)}>
                {formatKes(v, { compact: true })}
                {v === BUDGET_OPTIONS[BUDGET_OPTIONS.length - 1] ? '+' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="submit"
          className="btn-sun inline-flex h-11 min-h-[44px] items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold"
        >
          <Search className="size-4" aria-hidden="true" />
          Search
        </button>
      </div>
    </form>
  )
}

function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-center">
      <Image
        src={HERO_IMAGE}
        alt="Modern Nairobi home with floor-to-ceiling glass glowing at dusk"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-brand-deep/85 via-brand-deep/50 to-transparent"
      />

      <Container className="relative z-10 py-24 sm:py-28">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="text-xs font-bold uppercase tracking-[0.28em] text-sun"
          >
            Nairobi&rsquo;s Trusted Realtors
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: EASE }}
            className="mt-4 text-4xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Find a home <span className="text-sun">worthy of your next chapter</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16, ease: EASE }}
            className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
          >
            Title-checked villas, apartments and land across Nairobi&rsquo;s finest neighbourhoods
            &mdash; with honest pricing, verified owners and a team that carries the process from
            first viewing to final signature.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.26, ease: EASE }}
          className="mt-8 max-w-3xl"
        >
          <HeroSearchCard />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {TRUST_CHIPS.map(chip => {
              const Icon = chip.icon
              return (
                <span
                  key={chip.label}
                  className="inline-flex min-h-[36px] items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur sm:text-sm"
                >
                  <Icon className="size-4 shrink-0 text-sun" aria-hidden="true" />
                  {chip.label}
                </span>
              )
            })}
          </div>
        </motion.div>
      </Container>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 2. STATS STRIP (overlaps hero bottom edge)                          */
/* ------------------------------------------------------------------ */

function StatsStrip() {
  const { properties } = useProperties()
  const { neighborhoods } = useInsights()

  const agents = useMemo(
    () => new Set(properties.map(p => p.agent.id)).size,
    [properties],
  )
  const avgRating = useMemo(
    () => (properties.length ? properties.reduce((s, p) => s + p.rating, 0) / properties.length : 0),
    [properties],
  )

  return (
    <Container className="relative z-20 -mt-10">
      <Reveal>
        <div className="card-modern soft-shadow grid grid-cols-2 gap-2 p-3 sm:p-4 lg:grid-cols-4 lg:gap-3">
          <StatBlock
            icon={Building2}
            value={properties.length ? formatNumber(properties.length) : '60+'}
            label="Live listings"
          />
          <StatBlock
            icon={MapPin}
            value={neighborhoods.length || 9}
            label="Neighbourhoods"
          />
          <StatBlock
            icon={Star}
            value={avgRating ? avgRating.toFixed(1) : '4.9'}
            label="Average rating"
          />
          <StatBlock icon={Users} value={agents || 6} label="Expert agents" />
        </div>
      </Reveal>
    </Container>
  )
}

/* ------------------------------------------------------------------ */
/* 3. FEATURED LISTINGS                                                */
/* ------------------------------------------------------------------ */

function FeaturedListings() {
  const { properties, loading, error } = useProperties()
  const setView = useAppStore(s => s.setView)

  const featured = useMemo(
    () => properties.filter(p => p.featured && p.status !== 'SOLD').slice(0, 6),
    [properties],
  )

  return (
    <Section tone="paper">
      <SectionHeading
        eyebrow="Featured"
        title="Handpicked homes worth discovering"
        description="A shortlist from our listing desk — each one title-checked, professionally photographed and priced against live market data."
      />

      {loading ? (
        <div
          aria-hidden="true"
          className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : featured.length === 0 ? (
        <EmptyState
          icon={Home}
          title={error ? 'We could not load listings' : 'Featured homes are being curated'}
          description={
            error ??
            'Our listing desk is photographing new residences right now — browse the full collection in the meantime.'
          }
          className="bg-white"
          action={
            <Button
              type="button"
              size="lg"
              onClick={() => setView('properties')}
              className="h-11 min-h-[44px] rounded-xl px-7 font-bold"
            >
              View all properties
            </Button>
          }
        />
      ) : (
        <>
          <Reveal className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(p => (
              <PropertyCard key={p.slug} property={p} />
            ))}
          </Reveal>

          <Reveal delay={0.1} className="mt-10 text-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setView('properties')}
              className="h-11 min-h-[44px] rounded-xl border-line px-8 font-bold text-brand hover:bg-brand-soft"
            >
              View all properties
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </Reveal>
        </>
      )}
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* 4. BUY / RENT SPLIT                                                 */
/* ------------------------------------------------------------------ */

function DealTypeCard({
  image,
  alt,
  eyebrow,
  title,
  copy,
  onClick,
}: {
  image: string
  alt: string
  eyebrow: string
  title: string
  copy: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block h-72 w-full overflow-hidden rounded-3xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun sm:h-96"
    >
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-brand-deep/90 via-brand-deep/40 to-brand-deep/10 transition-opacity group-hover:opacity-95"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-sun">{eyebrow}</p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {title}
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">{copy}</p>
        </div>
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sun text-brand-deep transition-transform duration-300 group-hover:translate-x-1.5"
        >
          <ArrowRight className="size-5" />
        </span>
      </div>
    </button>
  )
}

function BuyRentSplit() {
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)

  return (
    <Section tone="white">
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Reveal className="h-full">
          <DealTypeCard
            image={BUY_IMAGE}
            alt="Standalone family home with a manicured lawn"
            eyebrow="For sale"
            title="Buy a home"
            copy="Villas, townhouses and land — every title vetted by our legal desk before it reaches your shortlist."
            onClick={() => setFilterAndGo({ status: 'FOR_SALE' }, 'properties')}
          />
        </Reveal>
        <Reveal delay={0.08} className="h-full">
          <DealTypeCard
            image={RENT_IMAGE}
            alt="Bright modern apartment living room"
            eyebrow="For rent"
            title="Rent a home"
            copy="Furnished and long-let apartments in the city's best-connected neighbourhoods — move-in ready."
            onClick={() => setFilterAndGo({ status: 'FOR_RENT' }, 'properties')}
          />
        </Reveal>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* 6. WHY DELIMA                                                       */
/* ------------------------------------------------------------------ */

const WHY_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Verified, title-checked listings',
    body: 'Every home on Delima is vetted by our legal desk — clean titles, verified owners and honest photos before it reaches your shortlist.',
  },
  {
    icon: Handshake,
    title: 'End-to-end, in one place',
    body: 'Search, viewings, negotiation, lawyers and handover — one dedicated team coordinates the entire journey from first click to final key.',
  },
  {
    icon: LineChart,
    title: 'Honest market guidance',
    body: 'We price from real Nairobi transaction data across nine micro-markets, so your offer is grounded in facts — never portal hype.',
  },
  {
    icon: Sparkles,
    title: 'AI-powered concierge',
    body: 'Describe your dream home in plain words and get a curated shortlist in seconds — answers day or night, even at 2am.',
  },
] as const

function WhyDelima() {
  return (
    <Section tone="white">
      <SectionHeading
        eyebrow="Why Delima"
        title="A realtor that does the heavy lifting"
        description="Four reasons families, investors and businesses across Nairobi start their property journey with us."
      />

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {WHY_POINTS.map((point, i) => {
          const Icon = point.icon
          return (
            <Reveal key={point.title} delay={i * 0.06} className="h-full">
              <div className="card-modern h-full p-6">
                <span
                  className={cn(
                    'flex size-12 items-center justify-center rounded-2xl',
                    i % 2 === 1 ? 'bg-sun-soft text-sun-deep' : 'bg-brand-soft text-brand',
                  )}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold leading-snug text-ink">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.body}</p>
              </div>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* 8. AI CONCIERGE BAND                                                */
/* ------------------------------------------------------------------ */

function AIConciergeBand() {
  const setAssistantOpen = useAppStore(s => s.setAssistantOpen)

  return (
    <Section tone="paper">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-12 sm:px-10 sm:py-16">
          <div aria-hidden="true" className="absolute -right-24 -top-24 size-80 rounded-full bg-sun/15 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-32 -left-16 size-80 rounded-full bg-brand-mid/60 blur-3xl" />

          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-sun/20 text-sun">
                <Sparkles className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                Meet Delima AI, your 24/7 property concierge
              </h2>
              <p className="mt-3 text-base leading-relaxed text-white/75">
                &ldquo;A four-bedroom villa in Karen under KES 60 million, with a pool&rdquo; &mdash;
                describe what you need in plain words and watch a curated, title-checked shortlist
                appear in seconds.
              </p>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setAssistantOpen(true)}
                className="btn-sun inline-flex h-12 min-h-[48px] items-center gap-2 rounded-xl px-7 text-base font-bold"
              >
                Ask Delima AI
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* 9. CLOSING CTA BANNER                                               */
/* ------------------------------------------------------------------ */

function ClosingCta() {
  const setView = useAppStore(s => s.setView)

  return (
    <Section tone="white">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Home className="size-7" aria-hidden="true" />
        </span>
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Let&rsquo;s help you find a place you&rsquo;ll love to call home.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Talk to a Delima agent today — honest advice, zero pressure, and a shortlist within 24
          hours.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            size="lg"
            onClick={() => setView('properties')}
            className="h-12 min-h-[44px] rounded-xl px-8 text-base font-bold"
          >
            Explore properties
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 min-h-[44px] rounded-xl border-line px-8 text-base font-bold text-brand hover:bg-brand-soft"
          >
            <a href={`tel:${SUPPORT_PHONE}`}>
              <Phone className="size-4" aria-hidden="true" />
              Call {SUPPORT_PHONE_LABEL}
            </a>
          </Button>
        </div>
      </Reveal>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* HomeView                                                            */
/* ------------------------------------------------------------------ */

export default function HomeView() {
  const { neighborhoods, loading: hoodsLoading } = useInsights()
  const { properties } = useProperties()
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)

  // Live listing counts per neighbourhood slug for the atlas cards.
  const countsBySlug = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of properties) {
      map[p.neighborhoodSlug] = (map[p.neighborhoodSlug] ?? 0) + 1
    }
    return map
  }, [properties])

  return (
    <div className="flex flex-col">
      <Hero />
      <StatsStrip />
      <FeaturedListings />
      <BuyRentSplit />
      <NeighborhoodGuide
        neighborhoods={neighborhoods}
        countsBySlug={countsBySlug}
        loading={hoodsLoading}
        onExplore={slug => setFilterAndGo({ neighborhood: slug }, 'properties')}
      />
      <WhyDelima />
      <Testimonials />
      <AIConciergeBand />
      <ClosingCta />
    </div>
  )
}
