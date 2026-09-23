// Delima Realtors Platform 2.0 — "Your Delima advisors" (Task 5-d)
// Team roster derived live from listings; call / WhatsApp / email actions.
'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  TrendingUp,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useProperties } from '@/hooks/use-delima-data'
import { useAppStore } from '@/lib/store'
import { formatKes, whatsappLink } from '@/lib/format'
import type { AgentDTO } from '@/lib/types'

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

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

function Stars({ rating, name }: { rating: number; name: string }) {
  const filled = Math.round(rating)
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < filled ? 'fill-gold text-gold' : 'text-muted-foreground/40'}`}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-muted-foreground">{rating.toFixed(1)}</span>
      <span className="sr-only">stars for {name}</span>
    </div>
  )
}

function AgentCard({ agent, index }: { agent: AgentCardData; index: number }) {
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)
  const waText = `Hello ${agent.name}, I found you through Delima Realtors and I'd like to talk about ${agent.listingCount > 0 ? 'your current listings' : 'buying a home in Nairobi'}.`

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.35), ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="luxury-card flex h-full flex-col border-border/80">
        <CardContent className="flex h-full flex-col gap-4 p-6">
          {/* identity */}
          <div className="flex items-start gap-4">
            <Avatar className="size-20 shrink-0 ring-2 ring-gold ring-offset-2 ring-offset-card">
              <AvatarImage
                src={agent.photo}
                alt={`Portrait of ${agent.name}, ${agent.title}`}
                loading="lazy"
              />
              <AvatarFallback className="gold-gradient-bg font-display text-lg text-espresso">
                {initials(agent.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-display text-xl leading-snug">{agent.name}</h3>
              <p className="eyebrow mt-1 text-[0.65rem] leading-relaxed">{agent.title}</p>
              <div className="mt-2">
                <Stars rating={agent.rating} name={agent.name} />
              </div>
            </div>
          </div>

          {/* specialties */}
          <div className="flex flex-wrap gap-1.5">
            {agent.specialties.map(s => (
              <Badge
                key={s}
                variant="outline"
                className="border-gold/40 bg-gold/5 text-[11px] font-medium text-gold-deep dark:text-gold-soft"
              >
                {s}
              </Badge>
            ))}
          </div>

          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{agent.bio}</p>

          {/* book stats */}
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
              {agent.listingCount} active {agent.listingCount === 1 ? 'listing' : 'listings'}
            </span>
            <span className="text-xs text-muted-foreground">
              avg {formatKes(agent.avgPrice, { compact: true })}
            </span>
          </div>

          <Separator className="bg-border/70" />

          {/* actions */}
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <Button
              asChild
              size="icon"
              variant="outline"
              className="size-11 border-gold/40 hover:border-gold hover:bg-gold/10"
            >
              <a href={`tel:${agent.phone}`} aria-label={`Call ${agent.name}`}>
                <Phone className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button
              asChild
              size="icon"
              variant="outline"
              className="size-11 border-gold/40 hover:border-gold hover:bg-gold/10"
            >
              <a
                href={whatsappLink(agent.phone, waText)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp ${agent.name}`}
              >
                <MessageCircle className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button
              asChild
              size="icon"
              variant="outline"
              className="size-11 border-gold/40 hover:border-gold hover:bg-gold/10"
            >
              <a href={`mailto:${agent.email}`} aria-label={`Email ${agent.name}`}>
                <Mail className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button
              variant="ghost"
              className="ml-auto h-11 gap-1.5 px-3 font-semibold text-gold-deep hover:bg-gold/10 hover:text-gold-deep dark:text-gold dark:hover:text-gold"
              onClick={() => setFilterAndGo({ q: agent.name }, 'properties')}
              aria-label={`View listings by ${agent.name}`}
            >
              View listings
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const TRUST_STATS = [
  { icon: TrendingUp, value: 'KES 4.2B+', label: 'Career sales closed by the desk' },
  { icon: MapPin, value: '9', label: 'Neighborhoods covered across Nairobi' },
  { icon: Clock3, value: '48h', label: 'Average listing-to-viewing turnaround' },
] as const

export default function AgentsView() {
  const { properties, loading, error } = useProperties()
  const agents = useTeamAgents(properties)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      {/* header */}
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 max-w-2xl"
      >
        <p className="eyebrow mb-3">The Team</p>
        <h2 className="gold-underline font-display text-3xl leading-tight sm:text-4xl md:text-5xl">
          Your Delima <span className="gold-gradient-text">advisors</span>
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
          {agents.length > 0
            ? `${agents.length} specialist advisors, one standard: every mandate handled with discretion, pace and deep Nairobi knowledge.`
            : 'Specialist advisors with one standard: discretion, pace and deep Nairobi knowledge.'}
        </p>
      </motion.header>

      {/* grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={i} className="border-border/80">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="size-20 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/5" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-11 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/40">
          <CardContent className="p-8 text-center">
            <p className="font-display text-lg">The team roster could not be loaded</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((a, i) => (
            <AgentCard key={a.slug} agent={a} index={i} />
          ))}
        </div>
      )}

      {/* trust band */}
      <section aria-label="Why Nairobi trusts Delima" className="mt-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {TRUST_STATS.map(({ icon: Icon, value, label }) => (
            <Card
              key={label}
              className="luxury-shadow border-espresso/10 bg-espresso text-cream dark:border-gold/25 dark:bg-espresso-soft dark:text-foreground"
            >
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full gold-gradient-bg text-espresso">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-2xl leading-none gold-gradient-text">{value}</p>
                  <p className="mt-1.5 text-xs leading-snug text-cream/75 dark:text-foreground/75">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
