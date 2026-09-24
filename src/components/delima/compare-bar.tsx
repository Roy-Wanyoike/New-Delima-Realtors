'use client'

// Delima Realtors 3.0 — floating compare tray + side-by-side dialog
// Owner: REV-1 (shell engineer). Export: CompareBar
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Scale, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useI18n, usePriceFormatter, useTypeLabel } from '@/lib/i18n'
import { formatKes, formatSqm } from '@/lib/format'
import type { PropertyDTO } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CompareRow {
  label: string
  value: (p: PropertyDTO) => string
  render?: (p: PropertyDTO) => ReactNode
  score?: (p: PropertyDTO) => number
  best: 'min' | 'max' | null
}

function buildCompareRows(t: (k: Parameters<ReturnType<typeof useI18n>['t']>[0]) => string, typeLabel: Record<PropertyDTO['type'], string>, formatPrice: (p: PropertyDTO) => string): CompareRow[] {
  return [
    {
      label: t('compare.price'),
      value: p => formatPrice(p),
      score: p => p.priceKes,
      best: 'min',
    },
    { label: t('compare.type'), value: p => typeLabel[p.type], best: null },
    { label: t('spec.bedrooms'), value: p => `${p.bedrooms} ${t('common.bedsShort')}`, score: p => p.bedrooms, best: 'max' },
    { label: t('spec.bathrooms'), value: p => `${p.bathrooms} ${t('common.bathsShort')}`, score: p => p.bathrooms, best: 'max' },
    { label: t('compare.size'), value: p => formatSqm(p.sqm), score: p => p.sqm, best: 'max' },
    { label: t('compare.neighborhood'), value: p => p.neighborhood, best: null },
    {
      label: t('compare.rating'),
      value: p => `${p.rating.toFixed(1)} / 5`,
      render: p => (
        <span className="inline-flex items-center justify-center gap-1">
          <Star className="size-3.5 fill-sun text-sun" aria-hidden="true" />
          {p.rating.toFixed(1)}
        </span>
      ),
      score: p => p.rating,
      best: 'max',
    },
    {
      label: t('spec.parking'),
      value: p => `${p.parking}`,
      score: p => p.parking,
      best: 'max',
    },
    {
      label: t('compare.year'),
      value: p => String(p.yearBuilt),
      score: p => p.yearBuilt,
      best: 'max',
    },
  ]
}

function bestIndexFor(row: CompareRow, items: PropertyDTO[]): number {
  if (!row.score || row.best === null || items.length < 2) return -1
  const scores = items.map(row.score)
  const target = row.best === 'min' ? Math.min(...scores) : Math.max(...scores)
  return scores.indexOf(target)
}

function Thumb({ property, className }: { property: PropertyDTO; className?: string }) {
  const src = property.images[0]
  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'flex items-center justify-center rounded-lg bg-brand-soft font-display text-sm font-extrabold text-brand',
          className,
        )}
      >
        {property.neighborhood.charAt(0)}
      </span>
    )
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      className={cn('rounded-lg bg-muted object-cover', className)}
    />
  )
}

export function CompareBar() {
  const compare = useAppStore(s => s.compare)
  const toggleCompare = useAppStore(s => s.toggleCompare)
  const clearCompare = useAppStore(s => s.clearCompare)
  const openProperty = useAppStore(s => s.openProperty)
  const { properties } = useProperties()
  const { t } = useI18n()
  const typeLabel = useTypeLabel()
  const formatPriceFor = usePriceFormatter()
  const formatPrice = (p: PropertyDTO) => formatPriceFor(p.priceKes, p.status)
  const COMPARE_ROWS = buildCompareRows(t, typeLabel, formatPrice)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Resolve slugs → live listings; drop slugs that no longer exist.
  const items = useMemo<PropertyDTO[]>(() => {
    const bySlug = new Map(properties.map(p => [p.slug, p]))
    return compare.map(slug => bySlug.get(slug)).filter((p): p is PropertyDTO => Boolean(p))
  }, [compare, properties])

  const staleOnly = compare.length > 0 && items.length === 0

  return (
    <>
      <AnimatePresence>
        {compare.length > 0 && (
          <motion.div
            key="compare-tray"
            role="region"
            aria-label="Property comparison tray"
            initial={{ y: 96, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 96, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed inset-x-3 bottom-16 z-40 sm:inset-x-0 sm:bottom-4 sm:mx-auto sm:w-[540px]"
          >
            <div className="rounded-2xl border border-line bg-white/95 p-3 soft-shadow backdrop-blur-md">
              {staleOnly ? (
                /* Guard: everything the user saved has since been removed */
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('compare.empty')}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCompare}
                    aria-label={t('compare.clear')}
                    className="min-h-[44px] rounded-full px-3 text-muted-foreground hover:text-ink"
                  >
                    <X className="size-4" aria-hidden="true" />
                    {t('compare.clear')}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="flex size-8 items-center justify-center rounded-lg bg-sun-soft text-sun-deep"
                      >
                        <Scale className="size-4" />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink">
                        {t('common.compare')}
                      </span>
                      <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand">
                        {items.length}/3
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCompare}
                      aria-label={t('compare.clear')}
                      className="min-h-[44px] rounded-full px-3 text-muted-foreground hover:text-ink"
                    >
                      <X className="size-4" aria-hidden="true" />
                      <span className="hidden sm:inline">{t('compare.clear')}</span>
                    </Button>
                  </div>

                  {/* selected homes */}
                  <ul className="no-scrollbar flex gap-2 overflow-x-auto">
                    {items.map(p => (
                      <li
                        key={p.slug}
                        className="flex shrink-0 items-center gap-2 rounded-xl border border-line bg-white py-1.5 pl-1.5 pr-1"
                      >
                        <Thumb property={p} className="size-10 shrink-0" />
                        <span className="max-w-[110px]">
                          <span className="block truncate text-xs font-bold text-ink">
                            {p.title}
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {formatKes(p.priceKes, { compact: true })}
                          </span>
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${p.title} from comparison`}
                          onClick={() => toggleCompare(p.slug)}
                          className="size-9 shrink-0 rounded-full text-muted-foreground hover:text-ink"
                        >
                          <X className="size-4" aria-hidden="true" />
                        </Button>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    disabled={items.length < 2}
                    onClick={() => setDialogOpen(true)}
                    aria-label={
                      items.length < 2
                        ? t('compare.empty')
                        : t('compare.title')
                    }
                    className="btn-sun mt-2.5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Scale className="size-4" aria-hidden="true" />
                    {t('compare.tray', { count: items.length })}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-4xl overflow-hidden rounded-2xl p-0">
          <DialogHeader className="border-b border-line px-6 pb-4 pt-6 text-left">
            <DialogTitle className="text-2xl font-extrabold tracking-tight text-ink">
              {t('compare.title')}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t('compare.bestValue')}
            </DialogDescription>
          </DialogHeader>

          {items.length > 0 && (
            <div className="delima-scroll max-h-[65vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-28 shrink-0" aria-label="Attribute" />
                    {items.map(p => (
                      <TableHead key={p.slug} className="min-w-44 p-2">
                        <div className="relative flex flex-col items-center gap-1.5 py-1 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${p.title} from comparison`}
                            onClick={() => {
                              toggleCompare(p.slug)
                              if (items.length <= 2) setDialogOpen(false)
                            }}
                            className="absolute right-0 top-0 size-7 rounded-full text-muted-foreground hover:bg-sun-soft hover:text-ink"
                          >
                            <X className="size-3.5" aria-hidden="true" />
                          </Button>
                          <Thumb property={p} className="size-16 rounded-xl" />
                          <button
                            type="button"
                            onClick={() => openProperty(p.slug)}
                            className="line-clamp-2 max-w-40 text-xs font-bold leading-snug text-ink underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {p.title}
                          </button>
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {p.neighborhood}
                          </span>
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
                        <TableCell className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          {row.label}
                        </TableCell>
                        {items.map((p, i) => (
                          <TableCell
                            key={p.slug}
                            className={cn(
                              'text-center text-sm',
                              i === bestIdx &&
                                'bg-sun-soft/70 font-bold text-brand-deep',
                            )}
                          >
                            {row.render ? row.render(p) : row.value(p)}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
