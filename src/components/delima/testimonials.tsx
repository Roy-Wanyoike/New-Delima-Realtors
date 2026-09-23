// Delima Realtors Platform 2.0 — Client testimonials carousel (classic)
// Owner: orchestrator (classic redesign).
// One large serif quote at a time, prev/next controls, "01 / 06" pagination —
// the timeless estate-agency pattern. Auto-advances every 9s, pauses on hover.
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { formatKes, formatDate } from '@/lib/format'
import { TESTIMONIALS, type Testimonial } from '@/lib/testimonials-data'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 9000

function initialsFor(name: string): string {
  return (
    name
      .split(/[\s&]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase() ?? '')
      .join('') || '·'
  )
}

/* ------------------------------------------------------------------ */
/* Star row — inline SVG, decorative stars inside a labelled container */
/* ------------------------------------------------------------------ */

function StarRow() {
  return (
    <div className="flex items-center justify-center gap-1" role="img" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-gold text-gold">
          <path d="M12 2.2l2.95 6.68 7.05.6-5.3 4.85 1.6 7.15L12 17.8 5.7 21.45l1.6-7.15L2 9.3l7.05-.6z" />
        </svg>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Classic carousel                                                    */
/* ------------------------------------------------------------------ */

export default function Testimonials() {
  const setView = useAppStore(s => s.setView)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = useCallback(() => setIndex(i => (i + 1) % TESTIMONIALS.length), [])
  const prev = useCallback(
    () => setIndex(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length),
    [],
  )

  useEffect(() => {
    if (paused) return
    timer.current = setInterval(next, AUTOPLAY_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [paused, next])

  const t: Testimonial = TESTIMONIALS[index]!

  return (
    <section
      className="relative overflow-hidden bg-ink py-16 text-[#f0e9dc] md:py-24 dark:bg-[#0d1b30]"
      aria-labelledby="testimonials-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* faint ornamental background initials */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 select-none font-display text-[16rem] leading-none text-white/[0.04] md:text-[22rem]"
      >
        D
      </span>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="eyebrow !text-gold-soft">Client Stories</p>
          <h2 id="testimonials-heading" className="mt-3 font-display text-3xl md:text-4xl">
            Words from the Circle
          </h2>
          <div className="diamond-divider mx-auto mt-5 max-w-xs" aria-hidden="true">
            <span className="gold-gradient-bg inline-block size-2 rotate-45 rounded-[2px]" />
          </div>
        </motion.div>

        {/* Quote */}
        <div className="relative mt-10 min-h-[340px] sm:min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center"
              aria-live="polite"
            >
              <StarRow />
              <blockquote className="mt-6 font-display text-xl italic leading-relaxed text-[#f0e9dc] md:text-2xl">
                <span aria-hidden="true" className="text-gold">
                  &ldquo;
                </span>
                {t.quote}
                <span aria-hidden="true" className="text-gold">
                  &rdquo;
                </span>
              </blockquote>

              {typeof t.dealValueKes === 'number' && (
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-gold-soft">
                  Closed {formatDate(t.dateIso)} · {formatKes(t.dealValueKes, { compact: true })}
                </p>
              )}

              <figcaption className="mt-7 flex items-center gap-3.5">
                <Avatar className="size-14 ring-2 ring-gold/50">
                  <AvatarImage src={t.photo} alt={`Portrait of ${t.name}`} />
                  <AvatarFallback className="gold-gradient-bg font-display text-sm font-bold text-[#1f1810]">
                    {initialsFor(t.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-left">
                  <span className="block font-display text-lg leading-tight text-white">
                    {t.name}
                  </span>
                  <span className="block text-xs text-[#f0e9dc]/60">
                    {t.role} · {t.location}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {/* Controls — classic 01 / 06 pagination */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <Button
            variant="outline"
            size="icon"
            onClick={prev}
            aria-label="Previous testimonial"
            className="size-11 rounded-full border-white/25 bg-transparent text-[#f0e9dc] hover:border-gold hover:bg-gold hover:text-[#1f1810]"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <p className="font-display text-sm tracking-[0.3em] text-[#f0e9dc]/70" aria-live="polite">
            <span className="text-gold">{String(index + 1).padStart(2, '0')}</span>
            {' / '}
            {String(TESTIMONIALS.length).padStart(2, '0')}
          </p>
          <Button
            variant="outline"
            size="icon"
            onClick={next}
            aria-label="Next testimonial"
            className="size-11 rounded-full border-white/25 bg-transparent text-[#f0e9dc] hover:border-gold hover:bg-gold hover:text-[#1f1810]"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {/* dots */}
        <div className="mt-5 flex items-center justify-center gap-2" aria-hidden="true">
          {TESTIMONIALS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              tabIndex={-1}
              onClick={() => setIndex(i)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-6 bg-gold' : 'w-1.5 bg-white/25 hover:bg-white/50',
              )}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Button
            type="button"
            onClick={() => setView('valuation')}
            className="gold-gradient-bg min-h-[44px] rounded-full px-8 font-semibold text-[#1f1810] hover:opacity-90"
          >
            Become our next success story
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  )
}
