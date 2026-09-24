// Delima Realtors 3.0 — "Meet the team" (Task REV-5)
// Team roster derived live from listings; call / WhatsApp / email actions.
// Visuals modernized for the frozen 3.0 design system (brand/sun tokens, ui-kit).
// All data logic preserved: useTeamAgents derivation, listing-count stats,
// setFilterAndGo('View listings'), tel:/mailto:/whatsappLink actions.
'use client'

import { useMemo } from 'react'
import {
  ArrowUpRight,
  Camera,
  Handshake,
  Mail,
  MessageCircle,
  Phone,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useProperties } from '@/hooks/use-delima-data'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { formatKes, whatsappLink } from '@/lib/format'
import type { AgentDTO } from '@/lib/types'
import { EmptyState, Pill, Reveal, Section, SectionHeading } from './ui-kit'
import { SmartImage } from './mini-cards'

/* ----------------------------- derivation ---------------------------- */

interface AgentCardData extends AgentDTO {
  listingCount: number
  avgPrice: number
}

/** Unique advisors from the live listings, enriched with count + avg price. */
function useTeamAgents(properties: ReturnType<typeof useProperties>['properties']): AgentCardData[] {
  return useMemo(() => {
    const bySlug = new Map<string, { agent: AgentDTO; count: number; total: number }>()
    for (const p of properties) {
      const existing = bySlug.get(p.agent.slug)
      if (existing) {
        existing.count += 1
        existing.total += p.priceKes
      } else {
        bySlug.set(p.agent.slug, { agent: p.agent, count: 1, total: p.priceKes })
      }
    }
    return Array.from(bySlug.values())
      .map(v => ({ ...v.agent, listingCount: v.count, avgPrice: v.total / v.count }))
      .sort((a, b) => b.listingCount - a.listingCount || b.rating - a.rating)
  }, [properties])
}

/* ------------------------------ pieces ------------------------------- */

function Stars({ rating, name }: { rating: number; name: string }) {
  const filled = Math.round(rating)
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < filled ? 'fill-sun text-sun' : 'text-line'}`}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1 font-mono text-xs font-semibold text-muted-foreground">
        {rating.toFixed(1)}
      </span>
      <span className="sr-only">stars for {name}</span>
    </div>
  )
}

function AgentCard({ agent, index }: { agent: AgentCardData; index: number }) {
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)
  const { t } = useI18n()
  const waText = `Hello ${agent.name}, I found you through Delima Realtors and I'd like to talk about ${agent.listingCount > 0 ? 'your current listings' : 'buying a home in Nairobi'}.`

  return (
    <Reveal delay={Math.min(index * 0.06, 0.3)} className="h-full">
      <article className="card-modern flex h-full flex-col overflow-hidden rounded-3xl">
        {/* photo */}
        <div className="relative h-56 w-full shrink-0 overflow-hidden bg-brand-soft">
          <SmartImage
            src={agent.photo}
            alt={`Portrait of ${agent.name}, ${agent.title}`}
            fallbackLabel={agent.name}
            className="h-full w-full transition-transform duration-500 hover:scale-105"
          />
          <span className="glass absolute left-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-ink shadow-sm">
            <Star className="size-3.5 fill-sun text-sun" aria-hidden="true" />
            <span className="font-mono">{agent.rating.toFixed(1)}</span>
          </span>
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col gap-4 p-6">
          <header>
            <h3 className="text-lg font-bold leading-snug text-ink">{agent.name}</h3>
            <p className="mt-0.5 text-sm font-semibold text-sun-deep">{agent.title}</p>
          </header>

          <Stars rating={agent.rating} name={agent.name} />

          {/* specialties */}
          <div className="flex flex-wrap gap-1.5">
            {agent.specialties.map(s => (
              <Pill key={s} tone="outline" className="border-transparent bg-brand-soft text-brand">
                {s}
              </Pill>
            ))}
          </div>

          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{agent.bio}</p>

          {/* book stats + listings link */}
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-4">
            <p className="text-xs font-semibold text-brand">
              {t('agents.activeListings', { count: agent.listingCount })}
              <span className="ml-1.5 font-normal text-muted-foreground">
                {t('agents.avg', { price: formatKes(agent.avgPrice, { compact: true }) })}
              </span>
            </p>
            <button
              type="button"
              className="flex min-h-11 items-center gap-1 text-xs font-bold text-brand hover:text-brand-mid hover:underline"
              onClick={() => setFilterAndGo({ q: agent.name }, 'properties')}
              aria-label={`View listings by ${agent.name}`}
            >
              {t('agents.viewListings')}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* actions */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${agent.phone}`}
              aria-label={`Call ${agent.name}`}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line text-brand transition-colors hover:border-brand-mid hover:bg-brand-soft"
            >
              <Phone className="size-4" aria-hidden="true" />
            </a>
            <a
              href={`mailto:${agent.email}`}
              aria-label={`Email ${agent.name}`}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line text-brand transition-colors hover:border-brand-mid hover:bg-brand-soft"
            >
              <Mail className="size-4" aria-hidden="true" />
            </a>
            <a
              href={whatsappLink(agent.phone, waText)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${agent.name}`}
              className="flex h-11 min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1faa53] text-sm font-bold text-white transition-colors hover:bg-[#178f45]"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

function AgentCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white" aria-hidden="true">
      <div className="shimmer h-56 w-full" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3.5 w-1/2" />
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  )
}

/* --------------------------- sell-with-us band ------------------------ */

const SELL_POINTS = [
  {
    icon: TrendingUp,
    titleKey: 'agents.sell1Title',
    bodyKey: 'agents.sell1Body',
  },
  {
    icon: Camera,
    titleKey: 'agents.sell2Title',
    bodyKey: 'agents.sell2Body',
  },
  {
    icon: Handshake,
    titleKey: 'agents.sell3Title',
    bodyKey: 'agents.sell3Body',
  },
] as const

/* -------------------------------- view -------------------------------- */

export default function AgentsView() {
  const { properties, loading, error } = useProperties()
  const agents = useTeamAgents(properties)
  const setView = useAppStore(s => s.setView)
  const { t } = useI18n()

  return (
    <div className="flex flex-col">
      {/* hero + roster */}
      <Section className="pb-16 sm:pb-20">
        <SectionHeading
          align="left"
          eyebrow={t('agents.eyebrow')}
          title={t('agents.titleFull')}
          description={
            agents.length > 0
              ? t('agents.descAll', { count: agents.length })
              : t('agents.desc')
          }
        />

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading agents">
            {Array.from({ length: 6 }, (_, i) => (
              <AgentCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={Users}
            title={t('agents.errorTitle')}
            description={error}
            className="bg-paper"
          />
        ) : agents.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t('agents.emptyTitle')}
            description={t('agents.emptyBody')}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {agents.map((a, i) => (
              <AgentCard key={a.slug} agent={a} index={i} />
            ))}
          </div>
        )}
      </Section>

      {/* why sell with Delima */}
      <Section tone="soft">
        <SectionHeading
          eyebrow={t('agents.sellEyebrow')}
          title={t('agents.sellTitle')}
          description={t('agents.sellDesc')}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {SELL_POINTS.map(({ icon: Icon, titleKey, bodyKey }, i) => (
            <Reveal key={titleKey} delay={i * 0.08} className="h-full">
              <div className="card-modern h-full p-6">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{t(titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(bodyKey)}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-10 flex flex-col items-center text-center">
          <Button
            size="lg"
            className="btn-sun h-12 min-h-11 rounded-full px-8 text-base font-bold"
            onClick={() => setView('valuation')}
            aria-label={t('agents.freeValuation')}
          >
            {t('agents.freeValuation')}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            {t('agents.freeValuationNote')}
          </p>
        </Reveal>
      </Section>
    </div>
  )
}
