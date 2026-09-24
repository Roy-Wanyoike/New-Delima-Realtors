'use client'

// Delima Realtors 3.0 — Properties search results page (REV-3)
// Modern browse experience: dynamic heading, active filter chips, sticky
// filter rail (desktop) / Sheet (mobile), results grid with map↔list hover
// sync, saved-searches strip. Built on the frozen 3.0 design system.

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookmarkPlus,
  Heart,
  Home,
  Map as MapIcon,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  TriangleAlert,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { useBuyerStore } from '@/lib/buyer-store'
import { useToast } from '@/hooks/use-toast'
import { filterProperties, useInsights, useProperties } from '@/hooks/use-delima-data'
import { useSavedSlugs } from '@/hooks/use-saved'
import { useI18n, useStatusLabel, useTypeLabel } from '@/lib/i18n'
import {
  PROPERTY_TYPES,
  type FilterState,
  type PropertyStatus,
  type PropertyType,
} from '@/lib/types'
import { formatKes } from '@/lib/format'
import { Container, EmptyState } from './ui-kit'
import { PropertyCard, PropertyCardSkeleton } from './property-card'

/* ------------------------------ constants ------------------------------ */

const SALE_STEPS = [
  2_500_000, 5_000_000, 10_000_000, 15_000_000, 25_000_000, 35_000_000,
  50_000_000, 75_000_000, 100_000_000, 150_000_000, 200_000_000, 300_000_000,
]
const RENT_STEPS = [
  15_000, 25_000, 35_000, 50_000, 70_000, 100_000, 150_000, 200_000, 300_000, 500_000,
]
const BED_OPTIONS = [1, 2, 3, 4, 5]

const STATUS_TABS: Array<{ value: PropertyStatus | 'ALL'; labelKey: 'props.allTab' | 'common.forSale' | 'common.forRent' }> = [
  { value: 'ALL', labelKey: 'props.allTab' },
  { value: 'FOR_SALE', labelKey: 'common.forSale' },
  { value: 'FOR_RENT', labelKey: 'common.forRent' },
]

/* ------------------------------- helpers ------------------------------- */

function compactKes(n: number): string {
  return formatKes(n, { compact: true }).replace('KES ', '')
}

function capName(name: string): string {
  return name.length > 28 ? `${name.slice(0, 27)}…` : name
}

/** Labels bundle passed into the composed-heading helpers (locale-aware). */
interface SearchLabels {
  typePlural: Record<PropertyType, string>
  homes: string
  forRent: string
  forSale: string
  rentals: string
  homesForSale: string
  homesIn: (name: string) => string
  inHood: (name: string) => string
  under: (amount: string) => string
  over: (amount: string) => string
  bedsPlus: (n: number) => string
  featured: string
  allResidences: string
  resultsFor: (q: string) => string
  newDevelopments: string
}

/** Human name for the current filters, e.g. "Villas in Karen" / "Under KES 25M". Capped ~28 chars. */
export function describeSearchName(f: FilterState, hoodNames: Map<string, string>, L: SearchLabels): string {
  if (f.q.trim()) {
    const q = f.q.trim()
    return capName(q.charAt(0).toUpperCase() + q.slice(1))
  }
  const bits: string[] = []
  const hood = f.neighborhood !== 'ALL' ? hoodNames.get(f.neighborhood) ?? f.neighborhood : null
  let head = f.type !== 'ALL' ? L.typePlural[f.type] : hood ? L.homes : ''
  if (f.status === 'FOR_RENT') head = head ? `${head} ${L.forRent}` : L.rentals
  if (f.status === 'FOR_SALE') head = head ? `${head} ${L.forSale}` : L.homesForSale
  if (head && hood) bits.push(`${head} ${L.inHood(hood)}`)
  else if (head) bits.push(head)
  else if (hood) bits.push(L.homesIn(hood))
  if (f.minPrice != null && f.maxPrice != null) {
    bits.push(`KES ${compactKes(f.minPrice)}–${compactKes(f.maxPrice)}`)
  } else if (f.maxPrice != null) {
    bits.push(L.under(compactKes(f.maxPrice)))
  } else if (f.minPrice != null) {
    bits.push(L.over(compactKes(f.minPrice)))
  }
  if (f.beds > 0) bits.push(L.bedsPlus(f.beds))
  if (f.featuredOnly) bits.push(L.featured)
  if (bits.length === 0) return L.allResidences
  return capName(bits.join(' · '))
}

/** Dynamic page heading, e.g. "Villas for sale in Karen" / "Results for “bungalow”". */
function describeHeading(f: FilterState, hoodNames: Map<string, string>, L: SearchLabels): string {
  const q = f.q.trim()
  if (q) {
    const short = q.length > 26 ? `${q.slice(0, 25)}…` : q
    return L.resultsFor(short)
  }
  const hood = f.neighborhood !== 'ALL' ? hoodNames.get(f.neighborhood) ?? f.neighborhood : null
  let head = f.type !== 'ALL' ? L.typePlural[f.type] : f.status === 'NEW_DEVELOPMENT' ? L.newDevelopments : L.homes
  if (f.status === 'FOR_SALE') head = `${head} ${L.forSale}`
  if (f.status === 'FOR_RENT') head = `${head} ${L.forRent}`
  if (hood) head = `${head} ${L.inHood(hood)}`
  if (f.featuredOnly) head = `${L.featured} ${head.charAt(0).toLowerCase()}${head.slice(1)}`
  return head
}

function rentHint(status: PropertyStatus | 'ALL', t: (k: 'props.pricePerMonth' | 'props.filters') => string): string {
  return status === 'FOR_RENT' ? t('props.pricePerMonth') : t('props.filters')
}

/* ------------------------------ search box ----------------------------- */

/** Debounced search input bound to filters.q (instant feel, fewer store writes). */
function SearchBox({ idPrefix }: { idPrefix: string }) {
  const q = useAppStore(s => s.filters.q)
  const setFilters = useAppStore(s => s.setFilters)
  const { t } = useI18n()
  const [value, setValue] = useState(q)
  const [prevQ, setPrevQ] = useState(q)

  // Sync when q is changed externally (saved search, AI, chip removal…) —
  // adjust-during-render pattern (no setState-in-effect cascades).
  if (prevQ !== q) {
    setPrevQ(q)
    setValue(q)
  }

  useEffect(() => {
    if (value === q) return
    const t = setTimeout(() => setFilters({ q: value }), 300)
    return () => clearTimeout(t)
  }, [value, q, setFilters])

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        id={`${idPrefix}-q`}
        type="search"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={t('props.searchPlaceholderShort')}
        aria-label={t('props.searchHomes')}
        className="h-11 rounded-xl bg-background pl-10 pr-10"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label={t('props.clearSearch')}
          className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  )
}

/* --------------------------- filter panel ------------------------------ */

interface HoodOption { slug: string; name: string }

/**
 * Shared filter controls — rendered in the desktop rail and inside the
 * mobile Sheet. Every control applies instantly via setFilters.
 */
function FilterPanel({ hoods, idPrefix }: { hoods: HoodOption[]; idPrefix: string }) {
  const filters = useAppStore(s => s.filters)
  const setFilters = useAppStore(s => s.setFilters)
  const resetFilters = useAppStore(s => s.resetFilters)
  const { t } = useI18n()
  const typeLabel = useTypeLabel()

  const rentMode = filters.status === 'FOR_RENT'
  const steps = rentMode ? RENT_STEPS : SALE_STEPS

  const groupLabel = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground'

  return (
    <div className="flex flex-col gap-5">
      <SearchBox idPrefix={idPrefix} />

      {/* status pills */}
      <div>
        <p className={groupLabel} id={`${idPrefix}-status-label`}>{t('props.status')}</p>
        <div role="group" aria-labelledby={`${idPrefix}-status-label`} className="mt-2 grid grid-cols-3 gap-2">
          {STATUS_TABS.map(tab => {
            const active = filters.status === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setFilters(
                    tab.value === filters.status
                      ? {}
                      : { status: tab.value, minPrice: null, maxPrice: null },
                  )
                }
                className={cn(
                  'h-11 rounded-xl border text-[13px] font-semibold transition-colors',
                  active
                    ? 'border-brand bg-brand text-white'
                    : 'border-line bg-white text-ink hover:border-brand/40 hover:bg-brand-soft/50',
                )}
              >
                {t(tab.labelKey)}
              </button>
            )
          })}
        </div>
      </div>

      {/* type */}
      <div>
        <p className={groupLabel}>{t('props.type')}</p>
        <div className="mt-2">
          <Label className="sr-only" htmlFor={`${idPrefix}-type`}>{t('props.type')}</Label>
          <Select value={filters.type} onValueChange={v => setFilters({ type: v as PropertyType | 'ALL' })}>
            <SelectTrigger id={`${idPrefix}-type`} aria-label={t('props.type')} className="h-11 w-full rounded-xl bg-background justify-between">
              <SelectValue placeholder={t('props.anyType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('props.anyType')}</SelectItem>
              {PROPERTY_TYPES.map(ty => (
                <SelectItem key={ty} value={ty}>{typeLabel[ty]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* bedrooms pills */}
      <div>
        <p className={groupLabel} id={`${idPrefix}-beds-label`}>{t('props.beds')}</p>
        <div role="group" aria-labelledby={`${idPrefix}-beds-label`} className="mt-2 grid grid-cols-3 gap-2">
          <button
            type="button"
            aria-pressed={filters.beds === 0}
            onClick={() => setFilters({ beds: 0 })}
            className={cn(
              'h-11 rounded-xl border text-[13px] font-semibold transition-colors',
              filters.beds === 0
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-white text-ink hover:border-brand/40 hover:bg-brand-soft/50',
            )}
          >
            {t('props.anyBeds')}
          </button>
          {BED_OPTIONS.map(n => {
            const active = filters.beds === n
            return (
              <button
                key={n}
                type="button"
                aria-pressed={active}
                aria-label={t('props.bedsPlus', { count: n })}
                onClick={() => setFilters({ beds: n })}
                className={cn(
                  'h-11 rounded-xl border text-[13px] font-semibold transition-colors',
                  active
                    ? 'border-brand bg-brand text-white'
                    : 'border-line bg-white text-ink hover:border-brand/40 hover:bg-brand-soft/50',
                )}
              >
                {t('props.bedsPlus', { count: n })}
              </button>
            )
          })}
        </div>
      </div>

      {/* price ladder */}
      <div>
        <p className={groupLabel}>{rentMode ? t('props.pricePerMonth') : t('props.priceKes')}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <Label className="sr-only" htmlFor={`${idPrefix}-min`}>{t('props.minPrice')}</Label>
            <Select
              value={filters.minPrice == null ? 'ANY' : String(filters.minPrice)}
              onValueChange={v => setFilters({ minPrice: v === 'ANY' ? null : Number(v) })}
            >
              <SelectTrigger id={`${idPrefix}-min`} aria-label={t('props.minPrice')} className="h-11 w-full rounded-xl bg-background justify-between">
                <SelectValue placeholder={t('props.noMin')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANY">{t('props.noMin')}</SelectItem>
                {steps.map(step => (
                  <SelectItem key={step} value={String(step)}>
                    KES {compactKes(step)}{rentMode ? t('props.perMo') : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="sr-only" htmlFor={`${idPrefix}-max`}>{t('props.maxPrice')}</Label>
            <Select
              value={filters.maxPrice == null ? 'ANY' : String(filters.maxPrice)}
              onValueChange={v => setFilters({ maxPrice: v === 'ANY' ? null : Number(v) })}
            >
              <SelectTrigger id={`${idPrefix}-max`} aria-label={t('props.maxPrice')} className="h-11 w-full rounded-xl bg-background justify-between">
                <SelectValue placeholder={t('props.noMax')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANY">{t('props.noMax')}</SelectItem>
                {steps.map(step => (
                  <SelectItem key={step} value={String(step)}>
                    KES {compactKes(step)}{rentMode ? t('props.perMo') : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* neighborhood */}
      <div>
        <p className={groupLabel}>{t('props.neighborhood')}</p>
        <div className="mt-2">
          <Label className="sr-only" htmlFor={`${idPrefix}-hood`}>{t('props.neighborhood')}</Label>
          <Select value={filters.neighborhood} onValueChange={v => setFilters({ neighborhood: v })}>
            <SelectTrigger id={`${idPrefix}-hood`} aria-label={t('props.neighborhood')} className="h-11 w-full rounded-xl bg-background justify-between">
              <SelectValue placeholder={t('props.allNeighborhoods')} />
            </SelectTrigger>
            <SelectContent className="delima-scroll max-h-72">
              <SelectItem value="ALL">{t('props.allNeighborhoods')}</SelectItem>
              {hoods.map(h => (
                <SelectItem key={h.slug} value={h.slug}>{h.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* featured */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-background px-3.5 py-2">
        <Label htmlFor={`${idPrefix}-featured`} className="text-sm font-medium">
          {t('props.featuredOnly')}
        </Label>
        <Switch
          id={`${idPrefix}-featured`}
          aria-label={t('props.featuredOnly')}
          checked={filters.featuredOnly}
          onCheckedChange={v => setFilters({ featuredOnly: v })}
        />
      </div>

      <Button
        variant="ghost"
        onClick={resetFilters}
        className="h-11 justify-start gap-2 rounded-xl px-2 text-muted-foreground hover:text-brand"
      >
        <RotateCcw className="size-4" aria-hidden />
        {t('props.resetFilters')}
      </Button>
    </div>
  )
}

/* ------------------------------- page ---------------------------------- */

export default function PropertiesView() {
  const { t } = useI18n()
  const statusLabel = useStatusLabel()
  const filters = useAppStore(s => s.filters)
  const setFilters = useAppStore(s => s.setFilters)
  const resetFilters = useAppStore(s => s.resetFilters)
  const setView = useAppStore(s => s.setView)
  const localSearches = useAppStore(s => s.savedSearches)
  const addLocalSearch = useAppStore(s => s.addSavedSearch)
  const removeLocalSearch = useAppStore(s => s.removeSavedSearch)
  const applyLocalSearch = useAppStore(s => s.applySavedSearch)
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)
  const hoveredSlug = useAppStore(s => s.hoveredSlug)
  const setHoveredSlug = useAppStore(s => s.setHoveredSlug)
  const buyerStatus = useBuyerStore(s => s.status)
  const buyerSearches = useBuyerStore(s => s.searches)
  const addServerSearch = useBuyerStore(s => s.addSavedSearch)
  const removeServerSearch = useBuyerStore(s => s.removeSavedSearch)
  const authed = buyerStatus === 'authed'
  const { slugs: savedSlugs, loading: savedLoading } = useSavedSlugs()
  const { properties, loading, error } = useProperties()
  const { neighborhoods } = useInsights()
  const { toast } = useToast()
  const [showFavorites, setShowFavorites] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  // locale-aware label bundle for composed headings/search names
  const labels = useMemo<SearchLabels>(
    () => ({
      typePlural: {
        APARTMENT: t('plural.APARTMENT'),
        VILLA: t('plural.VILLA'),
        TOWNHOUSE: t('plural.TOWNHOUSE'),
        PENTHOUSE: t('plural.PENTHOUSE'),
        OFFICE: t('plural.OFFICE'),
        LAND: t('plural.LAND'),
        COMMERCIAL: t('plural.COMMERCIAL'),
      },
      homes: t('props.homes'),
      forRent: t('props.forRentSuffix'),
      forSale: t('props.forSaleSuffix'),
      rentals: t('props.rentals'),
      homesForSale: t('props.homesForSale'),
      homesIn: name => t('props.homesIn', { name }),
      inHood: name => t('props.inHood', { name }),
      under: amount => t('props.under', { amount }),
      over: amount => t('props.over', { amount }),
      bedsPlus: n => t('props.bedsPlusN', { count: n }),
      featured: t('common.featured'),
      allResidences: t('props.allResidences'),
      resultsFor: q => t('props.resultsFor', { q }),
      newDevelopments: t('props.newDevelopments'),
    }),
    [t],
  )

  // Neighborhood options: insights first, fall back to whatever the listings carry
  const hoods = useMemo<HoodOption[]>(() => {
    const map = new Map<string, string>()
    neighborhoods.forEach(n => map.set(n.slug, n.name))
    properties.forEach(p => {
      if (!map.has(p.neighborhoodSlug)) map.set(p.neighborhoodSlug, p.neighborhood)
    })
    return Array.from(map, ([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [neighborhoods, properties])

  const hoodNames = useMemo(() => {
    const map = new Map<string, string>()
    hoods.forEach(h => map.set(h.slug, h.name))
    return map
  }, [hoods])

  const saveCurrentSearch = async () => {
    const name = describeSearchName(filters, hoodNames, labels)
    if (authed) {
      const result = await addServerSearch(name, filters)
      if (!result.ok) {
        toast({ title: result.error ?? t('props.searchLimit'), variant: 'destructive' })
        return
      }
    } else {
      const ok = addLocalSearch(name)
      if (!ok) {
        toast({ title: t('props.searchLimit'), variant: 'destructive' })
        return
      }
    }
    toast({ title: t('props.searchSaved') })
  }

  const savedSearches = authed ? buyerSearches : localSearches
  const removeSavedSearch = (id: string) => {
    if (authed) void removeServerSearch(id)
    else removeLocalSearch(id)
    toast({ title: t('props.searchRemoved') })
  }
  const applySavedSearch = (id: string) => {
    if (authed) {
      const s = buyerSearches.find(x => x.id === id)
      if (s) setFilterAndGo(s.filters, 'properties')
      return
    }
    applyLocalSearch(id)
  }

  const baseList = useMemo(
    () => (showFavorites ? properties.filter(p => savedSlugs.includes(p.slug)) : properties),
    [properties, savedSlugs, showFavorites],
  )
  const results = useMemo(() => filterProperties(baseList, filters), [baseList, filters])

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (filters.q.trim()) n++
    if (filters.type !== 'ALL') n++
    if (filters.status !== 'ALL') n++
    if (filters.neighborhood !== 'ALL') n++
    if (filters.beds > 0) n++
    if (filters.minPrice != null) n++
    if (filters.maxPrice != null) n++
    if (filters.featuredOnly) n++
    if (showFavorites) n++
    return n
  }, [filters, showFavorites])

  const clearAll = () => {
    resetFilters()
    setShowFavorites(false)
  }

  /* active filter chips */
  const chips = useMemo(() => {
    const list: Array<{ key: string; label: string; clear: () => void }> = []
    if (filters.q.trim()) {
      list.push({ key: 'q', label: `“${filters.q.trim()}”`, clear: () => setFilters({ q: '' }) })
    }
    if (filters.status !== 'ALL') {
      list.push({
        key: 'status',
        label: statusLabel[filters.status],
        clear: () => setFilters({ status: 'ALL', minPrice: null, maxPrice: null }),
      })
    }
    if (filters.type !== 'ALL') {
      list.push({ key: 'type', label: labels.typePlural[filters.type], clear: () => setFilters({ type: 'ALL' }) })
    }
    if (filters.neighborhood !== 'ALL') {
      list.push({
        key: 'hood',
        label: hoodNames.get(filters.neighborhood) ?? filters.neighborhood,
        clear: () => setFilters({ neighborhood: 'ALL' }),
      })
    }
    if (filters.beds > 0) {
      list.push({ key: 'beds', label: t('props.bedsPlusN', { count: filters.beds }), clear: () => setFilters({ beds: 0 }) })
    }
    if (filters.minPrice != null) {
      list.push({ key: 'min', label: `KES ${compactKes(filters.minPrice)}+`, clear: () => setFilters({ minPrice: null }) })
    }
    if (filters.maxPrice != null) {
      list.push({ key: 'max', label: t('props.under', { amount: compactKes(filters.maxPrice) }), clear: () => setFilters({ maxPrice: null }) })
    }
    if (filters.featuredOnly) {
      list.push({ key: 'featured', label: t('props.featuredOnly'), clear: () => setFilters({ featuredOnly: false }) })
    }
    if (showFavorites) {
      list.push({ key: 'saved', label: t('props.savedChip', { count: savedSlugs.length }), clear: () => setShowFavorites(false) })
    }
    return list
  }, [filters, labels, hoodNames, savedSlugs.length, setFilters, showFavorites, statusLabel, t])

  const countLine = loading
    ? t('common.loading')
    : showFavorites
      ? `${results.length === 1 ? t('props.resultsOne') : t('props.resultsCount', { count: results.length })} · ${t('props.showingFavorites')}`
      : results.length === 1
        ? t('props.resultsOne')
        : t('props.resultsCount', { count: results.length })

  const emptyTitle = showFavorites && savedSlugs.length === 0 && !savedLoading ? t('props.emptyFavTitle') : t('props.emptyTitle')
  const emptyBody = showFavorites && savedSlugs.length === 0 && !savedLoading
    ? t('props.emptyFavBody')
    : t('props.emptyBody')

  const SORT_OPTIONS: Array<{ value: FilterState['sort']; label: string }> = [
    { value: 'featured', label: t('props.sortFeatured') },
    { value: 'newest', label: t('props.sortNewest') },
    { value: 'price-asc', label: t('props.sortPriceUp') },
    { value: 'price-desc', label: t('props.sortPriceDown') },
    { value: 'size', label: t('props.sortLargest') },
  ]

  return (
    <Container>
      {/* ---------------- header ---------------- */}
      <section className="pb-2 pt-8 md:pt-12" aria-labelledby="properties-heading">
        <p className="eyebrow">{t('props.title')}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div className="min-w-0">
            <h1 id="properties-heading" className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {describeHeading(filters, hoodNames, labels)}
            </h1>
            <p className="mt-2 text-sm font-medium text-muted-foreground" aria-live="polite">
              {countLine}
            </p>
          </div>

          {/* controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* mobile filters */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  aria-label={t('props.filtersAria', { count: activeFilterCount })}
                  className="relative h-11 shrink-0 gap-2 rounded-xl lg:hidden"
                >
                  <SlidersHorizontal className="size-4" aria-hidden />
                  {t('props.filters')}
                  {activeFilterCount > 0 && (
                    <span
                      aria-hidden
                      className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-sun text-[10px] font-bold text-brand-deep"
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="delima-scroll w-[min(21rem,92vw)] overflow-y-auto">
                <SheetHeader className="text-left">
                  <SheetTitle className="text-xl font-extrabold tracking-tight">{t('props.refine')}</SheetTitle>
                  <SheetDescription>{rentHint(filters.status, t)}</SheetDescription>
                </SheetHeader>
                <div className="mt-2 pb-4">
                  <FilterPanel hoods={hoods} idPrefix="sheet" />
                </div>
                <div className="sticky bottom-0 -mx-6 border-t border-line bg-white/95 px-6 py-4 backdrop-blur">
                  <Button
                    onClick={() => setSheetOpen(false)}
                    className="btn-sun h-11 w-full rounded-full text-sm font-bold"
                  >
                    {t('props.showResults', { count: results.length })}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* favorites-only toggle */}
            <Button
              variant="outline"
              aria-pressed={showFavorites}
              onClick={() => setShowFavorites(v => !v)}
              className={cn(
                'h-11 shrink-0 gap-2 rounded-xl',
                showFavorites && 'border-sun/60 bg-sun-soft text-sun-deep hover:bg-sun-soft',
              )}
            >
              <Heart className={cn('size-4', showFavorites && 'fill-current')} aria-hidden />
              <span className="hidden sm:inline">{t('props.savedCount', { count: savedSlugs.length })}</span>
              <span className="sm:hidden">{savedSlugs.length}</span>
            </Button>

            {/* sort */}
            <div>
              <Label className="sr-only" htmlFor="delima-sort">{t('props.sortLabel')}</Label>
              <Select value={filters.sort} onValueChange={v => setFilters({ sort: v as typeof filters.sort })}>
                <SelectTrigger id="delima-sort" aria-label={t('props.sortLabel')} className="h-11 w-[9.5rem] rounded-xl bg-background justify-between sm:w-[10.5rem]">
                  <SelectValue placeholder={t('props.sortPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* map toggle */}
            <Button
              variant="outline"
              onClick={() => setView('map')}
              className="h-11 shrink-0 gap-2 rounded-xl"
              aria-label={t('props.mapView')}
            >
              <MapIcon className="size-4" aria-hidden />
              <span className="hidden sm:inline">{t('props.mapView')}</span>
              <span className="sm:hidden">{t('props.mapShort')}</span>
            </Button>

            {/* save search */}
            <Button
              onClick={() => void saveCurrentSearch()}
              className="h-11 shrink-0 gap-2 rounded-xl px-4"
              aria-label={t('props.saveThisSearch')}
            >
              <BookmarkPlus className="size-4" aria-hidden />
              <span className="hidden sm:inline">{t('props.saveThisSearch')}</span>
              <span className="sm:hidden">{t('common.save')}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* ---------------- active filter chips ---------------- */}
      {chips.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2" aria-label="Active filters">
          {chips.map(chip => (
            <span
              key={chip.key}
              className="inline-flex h-11 items-center gap-1 rounded-full border border-line bg-white pl-4 text-[13px] font-semibold text-ink"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.clear}
                aria-label={`Remove filter ${chip.label}`}
                className="ml-0.5 flex h-full w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-ink"
              >
                <X className="size-4" aria-hidden />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="ml-1 h-11 rounded-full px-3 text-[13px] font-bold text-brand underline-offset-4 transition-colors hover:bg-brand-soft hover:underline"
          >
            {t('props.clearAll')}
          </button>
        </div>
      )}

      {/* ---------------- saved searches strip ---------------- */}
      {savedSearches.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Saved searches">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('props.savedSearches')}</span>
          {savedSearches.map(s => (
            <span key={s.id} className="inline-flex h-11 items-center rounded-full border border-line bg-brand-soft/60 pl-2.5 text-[13px] font-semibold text-brand">
              <button
                type="button"
                onClick={() => applySavedSearch(s.id)}
                aria-label={`Apply saved search ${s.name}`}
                className="flex h-full min-w-0 items-center gap-1.5 rounded-full pl-1.5 pr-2 transition-colors hover:bg-brand-soft"
              >
                <Play className="size-3.5 shrink-0 fill-current" aria-hidden />
                <span className="max-w-44 truncate">{s.name}</span>
              </button>
              <button
                type="button"
                onClick={() => removeSavedSearch(s.id)}
                aria-label={`Remove saved search ${s.name}`}
                className="mr-1.5 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white hover:text-ink"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ---------------- rail + results ---------------- */}
      <div className="mt-8 grid gap-6 pb-24 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
        {/* desktop filter rail */}
        <aside className="hidden lg:block" aria-label="Search filters">
          <div className="card-modern sticky top-24 p-5">
            <div className="delima-scroll max-h-[calc(100vh-9rem)] overflow-y-auto pr-1">
              <h2 className="text-lg font-extrabold tracking-tight text-ink">{t('props.refine')}</h2>
              <p className="mt-0.5 mb-5 text-xs text-muted-foreground">{rentHint(filters.status, t)}</p>
              <FilterPanel hoods={hoods} idPrefix="rail" />
            </div>
          </div>
        </aside>

        {/* results */}
        <section aria-label="Search results">
          {error ? (
            <EmptyState
              icon={TriangleAlert}
              title={t('props.errorTitle')}
              description={error}
              className="min-h-72"
              action={
                <Button onClick={() => window.location.reload()} variant="outline" className="h-11 gap-2 rounded-xl">
                  <RotateCcw className="size-4" aria-hidden />
                  {t('detail.tryAgain')}
                </Button>
              }
            />
          ) : loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading homes">
              {Array.from({ length: 6 }, (_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={Home}
              title={emptyTitle}
              description={emptyBody}
              className="min-h-72"
              action={
                <Button
                  onClick={() => {
                    setShowFavorites(false)
                    resetFilters()
                  }}
                  className="btn-sun h-11 gap-2 rounded-full px-6 text-sm font-bold"
                >
                  <RotateCcw className="size-4" aria-hidden />
                  {t('props.resetSearch')}
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p, i) => (
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4), ease: 'easeOut' }}
                >
                  <PropertyCard
                    property={p}
                    active={hoveredSlug === p.slug}
                    onHover={setHoveredSlug}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Container>
  )
}
