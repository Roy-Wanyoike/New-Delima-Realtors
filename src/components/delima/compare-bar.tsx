'use client'

// Delima Realtors Platform 2.0 — floating compare tray + side-by-side dialog (Task 5-b)
import { useMemo, useState } from 'react'
import { Scale, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppStore } from '@/lib/store'
import { useProperties } from '@/hooks/use-delima-data'
import { formatKes, formatPriceForStatus, formatSqm } from '@/lib/format'
import type { PropertyDTO } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CompareRow {
  label: string
  value: (p: PropertyDTO) => string
  score?: (p: PropertyDTO) => number
  best: 'min' | 'max' | null
}

const COMPARE_ROWS: CompareRow[] = [
  { label: 'Price', value: p => formatPriceForStatus(p.priceKes, p.status), score: p => p.priceKes, best: 'min' },
  {
    label: 'Price / sqm',
    value: p => `${formatKes(Math.round(p.priceKes / Math.max(p.sqm, 1)))} / sqm`,
    score: p => p.priceKes / Math.max(p.sqm, 1),
    best: 'min',
  },
  { label: 'Bedrooms', value: p => `${p.bedrooms} bd`, score: p => p.bedrooms, best: 'max' },
  { label: 'Bathrooms', value: p => `${p.bathrooms} ba`, score: p => p.bathrooms, best: 'max' },
  { label: 'Size', value: p => formatSqm(p.sqm), score: p => p.sqm, best: 'max' },
  { label: 'Year Built', value: p => String(p.yearBuilt), score: p => p.yearBuilt, best: 'max' },
  { label: 'Parking', value: p => `${p.parking} spaces`, score: p => p.parking, best: 'max' },
  { label: 'Rating', value: p => `${p.rating.toFixed(1)} / 5`, score: p => p.rating, best: 'max' },
  { label: 'Neighborhood', value: p => p.neighborhood, best: null },
]

function bestIndexFor(row: CompareRow, items: PropertyDTO[]): number {
  if (!row.score || row.best === null || items.length < 2) return -1
  const scores = items.map(row.score)
  const target = row.best === 'min' ? Math.min(...scores) : Math.max(...scores)
  return scores.indexOf(target)
}

export function CompareBar() {
  const compare = useAppStore(s => s.compare)
  const toggleCompare = useAppStore(s => s.toggleCompare)
  const clearCompare = useAppStore(s => s.clearCompare)
  const { properties } = useProperties()
  const [dialogOpen, setDialogOpen] = useState(false)

  const items = useMemo<PropertyDTO[]>(() => {
    const bySlug = new Map(properties.map(p => [p.slug, p]))
    return compare.map(slug => bySlug.get(slug)).filter((p): p is PropertyDTO => Boolean(p))
  }, [compare, properties])

  if (compare.length === 0 || items.length === 0) return null

  return (
    <>
      <div
        role="region"
        aria-label="Property comparison tray"
        className="fixed inset-x-4 bottom-4 z-40 md:inset-x-auto md:right-6 md:w-[420px]"
      >
        <div className="rounded-xl border border-gold/30 bg-card/95 p-3 luxury-shadow backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Scale className="size-4 text-gold-deep dark:text-gold" aria-hidden />
              <span className="eyebrow">Compare</span>
              <Badge variant="outline" className="border-gold/40 text-gold-deep dark:text-gold">
                {items.length}/3
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompare}
              aria-label="Clear comparison"
              className="h-11 rounded-full px-3 text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>

          <ul className="flex flex-col gap-1.5">
            {items.map(p => (
              <li key={p.slug} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/60 py-1.5 pl-1.5 pr-1">
                {p.images.length > 0 ? (
                  <img
                    src={p.images[0]}
                    alt=""
                    loading="lazy"
                    className="size-12 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div aria-hidden className="size-12 shrink-0 rounded-md gold-gradient-bg" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{formatPriceForStatus(p.priceKes, p.status)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${p.title} from comparison`}
                  onClick={() => toggleCompare(p.slug)}
                  className="size-11 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled={items.length < 2}
            onClick={() => setDialogOpen(true)}
            aria-label={items.length < 2 ? 'Add at least two residences to compare' : 'Open comparison table'}
            className="mt-2.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 gold-gradient-bg text-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Scale className="size-4" aria-hidden />
            {items.length < 2 ? `Add ${2 - items.length} more to compare` : 'Compare residences'}
          </button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          role="dialog"
          aria-label="Side-by-side property comparison"
          className="w-[calc(100vw-2rem)] max-w-3xl overflow-hidden p-0 sm:p-0"
        >
          <DialogHeader className="border-b border-border/60 px-6 pb-4 pt-6">
            <DialogTitle className="font-display text-xl md:text-2xl">Side-by-Side Comparison</DialogTitle>
            <DialogDescription>
              Best value in each row is highlighted in gold.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="delima-scroll max-h-[70vh]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-28 shrink-0" aria-label="Attribute" />
                  {items.map(p => (
                    <TableHead key={p.slug} className="min-w-40">
                      <div className="flex flex-col items-center gap-1.5 py-1 text-center">
                        {p.images.length > 0 ? (
                          <img
                            src={p.images[0]}
                            alt=""
                            loading="lazy"
                            className="size-12 rounded-md object-cover"
                          />
                        ) : (
                          <div aria-hidden className="size-12 rounded-md gold-gradient-bg" />
                        )}
                        <button
                          type="button"
                          onClick={() => useAppStore.getState().openProperty(p.slug)}
                          className="line-clamp-2 max-w-36 text-xs font-medium leading-snug underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {p.title}
                        </button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARE_ROWS.map(row => {
                  const bestIdx = bestIndexFor(row, items)
                  return (
                    <TableRow key={row.label}>
                      <TableCell className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {row.label}
                      </TableCell>
                      {items.map((p, i) => (
                        <TableCell
                          key={p.slug}
                          className={cn(
                            'text-center text-sm',
                            i === bestIdx && 'font-semibold text-gold-deep dark:text-gold',
                          )}
                        >
                          {row.value(p)}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
