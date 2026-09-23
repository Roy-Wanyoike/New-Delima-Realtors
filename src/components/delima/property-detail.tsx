'use client'

// Delima Realtors Platform 2.0 — residence detail (Task 5-b)
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CalendarClock,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Heart,
  Home,
  Mail,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  Ruler,
  Scale,
  Share2,
  Star,
  Tag,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useProperties } from '@/hooks/use-delima-data'
import { useAppStore } from '@/lib/store'
import {
  formatKes,
  formatNumber,
  formatPriceForStatus,
  formatSqm,
  formatDate,
  statusLabel,
  typeLabel,
  whatsappLink,
} from '@/lib/format'
import type { LucideIcon } from 'lucide-react'
import type { PropertyDTO, PropertyStatus } from '@/lib/types'
import { cn, fetchWithTimeout } from '@/lib/utils'
import { PropertyCard } from './property-card'

/* ---------- helpers ---------- */

function statusBadgeClass(status: PropertyStatus): string {
  switch (status) {
    case 'FOR_SALE':
      return 'gold-gradient-bg border-transparent text-espresso'
    case 'FOR_RENT':
      return 'border-transparent bg-espresso/80 text-cream dark:text-[#f0e9dc]'
    case 'NEW_DEVELOPMENT':
      return 'border-gold/60 bg-background/70 text-gold-deep dark:text-gold'
    case 'SOLD':
      return 'border-transparent bg-espresso text-cream dark:text-[#f0e9dc]'
  }
}

function GoldButton({
  children,
  onClick,
  disabled,
  className,
  ariaLabel,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 gold-gradient-bg text-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {children}
    </button>
  )
}

/* ---------- viewing request dialog ---------- */

interface ViewingForm {
  name: string
  email: string
  phone: string
  date: string
  message: string
}

const EMPTY_FORM: ViewingForm = { name: '', email: '', phone: '', date: '', message: '' }

function ViewingDialog({
  property,
  open,
  onOpenChange,
}: {
  property: PropertyDTO
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { toast } = useToast()
  const [form, setForm] = useState<ViewingForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) setForm(EMPTY_FORM)
  }, [open])

  const valid =
    form.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.phone.trim().length >= 7

  const set = (patch: Partial<ViewingForm>) => setForm(f => ({ ...f, ...patch }))

  async function submit() {
    if (!valid || submitting) return
    setSubmitting(true)
    const message = [
      form.message.trim(),
      form.date ? `Preferred viewing date: ${form.date}` : '',
    ]
      .filter(Boolean)
      .join(' — ')
    try {
      const res = await fetchWithTimeout('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message,
          propertyId: property.id,
          source: 'VIEWING_REQUEST',
          budgetKes: null,
        }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      toast({
        title: 'Viewing requested',
        description: `${property.agent.name} will be in touch shortly to confirm ${property.title}.`,
      })
      onOpenChange(false)
    } catch {
      toast({
        variant: 'destructive',
        title: 'Request not sent',
        description: 'We could not reach the concierge desk. Please try again or WhatsApp the agent.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl md:text-2xl">Request a Private Viewing</DialogTitle>
          <DialogDescription>
            {property.title} · {property.neighborhood} — {formatPriceForStatus(property.priceKes, property.status)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="vr-name">Full name *</Label>
              <Input
                id="vr-name"
                value={form.name}
                onChange={e => set({ name: e.target.value })}
                placeholder="Amina Wanjiru"
                autoComplete="name"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="vr-phone">Phone *</Label>
              <Input
                id="vr-phone"
                type="tel"
                value={form.phone}
                onChange={e => set({ phone: e.target.value })}
                placeholder="+254 7…"
                autoComplete="tel"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="vr-email">Email *</Label>
              <Input
                id="vr-email"
                type="email"
                value={form.email}
                onChange={e => set({ email: e.target.value })}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="vr-date">Preferred date</Label>
              <Input
                id="vr-date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={form.date}
                onChange={e => set({ date: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="vr-message">Message</Label>
            <Textarea
              id="vr-message"
              value={form.message}
              onChange={e => set({ message: e.target.value })}
              placeholder="Anything our agent should prepare for your visit…"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <GoldButton onClick={submit} disabled={!valid || submitting} ariaLabel="Submit viewing request">
            {submitting ? 'Sending…' : 'Send request'}
          </GoldButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- gallery ---------- */

function Gallery({ property }: { property: PropertyDTO }) {
  const [idx, setIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [errors, setErrors] = useState<Record<number, boolean>>({})
  const [lastSlug, setLastSlug] = useState(property.slug)

  // Reset gallery state when switching properties (derive during render)
  if (property.slug !== lastSlug) {
    setLastSlug(property.slug)
    setIdx(0)
    setLightbox(false)
    setErrors({})
  }

  const images = property.images
  const hasImages = images.length > 0
  const current = hasImages ? images[Math.min(idx, images.length - 1)] : undefined
  const currentBroken = hasImages && errors[idx]

  const go = (dir: 1 | -1) => {
    if (!hasImages) return
    setIdx(i => (i + dir + images.length) % images.length)
  }

  return (
    <section aria-label={`Gallery for ${property.title}`} className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border bg-sand luxury-shadow dark:bg-espresso-soft">
        <div className="aspect-[16/10] w-full">
          {hasImages && current && !currentBroken ? (
            <img
              src={current}
              alt={`${property.title} — image ${idx + 1} of ${images.length}`}
              loading="lazy"
              onError={() => setErrors(e => ({ ...e, [idx]: true }))}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex h-full w-full flex-col items-center justify-center gap-3 gold-gradient-bg text-espresso/70"
            >
              <Home className="size-10" />
              <span className="font-display text-base tracking-wide">Delima Realtors</span>
            </div>
          )}
        </div>

        {hasImages && (
          <>
            <button
              type="button"
              aria-label="Open image fullscreen"
              onClick={() => setLightbox(true)}
              className="absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            />
            <button
              type="button"
              aria-label="View fullscreen"
              onClick={() => setLightbox(true)}
              className="absolute bottom-3 right-3 flex size-11 items-center justify-center rounded-full border border-white/30 bg-background/70 shadow-sm backdrop-blur-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Maximize2 className="size-4" aria-hidden />
            </button>
            <span className="absolute bottom-3 left-3 rounded-full bg-espresso/80 px-3 py-1 text-xs font-medium text-cream dark:text-[#f0e9dc] backdrop-blur-sm">
              {idx + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {hasImages && images.length > 1 && (
        <div className="delima-scroll flex gap-2.5 overflow-x-auto pb-1" role="tablist" aria-label="Gallery thumbnails">
          {images.map((src, i) => (
            <button
              key={`${src.slice(0, 48)}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === idx}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setIdx(i)}
              className={cn(
                'size-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                i === idx ? 'border-gold ring-2 ring-gold/40' : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              {errors[i] ? (
                <span aria-hidden className="flex size-full items-center justify-center gold-gradient-bg text-espresso">
                  <Home className="size-5" />
                </span>
              ) : (
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  onError={() => setErrors(e => ({ ...e, [i]: true }))}
                  className="size-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent
          aria-label="Fullscreen gallery image"
          className="w-[calc(100vw-2rem)] max-w-5xl overflow-hidden border-gold/30 bg-espresso p-0 text-cream sm:p-0 dark:bg-espresso-soft"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              {property.title} — image {idx + 1} of {Math.max(images.length, 1)}
            </DialogTitle>
            <DialogDescription>Fullscreen gallery view</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <div className="flex max-h-[78vh] items-center justify-center bg-black/40">
              {current && !currentBroken ? (
                <img
                  src={current}
                  alt={`${property.title} fullscreen — image ${idx + 1}`}
                  className="max-h-[78vh] w-full object-contain"
                />
              ) : (
                <div aria-hidden className="flex h-[50vh] w-full items-center justify-center gold-gradient-bg text-espresso/70">
                  <Home className="size-10" />
                </div>
              )}
            </div>
            {hasImages && images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-espresso/70 text-cream backdrop-blur-sm transition-colors hover:bg-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-espresso/70 text-cream backdrop-blur-sm transition-colors hover:bg-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </>
            )}
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-cream backdrop-blur-sm">
              {idx + 1} / {Math.max(images.length, 1)}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

/* ---------- JSON-LD structured data (SEO) ---------- */

/**
 * Builds a Schema.org JSON-LD object for the property detail page so Google
 * can render rich results (price, beds/baths, geo, availability) in SERPs.
 * Uses a stable canonical URL based on the slug (not window.location.href) so
 * the markup is identical on server and client — no hydration mismatch.
 */
function buildJsonLd(p: PropertyDTO): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Product', 'RealEstateListing'],
    name: p.title,
    description: p.description,
    url: `https://delima.co.ke/property/${p.slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://delima.co.ke/property/${p.slug}`,
    },
    image: p.images,
    category: typeLabel[p.type],
    offers: {
      '@type': 'Offer',
      price: p.priceKes,
      priceCurrency: 'KES',
      availability:
        p.status === 'SOLD'
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: p.address,
      addressLocality: p.neighborhood,
      addressRegion: 'Nairobi',
      addressCountry: 'KE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: p.lat,
      longitude: p.lng,
    },
    numberOfRooms: p.bedrooms,
    numberOfBathroomsTotal: p.bathrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: p.sqm,
      unitCode: 'MTK',
    },
  }

  if (p.yearBuilt > 0) schema.yearBuilt = p.yearBuilt
  if (p.rating > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: p.rating,
      reviewCount: Math.max(1, p.views),
    }
  }

  return schema
}

/* ---------- main ---------- */

export default function PropertyDetail() {
  const activeSlug = useAppStore(s => s.activeSlug)
  const setView = useAppStore(s => s.setView)
  const goHome = useAppStore(s => s.goHome)
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)
  const favorites = useAppStore(s => s.favorites)
  const toggleFavorite = useAppStore(s => s.toggleFavorite)
  const compare = useAppStore(s => s.compare)
  const toggleCompare = useAppStore(s => s.toggleCompare)
  const { properties, loading, error } = useProperties()
  const { toast } = useToast()
  const [viewingOpen, setViewingOpen] = useState(false)

  const property = useMemo(
    () => properties.find(p => p.slug === activeSlug) ?? null,
    [properties, activeSlug],
  )

  const isFav = property ? favorites.includes(property.slug) : false
  const isComp = property ? compare.includes(property.slug) : false

  const similar = useMemo(() => {
    if (!property) return []
    return properties
      .filter(p => p.neighborhoodSlug === property.neighborhoodSlug && p.slug !== property.slug)
      .slice(0, 3)
  }, [properties, property])

  // Schema.org JSON-LD structured data (SEO + Google rich-result eligibility).
  // Computed unconditionally (before early returns) so hook order is stable.
  const jsonLd = useMemo(() => (property ? buildJsonLd(property) : null), [property])

  /* --- no slug --- */
  if (!activeSlug) {
    return (
      <StatePanel
        icon={<Home className="size-8" aria-hidden />}
        title="No property selected"
        body="Choose a residence from the collection to see its full story."
        action={
          <Button onClick={() => setView('properties')} className="h-11 gap-2 gold-gradient-bg text-espresso hover:opacity-90" style={{ color: 'var(--espresso)' }}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to the Collection
          </Button>
        }
      />
    )
  }

  /* --- loading --- */
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8" aria-busy="true" aria-label="Loading residence">
        <Skeleton className="h-4 w-64" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  /* --- error --- */
  if (error) {
    return (
      <StatePanel
        icon={<Tag className="size-8" aria-hidden />}
        title="The listing desk is unreachable"
        body={error}
        action={
          <Button variant="outline" onClick={() => window.location.reload()} className="h-11 gap-2">
            <ArrowLeft className="size-4" aria-hidden />
            Try again
          </Button>
        }
      />
    )
  }

  /* --- not found --- */
  if (!property) {
    return (
      <StatePanel
        icon={<Home className="size-8" aria-hidden />}
        title="This residence is no longer listed"
        body="It may have found its new owner. The rest of the collection awaits."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => setView('properties')} className="h-11 gap-2 gold-gradient-bg text-espresso hover:opacity-90" style={{ color: 'var(--espresso)' }}>
              Browse the Collection
            </Button>
            <Button variant="outline" onClick={goHome} className="h-11">
              Return Home
            </Button>
          </div>
        }
      />
    )
  }

  const agent = property.agent
  const waText = `Hi Delima, I'm interested in ${property.title} (${formatKes(property.priceKes)})`

  const specs: Array<{ icon: LucideIcon; label: string; value: string }> = [
    { icon: BedDouble, label: 'Bedrooms', value: String(property.bedrooms) },
    { icon: Bath, label: 'Bathrooms', value: String(property.bathrooms) },
    { icon: Ruler, label: 'Size', value: formatSqm(property.sqm) },
    { icon: CalendarClock, label: 'Year Built', value: String(property.yearBuilt) },
    { icon: Car, label: 'Parking', value: `${property.parking} spaces` },
    { icon: Building2, label: 'Type', value: typeLabel[property.type] },
    { icon: Tag, label: 'Status', value: statusLabel[property.status] },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-10 lg:px-8">
      {jsonLd && (
        <script
          key="jsonld"
          type="application/ld+json"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 0) }}
        />
      )}
      {/* Breadcrumbs + back */}
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <button
              type="button"
              onClick={goHome}
              className="rounded px-1 py-0.5 transition-colors hover:text-gold-deep dark:hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Home
            </button>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <button
              type="button"
              onClick={() => setFilterAndGo({ neighborhood: property.neighborhoodSlug }, 'properties')}
              className="rounded px-1 py-0.5 transition-colors hover:text-gold-deep dark:hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {property.neighborhood}
            </button>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="max-w-[16rem] truncate px-1 font-medium text-foreground md:max-w-xs">
            {property.title}
          </li>
        </ol>
      </nav>

      <div className="mt-2">
        <Button
          variant="ghost"
          onClick={() => setView('properties')}
          className="-ml-2 h-11 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to the Collection
        </Button>
      </div>

      {/* Title block */}
      <section aria-labelledby="property-title" className="mt-4">
        <p className="eyebrow">{property.neighborhood} · {typeLabel[property.type]}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div className="min-w-0">
            <h1 id="property-title" className="gold-underline font-display text-3xl leading-tight md:text-5xl">
              {property.title}
            </h1>
            <p className="mt-4 text-2xl font-bold text-gold-deep dark:text-gold md:text-3xl">
              {formatPriceForStatus(property.priceKes, property.status)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn('px-3 py-1 text-xs font-semibold uppercase tracking-wider', statusBadgeClass(property.status))}>
              {statusLabel[property.status]}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-xs">{typeLabel[property.type]}</Badge>
            {property.featured && (
              <Badge className="border-transparent bg-gold px-3 py-1 text-xs font-semibold uppercase tracking-wider text-espresso">
                ★ Featured
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5" aria-label={`Rated ${property.rating.toFixed(1)} out of 5`}>
            <Star className="size-4 fill-gold text-gold" aria-hidden />
            {property.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="size-4" aria-hidden />
            {formatNumber(property.views)} views
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" aria-hidden />
            {property.address}
          </span>
          <span>· Listed {formatDate(property.createdAt)}</span>
        </div>
      </section>

      {/* Main layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* Left column */}
        <div className="min-w-0 space-y-8">
          <Gallery property={property} />

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Residence at a Glance</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {specs.map(spec => (
                <div
                  key={spec.label}
                  className="flex flex-col gap-1 rounded-lg border bg-background/50 p-3.5"
                >
                  <spec.icon className="size-4.5 text-gold-deep dark:text-gold" aria-hidden />
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {spec.label}
                  </span>
                  <span className="text-sm font-semibold">{spec.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="font-display text-xl md:text-2xl">
              About this residence
            </h2>
            <div className="mt-3 space-y-4 leading-7 text-foreground/85">
              {property.description.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          {property.amenities.length > 0 && (
            <section aria-labelledby="amenities-heading">
              <h2 id="amenities-heading" className="font-display text-xl md:text-2xl">
                Amenities &amp; finishes
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Amenities">
                {property.amenities.map(a => (
                  <li key={a}>
                    <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-[13px] font-normal">
                      <Check className="size-3.5 text-gold-deep dark:text-gold" aria-hidden />
                      {a}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right column */}
        <aside className="space-y-6 self-start lg:sticky lg:top-24">
          {/* Actions card */}
          <Card className="border-gold/30">
            <CardContent className="flex flex-col gap-3 p-5">
              <GoldButton
                className="w-full"
                onClick={() => setViewingOpen(true)}
                ariaLabel={`Request a viewing of ${property.title}`}
              >
                <CalendarClock className="size-4" aria-hidden />
                Request Viewing
              </GoldButton>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-11 gap-2" asChild>
                  <a
                    href={whatsappLink(agent.phone, waText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`WhatsApp ${agent.name} about ${property.title}`}
                  >
                    <MessageCircle className="size-4" aria-hidden />
                    WhatsApp
                  </a>
                </Button>
                <Button variant="outline" className="h-11 gap-2" asChild>
                  <a href={`tel:${agent.phone}`} aria-label={`Call ${agent.name}`}>
                    <Phone className="size-4" aria-hidden />
                    Call agent
                  </a>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="outline"
                  aria-pressed={isFav}
                  onClick={() => {
                    toggleFavorite(property.slug)
                    toast({
                      title: isFav ? 'Removed from saved' : 'Saved to your collection',
                      description: isFav
                        ? `${property.title} was removed from your saved homes.`
                        : `${property.title} now lives in your saved homes.`,
                    })
                  }}
                  className={cn('h-11 gap-2', isFav && 'border-gold/60 text-gold-deep dark:text-gold')}
                >
                  <Heart className={cn('size-4', isFav && 'fill-gold text-gold')} aria-hidden />
                  {isFav ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  aria-pressed={isComp}
                  onClick={() => toggleCompare(property.slug)}
                  className={cn('h-11 gap-2', isComp && 'gold-gradient-bg border-transparent text-espresso')}
                  style={isComp ? { color: 'var(--espresso)' } : undefined}
                >
                  <Scale className="size-4" aria-hidden />
                  {isComp ? 'Comparing' : 'Compare'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-11 gap-2"
                  asChild
                >
                  <a
                    href={`/api/properties/${property.slug}/brochure?print=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Download brochure for ${property.title}`}
                  >
                    <Download className="size-4" aria-hidden />
                    Brochure
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="h-11 gap-2"
                  onClick={async (e) => {
                    e.preventDefault()
                    const shareUrl = `https://delima.co.ke/property/${property.slug}`
                    const shareText = `Check out ${property.title} on Delima Realtors`
                    try {
                      if (typeof navigator !== 'undefined' && navigator.share) {
                        await navigator.share({ title: property.title, text: shareText, url: shareUrl })
                      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        await navigator.clipboard.writeText(shareUrl)
                        toast({ title: 'Link copied', description: 'Share it with anyone looking for a Nairobi home.' })
                      }
                    } catch {
                      // user cancelled or clipboard blocked — silent
                    }
                  }}
                  aria-label={`Share ${property.title}`}
                >
                  <Share2 className="size-4" aria-hidden />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Agent card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Your Private Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3.5">
                <Avatar className="size-14 border border-gold/40">
                  <AvatarImage src={agent.photo} alt={agent.name} />
                  <AvatarFallback className="gold-gradient-bg text-espresso">
                    {agent.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-display text-lg leading-tight">{agent.name}</p>
                  <p className="text-sm text-muted-foreground">{agent.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="size-3.5 fill-gold text-gold" aria-hidden />
                    {agent.rating.toFixed(1)}
                  </p>
                </div>
              </div>
              {agent.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {agent.specialties.map(s => (
                    <Badge key={s} variant="outline" className="text-xs font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="size-11 rounded-full" asChild>
                  <a href={`tel:${agent.phone}`} aria-label={`Call ${agent.name} on ${agent.phone}`}>
                    <Phone className="size-4" aria-hidden />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="size-11 rounded-full" asChild>
                  <a href={`mailto:${agent.email}`} aria-label={`Email ${agent.name}`}>
                    <Mail className="size-4" aria-hidden />
                  </a>
                </Button>
                <span className="ml-1 min-w-0 truncate text-sm text-muted-foreground">{agent.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Location panel (static — interactive map lives in Map view) */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold-deep dark:text-gold" aria-hidden />
                <div>
                  <p className="text-sm font-medium">{property.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {property.neighborhood}, Nairobi
                  </p>
                </div>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                {property.lat.toFixed(5)}° S · {Math.abs(property.lng).toFixed(5)}° E
              </p>
              <p className="text-xs italic text-muted-foreground">
                Explore the interactive map in the Map view.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Similar homes */}
      {similar.length > 0 && (
        <section aria-labelledby="similar-heading" className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Keep exploring</p>
              <h2 id="similar-heading" className="gold-underline mt-1 font-display text-2xl md:text-3xl">
                Similar homes in {property.neighborhood}
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map(p => (
              <PropertyCard key={p.slug} property={p} />
            ))}
          </div>
        </section>
      )}

      <ViewingDialog property={property} open={viewingOpen} onOpenChange={setViewingOpen} />
    </div>
  )
}

/* ---------- shared state panels ---------- */

function StatePanel({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode
  title: string
  body: string
  action: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-5 px-4 py-24 text-center md:px-6 lg:px-8">
      <div aria-hidden className="flex size-16 items-center justify-center rounded-full gold-gradient-bg text-espresso">
        {icon}
      </div>
      <div>
        <h2 className="font-display text-2xl md:text-3xl">{title}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      </div>
      {action}
    </div>
  )
}
