// Delima Realtors 3.0 — client stories (testimonials) section
// Owner: REV-2 (homepage engineer).
// Exports: Testimonials (named) + default. Data lives in @/lib/testimonials-data.
// Layout: responsive 1/2/3-column grid of modern quote cards with sun-amber
// stars, Unsplash avatars and a deal-value chip. Entrances via <Reveal>.
'use client'

import { ArrowRight, Quote, Star } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { formatKes } from '@/lib/format'
import { TESTIMONIALS, type Testimonial } from '@/lib/testimonials-data'
import { Reveal, Section, SectionHeading } from './ui-kit'

/* ------------------------------- Star row ------------------------------- */

function StarRow() {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label="Rated 5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-4 fill-sun text-sun" aria-hidden="true" />
      ))}
    </div>
  )
}

/* ------------------------------- Helpers -------------------------------- */

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

/* --------------------------------- Card --------------------------------- */

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article className="card-modern flex h-full flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <StarRow />
        <Quote className="size-5 shrink-0 text-sun/70" aria-hidden="true" />
      </div>

      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink/90">
        &ldquo;{t.quote}&rdquo;
      </blockquote>

      {typeof t.dealValueKes === 'number' && (
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-sun-deep">
          Closed · {formatKes(t.dealValueKes, { compact: true })} · {t.location}
        </p>
      )}

      <footer className="mt-5 flex items-center gap-3 border-t border-line pt-4">
        <Avatar className="size-11 ring-2 ring-sun/40">
          <AvatarImage src={t.photo} alt={`Portrait of ${t.name}`} />
          <AvatarFallback className="bg-brand-soft text-sm font-bold text-brand">
            {initialsFor(t.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink">{t.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {t.role} · {t.location}
          </p>
        </div>
      </footer>
    </article>
  )
}

/* -------------------------------- Section ------------------------------- */

export function Testimonials() {
  const setView = useAppStore(s => s.setView)

  return (
    <Section tone="soft">
      <SectionHeading
        eyebrow="Client stories"
        title="Trusted across Nairobi, proved at the closing table"
        description="Families, investors and businesses who handed us their most consequential address — in their own words, not ours."
      />

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.id} delay={(i % 3) * 0.07} className="h-full">
            <TestimonialCard t={t} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.15} className="mt-10 text-center">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setView('agents')}
          className="h-11 min-h-[44px] rounded-xl border-line bg-white/70 px-7 font-bold text-brand hover:bg-white"
        >
          Meet the team behind these stories
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </Reveal>
    </Section>
  )
}

export default Testimonials
