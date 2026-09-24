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
import { useToast } from '@/hooks/use-toast'
import { filterProperties, useInsights, useProperties } from '@/hooks/use-delima-data'
import {
  PROPERTY_TYPES,
  type FilterState,
  type PropertyStatus,
  type PropertyType,
} from '@/lib/types'
import { formatKes, statusLabel, typeLabel } from '@/lib/format'
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

const TYPE_PLURAL: Record<PropertyType, string> = {
  APARTMENT: 'Apartments',
  VILLA: 'Villas',
  TOWNHOUSE: 'Townhouses',
  PENTHOUSE: 'Penthouses',
  OFFICE: 'Offices',
  LAND: 'Land',
  COMMERCIAL: 'Commercial',
}

const SORT_OPTIONS: Array<{ value: FilterState['sort']; label: string }> = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'size', label: 'Largest' },
]

const STATUS_TABS: Array<{ value: PropertyStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'FOR_SALE', label: 'For Sale' },
  { value: 'FOR_RENT', label: 'For Rent' },
]

/* ------------------------------- helpers ------------------------------- */

function compactKes(n: number): string {
  return formatKes(n, { compact: true }).replace('KES ', '')
}

function capName(name: string): string {
  return name.length > 28 ? `${name.slice(0, 27)}…` : name
}

/** Human name for the current filters, e.g. "Villas in Karen" / "Under KES 25M". Capped ~28 chars. */
export function describeSearchName(f: FilterState, hoodNames: Map<string, string>): string {
  if (f.q.trim()) {
    const q = f.q.trim()
    return capName(q.charAt(0).toUpperCase() + q.slice(1))
  }
  const bits: string[] = []
  const hood = f.neighborhood !== 'ALL' ? hoodNames.get(f.neighborhood) ?? f.neighborhood : null
  let head = f.type !== 'ALL' ? TYPE_PLURAL[f.type] : hood ? 'Homes' : ''
  if (f.status === 'FOR_RENT') head = head ? `${head} for rent` : 'Rentals'
  if (f.status === 'FOR_SALE') head = head ? `${head} for sale` : 'Homes for sale'
  if (head && hood) bits.push(`${head} in ${hood}`)
  else if (head) bits.push(head)
  else if (hood) bits.push(`Homes in ${hood}`)
  if (f.minPrice != null && f.maxPrice != null) {
    bits.push(`KES ${compactKes(f.minPrice)}–${compactKes(f.maxPrice)}`)
  } else if (f.maxPrice != null) {
    bits.push(`Under KES ${compactKes(f.maxPrice)}`)
  } else if (f.minPrice != null) {
    bits.push(`Over KES ${compactKes(f.minPrice)}`)
  }
  if (f.beds > 0) bits.push(`${f.beds}+ beds`)
  if (f.featuredOnly) bits.push('Featured')
  if (bits.length === 0) return 'All residences'
  return capName(bits.join(' · '))
}

/** Dynamic page heading, e.g. "Villas for sale in Karen" / "Results for “bungalow”". */
function describeHeading(f: FilterState, hoodNames: Map<string, string>): string {
  const q = f.q.trim()
  if (q) {
    const short = q.length > 26 ? `${q.slice(0, 25)}…` : q
    return `Results for “${short}”`
  }
  const hood = f.neighborhood !== 'ALL' ? hoodNames.get(f.neighborhood) ?? f.neighborhood : null
  let head = f.type !== 'ALL' ? TYPE_PLURAL[f.type] : f.status === 'NEW_DEVELOPMENT' ? 'New developments' : 'Homes'
  if (f.status === 'FOR_SALE') head = `${head} for sale`
  if (f.status === 'FOR_RENT') head = `${head} for rent`
  if (hood) head = `${head} in ${hood}`
  if (f.featuredOnly) head = `Featured ${head.charAt(0).toLowerCase()}${head.slice(1)}`
  return head
}

function rentHint(status: PropertyStatus | 'ALL'): string {
  return status === 'FOR_RENT'
    ? 'Prices are shown per month for rentals.'
    : 'Filter by type, area, price, bedrooms and more.'
}

/* ------------------------------ search box ----------------------------- */

/** Debounced search input bound to filters.q (instant feel, fewer store writes). */
function SearchBox({ idPrefix }: { idPrefix: string }) {
  const q = useAppStore(s => s.filters.q)
  const setFilters = useAppStore(s => s.setFilters)
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
        placeholder="Search area, amenity, keyword…"
        aria-label="Search homes"
        className="h-11 rounded-xl bg-background pl-10 pr-10"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Clear search"
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

  const rentMode = filters.status === 'FOR_RENT'
  const steps = rentMode ? RENT_STEPS : SALE_STEPS

  const groupLabel = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground'

  return (
    <div className="flex flex-col gap-5">
      <SearchBox idPrefix={idPrefix} />

      {/* status pills */}
      <div>
        <p className={groupLabel} id={`${idPrefix}-status-label`}>Status</p>
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
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* type */}
      <div>
        <p className={groupLabel}>Property type</p>
        <div className="mt-2">
          <Label className="sr-only" htmlFor={`${idPrefix}-type`}>Property type</Label>
          <Select value={filters.type} onValueChange={v => setFilters({ type: v as PropertyType | 'ALL' })}>
            <SelectTrigger id={`${idPrefix}-type`} aria-label="Property type" className="h-11 w-full rounded-xl bg-background justify-between">
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Any type</SelectItem>
              {PROPERTY_TYPES.map(t => (
                <SelectItem key={t} value={t}>{typeLabel[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* bedrooms pills */}
      <div>
        <p className={groupLabel} id={`${idPrefix}-beds-label`}>Bedrooms</p>
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
            Any
          </button>
          {BED_OPTIONS.map(n => {
            const active = filters.beds === n
            return (
              <button
                key={n}
                type="button"
                aria-pressed={active}
                aria-label={n === 5 ? 'Five or more bedrooms' : `${n} or more bedrooms`}
                onClick={() => setFilters({ beds: n })}
                className={cn(
                  'h-11 rounded-xl border text-[13px] font-semibold transition-colors',
                  active
                    ? 'border-brand bg-brand text-white'
                    : 'border-line bg-white text-ink hover:border-brand/40 hover:bg-brand-soft/50',
                )}
              >
                {n === 5 ? '5+' : `${n}+`}
              </button>
            )
          })}
        </div>
      </div>

      {/* price ladder */}
      <div>
        <p className={groupLabel}>Price {rentMode ? 'per month' : '(KES)'}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <Label className="sr-only" htmlFor={`${idPrefix}-min`}>Minimum price</Label>
            <Select
              value={filters.minPrice == null ? 'ANY' : String(filters.minPrice)}
              onValueChange={v => setFilters({ minPrice: v === 'ANY' ? null : Number(v) })}
            >
              <SelectTrigger id={`${idPrefix}-min`} aria-label="Minimum price" className="h-11 w-full rounded-xl bg-background justify-between">
                <SelectValue placeholder="No min" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANY">No min</SelectItem>
                {steps.map(step => (
                  <SelectItem key={step} value={String(step)}>
                    KES {compactKes(step)}{rentMode ? '/mo' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="sr-only" htmlFor={`${idPrefix}-max`}>Maximum price</Label>
            <Select
              value={filters.maxPrice == null ? 'ANY' : String(filters.maxPrice)}
              onValueChange={v => setFilters({ maxPrice: v === 'ANY' ? null : Number(v) })}
            >
              <SelectTrigger id={`${idPrefix}-max`} aria-label="Maximum price" className="h-11 w-full rounded-xl bg-background justify-between">
                <SelectValue placeholder="No max" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANY">No max</SelectItem>
                {steps.map(step => (
                  <SelectItem key={step} value={String(step)}>
                    KES {compactKes(step)}{rentMode ? '/mo' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* neighborhood */}
      <div>
        <p className={groupLabel}>Neighborhood</p>
        <div className="mt-2">
          <Label className="sr-only" htmlFor={`${idPrefix}-hood`}>Neighborhood</Label>
          <Select value={filters.neighborhood} onValueChange={v => setFilters({ neighborhood: v })}>
            <SelectTrigger id={`${idPrefix}-hood`} aria-label="Neighborhood" className="h-11 w-full rounded-xl bg-background justify-between">
              <SelectValue placeholder="All neighborhoods" />
            </SelectTrigger>
            <SelectContent className="delima-scroll max-h-72">
              <SelectItem value="ALL">All neighborhoods</SelectItem>
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
          Featured only
        </Label>
        <Switch
          id={`${idPrefix}-featured`}
          aria-label="Featured listings only"
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
        Reset filters
      </Button>
    </div>
  )
}

/* ------------------------------- page ---------------------------------- */

export default function PropertiesView() {
  const filters = useAppStore(s => s.filters)
  const setFilters = useAppStore(s => s.setFilters)
  const resetFilters = useAppStore(s => s.resetFilters)
  const setView = useAppStore(s => s.setView)
  const favorites = useAppStore(s => s.favorites)
  const savedSearches = useAppStore(s => s.savedSearches)
  const addSavedSearch = useAppStore(s => s.addSavedSearch)
  const removeSavedSearch = useAppStore(s => s.removeSavedSearch)
  const applySavedSearch = useAppStore(s => s.applySavedSearch)
  const hoveredSlug = useAppStore(s => s.hoveredSlug)
  const setHoveredSlug = useAppStore(s => s.setHoveredSlug)
  const { properties, loading, error } = useProperties()
  const { neighborhoods } = useInsights()
  const { toast } = useToast()
  const [showFavorites, setShowFavorites] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

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

  const saveCurrentSearch = () => {
    const ok = addSavedSearch(describeSearchName(filters, hoodNames))
    if (!ok) {
      toast({ title: 'Manage saved searches — limit is 6', variant: 'destructive' })
      return
    }
    toast({ title: 'Search saved', description: 'Run it any time from the saved searches strip.' })
  }

  const baseList = useMemo(
    () => (showFavorites ? properties.filter(p => favorites.includes(p.slug)) : properties),
    [properties, favorites, showFavorites],
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
      list.push({ key: 'type', label: TYPE_PLURAL[filters.type], clear: () => setFilters({ type: 'ALL' }) })
    }
    if (filters.neighborhood !== 'ALL') {
      list.push({
        key: 'hood',
        label: hoodNames.get(filters.neighborhood) ?? filters.neighborhood,
        clear: () => setFilters({ neighborhood: 'ALL' }),
      })
    }
    if (filters.beds > 0) {
      list.push({ key: 'beds', label: `${filters.beds}+ bd`, clear: () => setFilters({ beds: 0 }) })
    }
    if (filters.minPrice != null) {
      list.push({ key: 'min', label: `From KES ${compactKes(filters.minPrice)}`, clear: () => setFilters({ minPrice: null }) })
    }
    if (filters.maxPrice != null) {
      list.push({ key: 'max', label: `Up to KES ${compactKes(filters.maxPrice)}`, clear: () => setFilters({ maxPrice: null }) })
    }
    if (filters.featuredOnly) {
      list.push({ key: 'featured', label: 'Featured only', clear: () => setFilters({ featuredOnly: false }) })
    }
    if (showFavorites) {
      list.push({ key: 'saved', label: `♥ Saved (${favorites.length})`, clear: () => setShowFavorites(false) })
    }
    return list
  }, [filters, favorites.length, hoodNames, setFilters, showFavorites])

  const countLine = loading
    ? 'Loading homes…'
    : `${results.length} ${results.length === 1 ? 'home matches' : 'homes match'} your search${showFavorites ? ' · from your saved list' : ''}`

  const emptyTitle = showFavorites && favorites.length === 0 ? 'No saved homes yet' : 'No homes match your search'
  const emptyBody = showFavorites && favorites.length === 0
    ? 'Tap the heart on any listing to keep it here for later.'
    : 'Every great home deserves a second look — try loosening a filter or two.'

  return (
    <Container>
      {/* ---------------- header ---------------- */}
      <section className="pb-2 pt-8 md:pt-12" aria-labelledby="properties-heading">
        <p className="eyebrow">Browse the collection</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div className="min-w-0">
            <h1 id="properties-heading" className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {describeHeading(filters, hoodNames)}
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
                  aria-label={`Open filters, ${activeFilterCount} active`}
                  className="relative h-11 shrink-0 gap-2 rounded-xl lg:hidden"
                >
                  <SlidersHorizontal className="size-4" aria-hidden />
                  Filters
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
                  <SheetTitle className="text-xl font-extrabold tracking-tight">Refine search</SheetTitle>
                  <SheetDescription>{rentHint(filters.status)}</SheetDescription>
                </SheetHeader>
                <div className="mt-2 pb-4">
                  <FilterPanel hoods={hoods} idPrefix="sheet" />
                </div>
                <div className="sticky bottom-0 -mx-6 border-t border-line bg-white/95 px-6 py-4 backdrop-blur">
                  <Button
                    onClick={() => setSheetOpen(false)}
                    className="btn-sun h-11 w-full rounded-full text-sm font-bold"
                  >
                    Show {results.length} {results.length === 1 ? 'home' : 'homes'}
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
              <span className="hidden sm:inline">{favorites.length} saved</span>
              <span className="sm:hidden">{favorites.length}</span>
            </Button>

            {/* sort */}
            <div>
              <Label className="sr-only" htmlFor="delima-sort">Sort results</Label>
              <Select value={filters.sort} onValueChange={v => setFilters({ sort: v as typeof filters.sort })}>
                <SelectTrigger id="delima-sort" aria-label="Sort results" className="h-11 w-[9.5rem] rounded-xl bg-background justify-between sm:w-[10.5rem]">
                  <SelectValue placeholder="Sort" />
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
              aria-label="Open map view"
            >
              <MapIcon className="size-4" aria-hidden />
              <span className="hidden sm:inline">Map view</span>
              <span className="sm:hidden">Map</span>
            </Button>

            {/* save search */}
            <Button
              onClick={saveCurrentSearch}
              className="h-11 shrink-0 gap-2 rounded-xl px-4"
              aria-label="Save current search"
            >
              <BookmarkPlus className="size-4" aria-hidden />
              <span className="hidden sm:inline">Save search</span>
              <span className="sm:hidden">Save</span>
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
            Clear all
          </button>
        </div>
      )}

      {/* ---------------- saved searches strip ---------------- */}
      {savedSearches.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Saved searches">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saved searches</span>
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
              <h2 className="text-lg font-extrabold tracking-tight text-ink">Refine search</h2>
              <p className="mt-0.5 mb-5 text-xs text-muted-foreground">{rentHint(filters.status)}</p>
              <FilterPanel hoods={hoods} idPrefix="rail" />
            </div>
          </div>
        </aside>

        {/* results */}
        <section aria-label="Search results">
          {error ? (
            <EmptyState
              icon={TriangleAlert}
              title="Something went adrift"
              description={error}
              className="min-h-72"
              action={
                <Button onClick={() => window.location.reload()} variant="outline" className="h-11 gap-2 rounded-xl">
                  <RotateCcw className="size-4" aria-hidden />
                  Try again
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
                  Reset the search
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
