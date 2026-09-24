'use client'

// Delima Realtors 3.0 — Property detail page (REV-3)
// Premium listing experience: breadcrumb, status/featured pills, gallery with
// 2×2 thumbnails + lightbox (keyboard arrows), spec strip, two-column body
// (about / amenities / location) and a sticky action rail (agent, viewing
// request lead form, brochure, share, favorite, compare). JSON-LD preserved.

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bath,
  BedDouble,
  CalendarClock,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Home,
  Mail,
  Map as MapIcon,
  MapPin,
  Maximize,
  MessageCircle,
  Phone,
  Scale,
  Share2,
  Star,
  TriangleAlert,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
import { useInsights, useProperties } from '@/hooks/use-delima-data'
import { useSavedToggle } from '@/hooks/use-saved'
import { useAppStore } from '@/lib/store'
import { useI18n, usePriceFormatter, useStatusLabel, useTypeLabel } from '@/lib/i18n'
import {
  formatKes,
  formatNumber,
  formatSqm,
  formatDate,
  typeLabel as staticTypeLabel,
  whatsappLink,
} from '@/lib/format'
import type { PropertyDTO, PropertyStatus } from '@/lib/types'
import { cn, fetchWithTimeout } from '@/lib/utils'
import { Container, EmptyState, Pill, StatBlock } from './ui-kit'
import { SmartImage } from './mini-cards'
import { PropertyCard } from './property-card'

/* ------------------------------ helpers -------------------------------- */

const STATUS_TONE: Record<PropertyStatus, 'brand' | 'sun' | 'muted' | 'outline'> = {
  FOR_SALE: 'brand',
  FOR_RENT: 'sun',
  SOLD: 'muted',
  NEW_DEVELOPMENT: 'outline',
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn('size-3.5', i < full ? 'fill-sun text-sun' : 'fill-muted text-line')}
        />
      ))}
    </span>
  )
}

/* ------------------------ viewing request dialog ----------------------- */

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
  const { t } = useI18n()
  const formatPrice = usePriceFormatter()
  const { toast } = useToast()
  const [form, setForm] = useState<ViewingForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill the message with the property title each time the dialog opens.
  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY_FORM,
        message: `Hello, I'd like to arrange a viewing of ${property.title} in ${property.neighborhood}.`,
      })
    }
  }, [open, property.title, property.neighborhood])

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
        title: t('viewing.successTitle'),
        description: t('viewing.successDesc', { agent: property.agent.name, title: property.title }),
      })
      onOpenChange(false)
    } catch {
      toast({
        variant: 'destructive',
        title: t('viewing.errorTitle'),
        description: t('viewing.errorDesc'),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold tracking-tight md:text-2xl">{t('viewing.title')}</DialogTitle>
          <DialogDescription>
            {property.title} · {property.neighborhood} — {formatPrice(property.priceKes, property.status)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="vr-name">{t('booking.fullName')} *</Label>
              <Input
                id="vr-name"
                value={form.name}
                onChange={e => set({ name: e.target.value })}
                placeholder="Amina Wanjiru"
                autoComplete="name"
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="vr-phone">{t('booking.phone')} *</Label>
              <Input
                id="vr-phone"
                type="tel"
                value={form.phone}
                onChange={e => set({ phone: e.target.value })}
                placeholder="+254 7…"
                autoComplete="tel"
                className="h-11 rounded-xl"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="vr-email">{t('booking.email')} *</Label>
              <Input
                id="vr-email"
                type="email"
                value={form.email}
                onChange={e => set({ email: e.target.value })}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="vr-date">{t('booking.date')}</Label>
              <Input
                id="vr-date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={form.date}
                onChange={e => set({ date: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="vr-message">{t('booking.message')}</Label>
            <Textarea
              id="vr-message"
              value={form.message}
              onChange={e => set({ message: e.target.value })}
              placeholder={t('viewing.messagePlaceholder')}
              rows={3}
              className="rounded-xl"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="h-11 rounded-xl" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={submit}
            disabled={!valid || submitting}
            className="btn-sun h-11 rounded-full px-6 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t('viewing.send')}
          >
            {submitting ? t('booking.sending') : t('viewing.send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------- gallery ------------------------------- */

function Gallery({ property }: { property: PropertyDTO }) {
  const [idx, setIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [lastSlug, setLastSlug] = useState(property.slug)

  // Reset gallery state when switching properties (derive during render)
  if (property.slug !== lastSlug) {
    setLastSlug(property.slug)
    setIdx(0)
    setLightbox(false)
  }

  const images = property.images
  const hasImages = images.length > 0
  const current = hasImages ? images[Math.min(idx, images.length - 1)] : undefined
  const thumbs = images.slice(0, 4)

  const go = (dir: 1 | -1) => {
    if (!hasImages) return
    setIdx(i => (i + dir + images.length) % images.length)
  }

  // Keyboard arrows while the lightbox is open (nice-to-have per spec)
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, hasImages, images.length])

  const openLightboxAt = (i: number) => {
    if (!hasImages) return
    setIdx(Math.min(i, images.length - 1))
    setLightbox(true)
  }

  return (
    <section aria-label={`Gallery for ${property.title}`}>
      <div className="grid gap-3 sm:grid-cols-3">
        {/* main image */}
        <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-muted sm:col-span-2 sm:aspect-auto sm:h-full sm:min-h-[22rem]">
          {hasImages && current ? (
            <SmartImage
              src={current}
              alt={`${property.title} — image ${idx + 1} of ${images.length}`}
              className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div aria-hidden className="flex h-full min-h-56 w-full flex-col items-center justify-center gap-2 bg-brand-soft text-brand">
              <Home className="size-10" />
              <span className="text-sm font-bold tracking-wide">Delima Realtors</span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

          {hasImages && (
            <>
              <button
                type="button"
                onClick={() => openLightboxAt(idx)}
                aria-label="Open image fullscreen"
                className="absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun focus-visible:ring-inset"
              />
              <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-brand-deep/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {idx + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={() => openLightboxAt(idx)}
                aria-label="View fullscreen"
                className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
              >
                <Maximize className="size-4" aria-hidden />
              </button>
            </>
          )}
        </div>

        {/* 2×2 thumbnails */}
        {hasImages && thumbs.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {thumbs.map((src, i) => (
              <button
                key={`${property.slug}-thumb-${i}`}
                type="button"
                onClick={() => openLightboxAt(i)}
                aria-label={`Open image ${i + 1} of ${images.length}`}
                aria-current={i === idx}
                className={cn(
                  'group/thumb relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun',
                  i === idx ? 'ring-2 ring-sun ring-offset-1 ring-offset-paper' : 'opacity-85 hover:opacity-100',
                )}
              >
                <SmartImage
                  src={src}
                  alt=""
                  className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover/thumb:scale-105"
                />
                {i === 3 && images.length > 5 && (
                  <span className="absolute inset-0 grid place-items-center bg-brand-deep/65 text-sm font-bold text-white backdrop-blur-[1px]">
                    +{images.length - 4} photos
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* lightbox */}
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent
          aria-label="Fullscreen gallery image"
          className="w-[calc(100vw-2rem)] max-w-5xl overflow-hidden rounded-2xl border-brand-deep bg-brand-deep p-0 text-white sm:p-0"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              {property.title} — image {idx + 1} of {Math.max(images.length, 1)}
            </DialogTitle>
            <DialogDescription>Fullscreen gallery view. Use the arrow keys to navigate.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <div className="flex max-h-[80vh] items-center justify-center bg-black/40">
              {current ? (
                <SmartImage
                  src={current}
                  alt={`${property.title} fullscreen — image ${idx + 1}`}
                  eager
                  className="max-h-[80vh] w-full object-contain"
                />
              ) : (
                <div aria-hidden className="flex h-[50vh] w-full items-center justify-center text-white/70">
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
                  className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </>
            )}
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {idx + 1} / {Math.max(images.length, 1)}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

/* --------------------- JSON-LD structured data (SEO) ------------------- */

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
    category: staticTypeLabel[p.type],
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

/* -------------------------------- main --------------------------------- */

export default function PropertyDetail() {
  const { t } = useI18n()
  const statusLabel = useStatusLabel()
  const typeLabel = useTypeLabel()
  const formatPrice = usePriceFormatter()
  const activeSlug = useAppStore(s => s.activeSlug)
  const setView = useAppStore(s => s.setView)
  const goHome = useAppStore(s => s.goHome)
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)
  const compare = useAppStore(s => s.compare)
  const toggleCompare = useAppStore(s => s.toggleCompare)
  const { properties, loading, error } = useProperties()
  const { neighborhoods } = useInsights()
  const { toast } = useToast()
  const [viewingOpen, setViewingOpen] = useState(false)

  const property = useMemo(
    () => properties.find(p => p.slug === activeSlug) ?? null,
    [properties, activeSlug],
  )

  const hood = useMemo(
    () => (property ? neighborhoods.find(n => n.slug === property.neighborhoodSlug) ?? null : null),
    [neighborhoods, property],
  )

  const { saved: isFav, toggle: toggleSaved } = useSavedToggle(property?.slug ?? '')
  const isComp = property ? compare.includes(property.slug) : false
  const compareFull = !isComp && compare.length >= 3

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
      <Container className="py-20 md:py-28">
        <EmptyState
          icon={Home}
          title={t('detail.noSlugTitle')}
          description={t('detail.noSlugBlurb')}
          className="min-h-72"
          action={
            <Button onClick={() => setView('properties')} className="btn-sun h-11 gap-2 rounded-full px-6 text-sm font-bold">
              <ArrowRight className="size-4" aria-hidden />
              {t('common.browseProperties')}
            </Button>
          }
        />
      </Container>
    )
  }

  /* --- loading --- */
  if (loading) {
    return (
      <Container className="py-8 md:py-10" >
        <div aria-busy="true" aria-label="Loading residence">
          <Skeleton className="h-4 w-64" />
          <div className="mt-6 grid gap-10 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <Skeleton className="h-[22rem] w-full rounded-2xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-56 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </Container>
    )
  }

  /* --- error --- */
  if (error) {
    return (
      <Container className="py-20 md:py-28">
        <EmptyState
          icon={TriangleAlert}
          title={t('detail.errorTitle')}
          description={error}
          className="min-h-72"
          action={
            <Button variant="outline" onClick={() => window.location.reload()} className="h-11 gap-2 rounded-xl">
              {t('detail.tryAgain')}
            </Button>
          }
        />
      </Container>
    )
  }

  /* --- not found --- */
  if (!property) {
    return (
      <Container className="py-20 md:py-28">
        <EmptyState
          icon={Home}
          title={t('detail.goneTitle')}
          description={t('detail.goneBlurb')}
          className="min-h-72"
          action={
            <div className="flex flex-wrap justify-center gap-2.5">
              <Button onClick={() => setView('properties')} className="btn-sun h-11 rounded-full px-6 text-sm font-bold">
                {t('common.browseProperties')}
              </Button>
              <Button variant="outline" onClick={goHome} className="h-11 rounded-xl">
                {t('detail.returnHome')}
              </Button>
            </div>
          }
        />
      </Container>
    )
  }

  const agent = property.agent
  const waText = `Hi Delima, I'm interested in ${property.title} (${formatKes(property.priceKes)})`

  const specs: Array<{ icon: LucideIcon; value: string; label: string }> = [
    { icon: BedDouble, value: property.bedrooms === 0 ? t('common.studio') : String(property.bedrooms), label: t('spec.bedrooms') },
    { icon: Bath, value: String(property.bathrooms), label: t('spec.bathrooms') },
    { icon: Maximize, value: formatSqm(property.sqm), label: t('spec.size') },
    { icon: Car, value: `${property.parking}`, label: t('spec.parking') },
    { icon: CalendarDays, value: property.yearBuilt > 0 ? String(property.yearBuilt) : '—', label: t('spec.yearBuilt') },
  ]

  return (
    <Container className="py-6 md:py-10">
      {jsonLd && (
        <script
          key="jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 0) }}
        />
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <button
              type="button"
              onClick={goHome}
              className="rounded px-1 py-0.5 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('nav.home')}
            </button>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <button
              type="button"
              onClick={() => setView('properties')}
              className="rounded px-1 py-0.5 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('nav.properties')}
            </button>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="max-w-[13rem] truncate px-1 font-semibold text-ink sm:max-w-xs">
            {property.title}
          </li>
        </ol>
      </nav>

      {/* Title block */}
      <section aria-labelledby="property-title" className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={STATUS_TONE[property.status]}>{statusLabel[property.status]}</Pill>
          {property.featured && (
            <Pill tone="outline" className="border-sun/60 bg-sun-soft text-sun-deep">
              <Star className="size-3 fill-sun text-sun" aria-hidden />
              {t('common.featured')}
            </Pill>
          )}
          <Pill tone="outline">{typeLabel[property.type]}</Pill>
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="min-w-0">
            <h1 id="property-title" className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {property.title}
            </h1>
            <p className="mt-2.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-sun-deep" aria-hidden />
              {property.address} · {property.neighborhood}, Nairobi
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-3xl font-extrabold tracking-tight text-brand">
              {formatPrice(property.priceKes, property.status)}
            </p>
            <p className="mt-1.5 text-xs font-medium text-muted-foreground">
              {t('detail.listedOn', { date: formatDate(property.createdAt) })} · {t('detail.views', { count: formatNumber(property.views) })}
              {' · '}
              <Star className="-mt-0.5 inline size-3.5 fill-sun text-sun" aria-hidden />
              {' '}{property.rating.toFixed(1)}
            </p>
          </div>
        </div>
      </section>

      {/* Spec strip */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="Key specifications">
        {specs.map(spec => (
          <StatBlock key={spec.label} icon={spec.icon} value={spec.value} label={spec.label} />
        ))}
      </div>

      {/* Main layout */}
      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        {/* Left column */}
        <div className="min-w-0 space-y-12 lg:col-span-2">
          <Gallery property={property} />

          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-2xl font-extrabold tracking-tight text-ink">
              {t('detail.description')}
            </h2>
            <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-foreground/80">
              {property.description}
            </p>
          </section>

          {property.amenities.length > 0 && (
            <section aria-labelledby="amenities-heading">
              <h2 id="amenities-heading" className="text-2xl font-extrabold tracking-tight text-ink">
                {t('detail.amenities')}
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2" aria-label="Amenities">
                {property.amenities.map(a => (
                  <li
                    key={a}
                    className="flex items-center gap-2.5 rounded-xl bg-brand-soft px-3.5 py-2.5 text-sm font-medium text-brand"
                  >
                    <Check className="size-4 shrink-0" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="location-heading">
            <h2 id="location-heading" className="text-2xl font-extrabold tracking-tight text-ink">
              {t('detail.locationHeading')}
            </h2>
            <div className="card-modern mt-4 overflow-hidden">
              <div className="relative h-44 sm:h-56">
                <SmartImage
                  src={hood?.image}
                  alt={`${property.neighborhood}, Nairobi`}
                  fallbackLabel={property.neighborhood}
                  className="absolute inset-0 h-full w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/85 via-brand-deep/20 to-transparent" />
                <p className="absolute bottom-3.5 left-5 flex items-center gap-1.5 text-lg font-bold text-white">
                  <MapPin className="size-4.5 text-sun" aria-hidden />
                  {property.neighborhood}
                </p>
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-sm leading-6 text-muted-foreground">
                  {hood?.description ?? `Discover more homes in ${property.neighborhood}, one of Nairobi's most sought-after addresses.`}
                </p>
                {hood?.highlights && hood.highlights.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Neighbourhood highlights">
                    {hood.highlights.slice(0, 4).map(h => (
                      <li
                        key={h}
                        className="rounded-full border border-line bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 font-mono text-xs text-muted-foreground">
                  {Math.abs(property.lat).toFixed(5)}° S · {Math.abs(property.lng).toFixed(5)}° E · {property.address}
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Button
                    onClick={() => setView('map')}
                    className="btn-sun h-11 gap-2 rounded-full px-5 text-sm font-bold"
                    aria-label={`Explore ${property.neighborhood} on the map`}
                  >
                    <MapIcon className="size-4" aria-hidden />
                    {t('detail.exploreMap')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setFilterAndGo({ neighborhood: property.neighborhoodSlug }, 'properties')}
                    className="h-11 gap-2 rounded-xl"
                  >
                    {t('detail.moreHomes', { name: property.neighborhood })}
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right rail */}
        <aside className="self-start lg:sticky lg:top-24">
          <div className="space-y-5">
            {/* Action card */}
            <div className="card-modern space-y-3 p-5">
              <Button
                onClick={() => setViewingOpen(true)}
                className="btn-sun h-12 w-full gap-2 rounded-full text-sm font-bold"
                aria-label={`Request a viewing of ${property.title}`}
              >
                <CalendarClock className="size-4" aria-hidden />
                {t('detail.viewingCta')}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-11 gap-2 rounded-xl" asChild>
                  <a
                    href={`/api/properties/${property.slug}/brochure?print=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Download brochure for ${property.title}`}
                  >
                    <Download className="size-4" aria-hidden />
                    {t('detail.brochureShort')}
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="h-11 gap-2 rounded-xl"
                  onClick={async () => {
                    const shareUrl = `https://delima.co.ke/property/${property.slug}`
                    const shareText = `Check out ${property.title} on Delima Realtors`
                    try {
                      if (typeof navigator !== 'undefined' && navigator.share) {
                        await navigator.share({ title: property.title, text: shareText, url: shareUrl })
                      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        await navigator.clipboard.writeText(shareUrl)
                        toast({ title: t('detail.linkCopied') })
                      }
                    } catch {
                      // user cancelled or clipboard blocked — silent
                    }
                  }}
                  aria-label={`Share ${property.title}`}
                >
                  <Share2 className="size-4" aria-hidden />
                  {t('detail.share')}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  aria-pressed={isFav}
                  onClick={() => {
                    toggleSaved(property.slug)
                    toast({
                      title: isFav
                        ? t('detail.removedToast', { title: property.title })
                        : t('detail.savedToast', { title: property.title }),
                    })
                  }}
                  className={cn(
                    'h-11 gap-2 rounded-xl',
                    isFav && 'border-sun/60 bg-sun-soft text-sun-deep hover:bg-sun-soft',
                  )}
                >
                  <Heart className={cn('size-4', isFav && 'fill-current')} aria-hidden />
                  {isFav ? t('common.saved') : t('common.save')}
                </Button>
                <Button
                  variant="outline"
                  aria-pressed={isComp}
                  disabled={compareFull}
                  title={compareFull ? t('detail.compareFull') : undefined}
                  onClick={() => toggleCompare(property.slug)}
                  className={cn(
                    'h-11 gap-2 rounded-xl',
                    isComp && 'border-brand/40 bg-brand-soft text-brand hover:bg-brand-soft',
                  )}
                >
                  <Scale className="size-4" aria-hidden />
                  {isComp ? t('detail.comparing') : t('common.compare')}
                </Button>
              </div>
            </div>

            {/* Agent card */}
            <div className="card-modern p-5">
              <div className="flex items-center gap-3.5">
                <Avatar className="size-14 border border-line">
                  <AvatarImage src={agent.photo} alt={agent.name} />
                  <AvatarFallback className="bg-brand text-sm font-bold text-white">
                    {agent.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-base font-extrabold tracking-tight text-ink">{agent.name}</p>
                  <p className="text-sm text-muted-foreground">{agent.title}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Stars rating={agent.rating} />
                    <span className="text-xs font-semibold text-muted-foreground">{agent.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              {agent.specialties.length > 0 && (
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {agent.specialties.map(s => (
                    <span key={s} className="rounded-full border border-line bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <Button asChild className="mt-4 h-11 w-full gap-2 rounded-xl bg-[#1faa53] text-white hover:bg-[#189248]">
                <a
                  href={whatsappLink(agent.phone, waText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${agent.name} about ${property.title}`}
                >
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp {agent.name.split(' ')[0]}
                </a>
              </Button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-11 gap-2 rounded-xl" asChild>
                  <a href={`tel:${agent.phone}`} aria-label={`Call ${agent.name} on ${agent.phone}`}>
                    <Phone className="size-4" aria-hidden />
                    Call
                  </a>
                </Button>
                <Button variant="outline" className="h-11 gap-2 rounded-xl" asChild>
                  <a href={`mailto:${agent.email}`} aria-label={`Email ${agent.name}`}>
                    <Mail className="size-4" aria-hidden />
                    Email
                  </a>
                </Button>
              </div>
              <p className="mt-2.5 text-center font-mono text-xs text-muted-foreground">{agent.phone}</p>
            </div>

            {/* Valuation cross-link */}
            <div className="rounded-2xl border border-sun/40 bg-sun-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-sun-deep">{t('detail.ownHome')}</p>
              <p className="mt-1 text-sm leading-5 text-ink/80">
                {t('detail.ownHomeBlurb')}
              </p>
              <Button
                variant="ghost"
                onClick={() => setView('valuation')}
                className="-ml-2 mt-1 h-11 gap-1.5 rounded-xl text-sun-deep hover:bg-sun/20 hover:text-sun-deep"
              >
                {t('detail.freeValuation')}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Similar homes */}
      {similar.length > 0 && (
        <section aria-labelledby="similar-heading" className="mt-16">
          <p className="eyebrow">{t('detail.keepExploring')}</p>
          <h2 id="similar-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {t('detail.similarIn', { name: property.neighborhood })}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map(p => (
              <PropertyCard key={p.slug} property={p} />
            ))}
          </div>
        </section>
      )}

      <ViewingDialog property={property} open={viewingOpen} onOpenChange={setViewingOpen} />
    </Container>
  )
}
