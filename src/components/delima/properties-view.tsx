'use client'

// Delima Realtors Platform 2.0 — The Collection: search, filters, results grid (Task 5-b)
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bookmark,
  BookmarkPlus,
  Heart,
  RotateCcw,
  Search,
  SearchX,
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
import { Separator } from '@/components/ui/separator'
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
import { filterProperties, useProperties } from '@/hooks/use-delima-data'
import {
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  type FilterState,
  type PropertyStatus,
  type PropertyType,
} from '@/lib/types'
import { formatKes, statusLabel, typeLabel } from '@/lib/format'
import { PropertyCard, PropertyCardSkeleton } from './property-card'

const SALE_STEPS = [5_000_000, 10_000_000, 25_000_000, 50_000_000, 75_000_000, 100_000_000, 150_000_000, 200_000_000, 300_000_000]
const RENT_STEPS = [50_000, 100_000, 150_000, 200_000, 300_000, 500_000, 750_000, 1_000_000]
const BED_OPTIONS = [1, 2, 3, 4, 5]

/* ------------------------- saved-search naming ----------------------- */

const TYPE_PLURAL: Record<PropertyType, string> = {
  APARTMENT: 'Apartments',
  VILLA: 'Villas',
  TOWNHOUSE: 'Townhouses',
  PENTHOUSE: 'Penthouses',
  OFFICE: 'Offices',
  LAND: 'Land',
  COMMERCIAL: 'Commercial',
}

function compactKes(n: number): string {
  return formatKes(n, { compact: true }).replace('KES ', '')
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
  if (head && hood) bits.push(`${head} in ${hood}`)
  else if (head) bits.push(head)
  else if (hood) bits.push(`Homes in ${hood}`)
  if (f.minPrice != null && f.maxPrice != null) {
    bits.push(`KES ${compactKes(f.minPrice)}–${compactKes(f.maxPrice)}`)
  } else if (f.maxPrice != null) {
    bits.push(`Under ${formatKes(f.maxPrice, { compact: true })}`)
  } else if (f.minPrice != null) {
    bits.push(`Over ${formatKes(f.minPrice, { compact: true })}`)
  }
  if (f.beds > 0) bits.push(`${f.beds}+ beds`)
  if (f.featuredOnly) bits.push('Featured')
  if (bits.length === 0) return 'All residences'
  return capName(bits.join(' · '))
}

function capName(name: string): string {
  return name.length > 28 ? `${name.slice(0, 27)}…` : name
}

interface FilterControlsProps {
  layout: 'bar' | 'panel'
}

/** Shared filter controls — rendered inline on desktop and inside a Sheet on mobile. */
function FilterControls({ layout }: FilterControlsProps) {
  const filters = useAppStore(s => s.filters)
  const setFilters = useAppStore(s => s.setFilters)
  const resetFilters = useAppStore(s => s.resetFilters)
  const { properties } = useProperties()

  const hoods = useMemo(() => {
    const map = new Map<string, string>()
    properties.forEach(p => map.set(p.neighborhoodSlug, p.neighborhood))
    return Array.from(map, ([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [properties])

  const rentMode = filters.status === 'FOR_RENT'
  const steps = rentMode ? RENT_STEPS : SALE_STEPS

  const wrap = layout === 'bar' ? 'flex flex-wrap items-center gap-2.5' : 'flex flex-col gap-4'
  const triggerCls = layout === 'bar' ? 'h-11 w-auto min-w-36' : 'h-11 w-full justify-between'
  const itemCls = layout === 'panel' ? 'flex flex-col gap-1.5' : 'contents'

  return (
    <div className={wrap}>
      <div className={itemCls}>
        <Label className="sr-only" htmlFor="delima-search-type">Property type</Label>
        <Select
          value={filters.type}
          onValueChange={v => setFilters({ type: v as PropertyType | 'ALL' })}
        >
          <SelectTrigger aria-label="Property type" className={triggerCls}>
            <SelectValue placeholder="Any Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any Type</SelectItem>
            {PROPERTY_TYPES.map(t => (
              <SelectItem key={t} value={t}>{typeLabel[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={itemCls}>
        <Label className="sr-only" htmlFor="delima-status">Listing status</Label>
        <Select
          value={filters.status}
          onValueChange={v =>
            setFilters({ status: v as PropertyStatus | 'ALL', minPrice: null, maxPrice: null })
          }
        >
          <SelectTrigger aria-label="Listing status" className={triggerCls}>
            <SelectValue placeholder="Any Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any Status</SelectItem>
            {PROPERTY_STATUSES.map(s => (
              <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={itemCls}>
        <Label className="sr-only" htmlFor="delima-hood">Neighborhood</Label>
        <Select
          value={filters.neighborhood}
          onValueChange={v => setFilters({ neighborhood: v })}
        >
          <SelectTrigger aria-label="Neighborhood" className={triggerCls}>
            <SelectValue placeholder="All Neighborhoods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Neighborhoods</SelectItem>
            {hoods.map(h => (
              <SelectItem key={h.slug} value={h.slug}>{h.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={itemCls}>
        <Label className="sr-only" htmlFor="delima-beds">Minimum bedrooms</Label>
        <Select
          value={String(filters.beds)}
          onValueChange={v => setFilters({ beds: Number(v) })}
        >
          <SelectTrigger aria-label="Minimum bedrooms" className={triggerCls}>
            <SelectValue placeholder="Any Beds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any Beds</SelectItem>
            {BED_OPTIONS.map(n => (
              <SelectItem key={n} value={String(n)}>{n}+</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={itemCls}>
        <Label className="sr-only" htmlFor="delima-min">Minimum price</Label>
        <Select
          value={filters.minPrice == null ? 'ANY' : String(filters.minPrice)}
          onValueChange={v => setFilters({ minPrice: v === 'ANY' ? null : Number(v) })}
        >
          <SelectTrigger aria-label="Minimum price" className={triggerCls}>
            <SelectValue placeholder="No Min" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANY">No Min</SelectItem>
            {steps.map(step => (
              <SelectItem key={step} value={String(step)}>
                KES {formatKes(step, { compact: true }).replace('KES ', '')}
                {rentMode ? '/mo' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={itemCls}>
        <Label className="sr-only" htmlFor="delima-max">Maximum price</Label>
        <Select
          value={filters.maxPrice == null ? 'ANY' : String(filters.maxPrice)}
          onValueChange={v => setFilters({ maxPrice: v === 'ANY' ? null : Number(v) })}
        >
          <SelectTrigger aria-label="Maximum price" className={triggerCls}>
            <SelectValue placeholder="No Max" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANY">No Max</SelectItem>
            {steps.map(step => (
              <SelectItem key={step} value={String(step)}>
                KES {formatKes(step, { compact: true }).replace('KES ', '')}
                {rentMode ? '/mo' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator orientation={layout === 'bar' ? 'vertical' : 'horizontal'} className={cn(layout === 'bar' ? 'hidden xl:block h-8' : '')} />

      <div className={cn(layout === 'bar' ? 'flex items-center gap-2' : 'flex items-center justify-between gap-3')}>
        <Label htmlFor="delima-featured" className="text-sm font-medium whitespace-nowrap">
          Featured
        </Label>
        <Switch
          id="delima-featured"
          aria-label="Featured listings only"
          checked={filters.featuredOnly}
          onCheckedChange={v => setFilters({ featuredOnly: v })}
        />
      </div>

      <div className={itemCls}>
        <Label className="sr-only" htmlFor="delima-sort">Sort by</Label>
        <Select
          value={filters.sort}
          onValueChange={v => setFilters({ sort: v as typeof filters.sort })}
        >
          <SelectTrigger aria-label="Sort results" className={triggerCls}>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-asc">Price ↑</SelectItem>
            <SelectItem value="price-desc">Price ↓</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="size">Largest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        aria-label="Reset all filters"
        onClick={resetFilters}
        className={cn('h-11 gap-2', layout === 'bar' ? 'px-3' : 'w-full')}
      >
        <RotateCcw className="size-4" aria-hidden />
        {layout === 'panel' ? 'Reset filters' : <span className="sr-only">Reset filters</span>}
      </Button>
    </div>
  )
}

export default function PropertiesView() {
  const filters = useAppStore(s => s.filters)
  const setFilters = useAppStore(s => s.setFilters)
  const favorites = useAppStore(s => s.favorites)
  const savedSearches = useAppStore(s => s.savedSearches)
  const addSavedSearch = useAppStore(s => s.addSavedSearch)
  const removeSavedSearch = useAppStore(s => s.removeSavedSearch)
  const applySavedSearch = useAppStore(s => s.applySavedSearch)
  const { properties, loading, error } = useProperties()
  const { toast } = useToast()
  const [showFavorites, setShowFavorites] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const hoodNames = useMemo(() => {
    const map = new Map<string, string>()
    properties.forEach(p => map.set(p.neighborhoodSlug, p.neighborhood))
    return map
  }, [properties])

  const saveCurrentSearch = () => {
    const ok = addSavedSearch(describeSearchName(filters, hoodNames))
    if (!ok) {
      toast({ title: 'Manage saved searches — limit is 6', variant: 'destructive' })
      return
    }
    toast({ title: 'Search saved' })
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
    return n
  }, [filters])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
      {/* Page header */}
      <section className="pb-4 pt-8 md:pt-12" aria-labelledby="collection-heading">
        <p className="eyebrow">The Collection</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2 id="collection-heading" className="gold-underline font-display text-3xl md:text-4xl">
            Nairobi&rsquo;s Finest Homes
          </h2>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {loading
              ? 'Curating residences…'
              : `${results.length} ${results.length === 1 ? 'residence' : 'residences'}${showFavorites ? ' · from your saved list' : ''}`}
          </p>
        </div>
      </section>

      {/* Saved searches — horizontal chip row (only when any exist) */}
      {savedSearches.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Saved searches">
          {savedSearches.map(s => (
            <span key={s.id} className="relative inline-flex items-center">
              <button
                type="button"
                onClick={() => applySavedSearch(s.id)}
                aria-label={`Apply saved search ${s.name}`}
                className="flex h-11 items-center gap-2 rounded-full border border-gold/40 bg-card py-0 pl-4 pr-11 text-sm font-medium text-foreground transition-colors hover:border-gold hover:bg-gold/10"
              >
                <Bookmark className="size-4 shrink-0 text-gold-deep dark:text-gold" aria-hidden />
                <span className="max-w-52 truncate">{s.name}</span>
              </button>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  removeSavedSearch(s.id)
                }}
                aria-label={`Remove saved search ${s.name}`}
                className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 mb-6">
        <div className="rounded-xl border bg-cream/90 p-3 luxury-shadow backdrop-blur-md dark:bg-[#141009]/90">
          <div className="flex items-center gap-2.5">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="delima-search"
                type="search"
                value={filters.q}
                onChange={e => setFilters({ q: e.target.value })}
                placeholder="Search by name, area, amenity…"
                aria-label="Search residences"
                className="h-11 border-none bg-background/60 pl-9 dark:bg-input/20"
              />
            </div>
            <Button
              variant="outline"
              onClick={saveCurrentSearch}
              aria-label="Save current search"
              className="h-11 shrink-0 gap-2 border-gold/60 px-3 text-gold-deep hover:border-gold hover:bg-gold/10 dark:text-gold"
            >
              <BookmarkPlus className="size-4" aria-hidden />
              <span className="hidden sm:inline">Save search</span>
              <span className="sm:hidden">Save</span>
            </Button>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  aria-label="Open filters"
                  className="relative h-11 shrink-0 gap-2 lg:hidden"
                >
                  <SlidersHorizontal className="size-4" aria-hidden />
                  Filters
                  {activeFilterCount > 0 && (
                    <span
                      aria-hidden
                      className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold gold-gradient-bg text-espresso"
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="delima-scroll w-[min(22rem,100vw)] overflow-y-auto"
              >
                <SheetHeader className="text-left">
                  <SheetTitle className="font-display text-xl">Refine the Collection</SheetTitle>
                  <SheetDescription>
                    {rentHint(filters.status)}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-2 flex-1">
                  <FilterControls layout="panel" />
                </div>
                <div className="mt-6">
                  <Button
                    className="h-11 w-full gap-2 gold-gradient-bg text-espresso hover:opacity-90"
                    style={{ color: 'var(--espresso)' }}
                    onClick={() => setSheetOpen(false)}
                  >
                    Show {results.length} {results.length === 1 ? 'residence' : 'residences'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden pt-2.5 lg:block">
            <FilterControls layout="bar" />
          </div>
        </div>
      </div>

      {/* Favorites summary chip row */}
      <div className="mb-5 flex flex-wrap items-center gap-3" aria-live="polite">
        <Button
          variant={showFavorites ? 'default' : 'outline'}
          aria-pressed={showFavorites}
          onClick={() => setShowFavorites(v => !v)}
          className={cn(
            'h-11 gap-2 rounded-full',
            showFavorites && 'gold-gradient-bg border-transparent hover:opacity-90',
          )}
          style={showFavorites ? { color: 'var(--espresso)' } : undefined}
        >
          <Heart className={cn('size-4', showFavorites && 'fill-current')} aria-hidden />
          {favorites.length} saved
        </Button>
        {showFavorites && (
          <button
            type="button"
            onClick={() => setShowFavorites(false)}
            className="flex h-9 items-center gap-1.5 rounded-full border border-gold/40 px-3 text-xs font-medium text-gold-deep transition-colors hover:bg-accent dark:text-gold"
          >
            Showing saved residences only
            <X className="size-3.5" aria-hidden />
          </button>
        )}
      </div>

      {/* Results */}
      {error ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-card px-6 py-14 text-center luxury-shadow">
          <TriangleAlert className="size-10 text-destructive" aria-hidden />
          <div>
            <h3 className="font-display text-xl">Something went adrift</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} className="h-11 gap-2 gold-gradient-bg text-espresso hover:opacity-90" style={{ color: 'var(--espresso)' }}>
            <RotateCcw className="size-4" aria-hidden />
            Try again
          </Button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-5 pb-28 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading residences">
          {Array.from({ length: 8 }, (_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-card px-6 py-16 text-center luxury-shadow">
          <div aria-hidden className="flex size-16 items-center justify-center rounded-full gold-gradient-bg text-espresso">
            <SearchX className="size-8" />
          </div>
          <div>
            <h3 className="font-display text-2xl">
              {showFavorites && favorites.length === 0 ? 'No saved residences yet' : 'No residences match'}
            </h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {showFavorites && favorites.length === 0
                ? 'Tap the heart on any residence to keep it here for later.'
                : 'Every great home deserves a second look — try loosening a filter or two.'}
            </p>
          </div>
          <Button
            onClick={() => {
              setShowFavorites(false)
              setFilters({
                q: '',
                type: 'ALL',
                status: 'ALL',
                minPrice: null,
                maxPrice: null,
                beds: 0,
                neighborhood: 'ALL',
                featuredOnly: false,
                sort: 'featured',
              })
            }}
            className="h-11 gap-2 gold-gradient-bg text-espresso hover:opacity-90"
            style={{ color: 'var(--espresso)' }}
          >
            <RotateCcw className="size-4" aria-hidden />
            Reset the search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 pb-28 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.42), ease: 'easeOut' }}
            >
              <PropertyCard property={p} />
            </motion.div>
          ))}
        </div>
      )}

    </div>
  )
}

function rentHint(status: PropertyStatus | 'ALL'): string {
  return status === 'FOR_RENT'
    ? 'Prices are shown per month for rentals.'
    : 'Filter the collection by type, area, price and more.'
}
