// Delima Realtors Platform 2.0 — app shell: header, mobile nav, footer
// Owner: principal-engineer-a (Task 5-a).
// Exports: DelimaHeader, DelimaFooter, MobileNav
'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Building2,
  Calculator,
  Heart,
  Home,
  LineChart,
  Loader2,
  Mail,
  Map,
  MapPin,
  Menu,
  Phone,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { View } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { useInsights } from '@/hooks/use-delima-data'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn, fetchWithTimeout } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Shared nav model                                                    */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string
  short?: string
  view: View
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', view: 'home', icon: Home },
  { label: 'Properties', view: 'properties', icon: Building2 },
  { label: 'Map Search', short: 'Map', view: 'map', icon: Map },
  { label: 'Market Insights', short: 'Insights', view: 'insights', icon: LineChart },
  { label: 'Agents', view: 'agents', icon: Users },
  { label: 'Finance', view: 'finance', icon: Calculator },
]

const MOBILE_NAV: NavItem[] = NAV_ITEMS.slice(0, 4)

function isActive(current: View, target: View): boolean {
  return current === target || (target === 'properties' && current === 'property')
}

/* ------------------------------------------------------------------ */
/* Brand mark — gold diamond monogram                                  */
/* ------------------------------------------------------------------ */

function GoldMark() {
  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center">
      <span className="gold-gradient-bg absolute inset-0 rotate-45 rounded-[7px] luxury-shadow" />
      <span className="relative font-display text-base font-bold text-[#1f1810]">D</span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* DelimaHeader — sticky glassy header                                 */
/* ------------------------------------------------------------------ */

export function DelimaHeader() {
  const view = useAppStore(s => s.view)
  const setView = useAppStore(s => s.setView)
  const goHome = useAppStore(s => s.goHome)
  const favoritesCount = useAppStore(s => s.favorites.length)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-cream/80 backdrop-blur-xl dark:bg-[#141009]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:h-[72px] lg:px-8">
        {/* logo */}
        <button
          type="button"
          onClick={goHome}
          aria-label="Delima Realtors — home"
          className="flex min-h-[44px] items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <GoldMark />
          <span className="flex flex-col text-left leading-none">
            <span className="font-display text-lg font-bold tracking-[0.18em]">DELIMA</span>
            <span className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.38em] text-gold-deep dark:text-gold">
              Realtors
            </span>
          </span>
        </button>

        {/* desktop nav — classic uppercase letter-spaced */}
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map(item => {
            const active = isActive(view, item.view)
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => setView(item.view)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-[44px] items-center px-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] transition-colors hover:text-gold-deep dark:hover:text-gold',
                  active && 'gold-underline text-gold-deep dark:text-gold',
                )}
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* right cluster — classic: phone, saved, gold CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href="tel:+254727523752"
            className="hidden min-h-[44px] flex-col justify-center text-right leading-tight lg:flex"
            aria-label="Call Delima Realtors on +254 727 523 752"
          >
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-muted-foreground">
              Call us
            </span>
            <span className="text-sm font-semibold text-espresso dark:text-cream">+254 727 523 752</span>
          </a>
          <span className="hidden h-8 w-px bg-border lg:block" aria-hidden="true" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView('properties')}
            aria-label={`Saved homes (${favoritesCount})`}
            className="relative size-11 hover:text-gold-deep dark:hover:text-gold"
          >
            <Heart className="size-5" aria-hidden="true" />
            {favoritesCount > 0 && (
              <span className="gold-gradient-bg absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-[#1f1810]">
                {favoritesCount}
              </span>
            )}
          </Button>
          <Button
            onClick={() => setView('properties')}
            className="gold-gradient-bg hidden min-h-[44px] rounded-full border-0 px-5 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#1f1810] hover:opacity-90 sm:inline-flex"
          >
            Book a Viewing
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            className="size-11 md:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* full-screen mobile drawer */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-full sm:max-w-[400px]">
          <SheetHeader className="border-b border-border/50 pb-4 pt-2">
            <div className="flex items-center gap-2.5">
              <GoldMark />
              <SheetTitle className="font-display text-lg font-bold tracking-[0.18em]">
                DELIMA
              </SheetTitle>
            </div>
            <SheetDescription className="sr-only">
              Delima Realtors navigation menu
            </SheetDescription>
          </SheetHeader>
          <nav aria-label="Mobile" className="flex flex-1 flex-col px-6">
            {NAV_ITEMS.map(item => {
              const active = isActive(view, item.view)
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => {
                    setView(item.view)
                    setMenuOpen(false)
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[56px] items-center border-b border-border/50 font-display text-2xl transition-colors hover:text-gold-deep dark:hover:text-gold',
                    active && 'text-gold-deep dark:text-gold',
                  )}
                >
                  {item.label}
                  {active && <span className="gold-gradient-bg ml-auto size-1.5 rounded-full" />}
                </button>
              )
            })}
          </nav>
          <div className="px-6 pb-10">
            <Button
              onClick={() => {
                setView('properties')
                setMenuOpen(false)
              }}
              className="gold-gradient-bg min-h-[48px] w-full font-semibold text-[#1f1810] hover:opacity-90"
            >
              Book a Viewing
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setView('valuation')
                setMenuOpen(false)
              }}
              className="mt-2 min-h-[48px] w-full"
            >
              List with Us
            </Button>
            <p className="mt-5 text-center text-xs text-muted-foreground">
              +254 727 523 752 · info@delimarealtors.com
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/* MobileNav — fixed bottom bar (sm and below)                         */
/* ------------------------------------------------------------------ */

export function MobileNav() {
  const view = useAppStore(s => s.view)
  const setView = useAppStore(s => s.setView)

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-cream/90 backdrop-blur-xl sm:hidden dark:bg-[#141009]/90"
    >
      <div className="grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        {MOBILE_NAV.map(item => {
          const active = isActive(view, item.view)
          const Icon = item.icon
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => setView(item.view)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-[60px] flex-col items-center justify-center gap-1 transition-colors',
                active ? 'text-gold-deep dark:text-gold' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="text-[10px] font-semibold tracking-wide">
                {item.short ?? item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/* DelimaFooter — espresso footer, sticky-footer ready (mt-auto)       */
/* ------------------------------------------------------------------ */

const EXPLORE_VIEWS: Array<{ label: string; view: View }> = [
  { label: 'Home', view: 'home' },
  { label: 'Properties', view: 'properties' },
  { label: 'Map Search', view: 'map' },
  { label: 'Market Insights', view: 'insights' },
  { label: 'Agents', view: 'agents' },
  { label: 'Finance', view: 'finance' },
  { label: 'Free AI Valuation', view: 'valuation' },
  { label: 'Agent CRM (demo)', view: 'admin' },
]

function FooterHeading({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-gold">{children}</h3>
  )
}

export function DelimaFooter() {
  const setView = useAppStore(s => s.setView)
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)
  const { neighborhoods, loading: hoodsLoading } = useInsights()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function subscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim() || subscribeStatus === 'loading') return
    setSubscribeStatus('loading')
    try {
      const res = await fetchWithTimeout('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (res.status === 201) {
        setSubscribeStatus('success')
        setEmail('')
        toast({ title: 'Welcome to the Delima circle' })
      } else if (res.status === 200) {
        setSubscribeStatus('success')
        setEmail('')
        toast({ title: "You're already in the Delima circle" })
      } else {
        setSubscribeStatus('error')
      }
    } catch {
      setSubscribeStatus('error')
    }
  }

  return (
    <footer className="mt-auto bg-ink text-[#f0e9dc] dark:bg-[#0d1b30]">
      <div className="gold-hairline" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:px-8">
        {/* brand + contact */}
        <div>
          <div className="flex items-center gap-2.5">
            <GoldMark />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold tracking-[0.18em] text-white">
                DELIMA
              </span>
              <span className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.38em] text-gold">
                Realtors
              </span>
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#f0e9dc]/60">
            Nairobi&rsquo;s trusted address for luxury homes — from leafy Karen villas to
            penthouses above Westlands. Discreet, data-driven, and always on your side of the
            table.
          </p>
          <ul className="mt-6 space-y-1">
            <li>
              <a
                href="tel:+254727523752"
                className="flex min-h-[44px] items-center gap-2.5 text-sm text-[#f0e9dc]/70 transition-colors hover:text-gold"
              >
                <Phone className="size-4 shrink-0 text-gold" aria-hidden="true" />
                +254 727 523 752
              </a>
            </li>
            <li>
              <a
                href="mailto:info@delimarealtors.com"
                className="flex min-h-[44px] items-center gap-2.5 text-sm text-[#f0e9dc]/70 transition-colors hover:text-gold"
              >
                <Mail className="size-4 shrink-0 text-gold" aria-hidden="true" />
                info@delimarealtors.com
              </a>
            </li>
            <li className="flex min-h-[44px] items-center gap-2.5 text-sm text-[#f0e9dc]/70">
              <MapPin className="size-4 shrink-0 text-gold" aria-hidden="true" />
              Nairobi, Kenya
            </li>
          </ul>
        </div>

        {/* explore */}
        <nav aria-label="Footer explore">
          <FooterHeading>Explore</FooterHeading>
          <ul className="mt-4">
            {EXPLORE_VIEWS.map(item => (
              <li key={item.view}>
                <button
                  type="button"
                  onClick={() => setView(item.view)}
                  className="flex min-h-[44px] w-full items-center text-left text-sm text-[#f0e9dc]/65 transition-colors hover:text-gold"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* neighborhoods */}
        <nav aria-label="Footer neighborhoods">
          <FooterHeading>Neighborhoods</FooterHeading>
          <ul className="mt-4">
            {hoodsLoading && neighborhoods.length === 0
              ? [0, 1, 2, 3, 4, 5].map(i => (
                  <li key={i} className="flex min-h-[44px] items-center">
                    <span
                      className="shimmer h-3.5 rounded bg-white/10"
                      style={{ width: `${55 + ((i * 13) % 35)}%` }}
                    />
                  </li>
                ))
              : neighborhoods.map(n => (
                  <li key={n.slug}>
                    <button
                      type="button"
                      onClick={() => setFilterAndGo({ neighborhood: n.slug }, 'properties')}
                      className="flex min-h-[44px] w-full items-center text-left text-sm text-[#f0e9dc]/65 transition-colors hover:text-gold"
                    >
                      {n.name}
                    </button>
                  </li>
                ))}
          </ul>
        </nav>

        {/* newsletter */}
        <div>
          <FooterHeading>The Delima Circle</FooterHeading>
          <p className="mt-4 text-sm leading-relaxed text-[#f0e9dc]/60">
            Monthly intel on Nairobi&rsquo;s finest listings — off-market homes reach the circle
            first.
          </p>
          <form onSubmit={e => void subscribe(e)} className="mt-5 flex gap-2">
            <Input
              type="email"
              required
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                if (subscribeStatus === 'error') setSubscribeStatus('idle')
              }}
              placeholder="you@example.com"
              aria-label="Email address for the Delima Circle newsletter"
              className="h-11 min-h-[44px] flex-1 border-white/15 bg-white/5 text-[#f0e9dc] placeholder:text-[#f0e9dc]/40"
            />
            <Button
              type="submit"
              disabled={subscribeStatus === 'loading'}
              aria-busy={subscribeStatus === 'loading'}
              className="gold-gradient-bg h-11 min-h-[44px] gap-2 px-5 font-semibold text-[#1f1810] hover:opacity-90"
            >
              {subscribeStatus === 'loading' && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {subscribeStatus === 'loading' ? 'Joining…' : 'Join'}
            </Button>
          </form>
          {subscribeStatus === 'error' && (
            <p role="alert" className="mt-2 text-sm font-medium text-red-400">
              Subscription failed — please try again
            </p>
          )}
          <p className="mt-3 text-[11px] text-[#f0e9dc]/40">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-xs text-[#f0e9dc]/50 sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 Delima Realtors · crafted in Nairobi</p>
          <p className="flex items-center gap-2">
            Nairobi · Kenya
            <span className="gold-gradient-bg inline-block size-2 rotate-45 rounded-[2px]" aria-hidden="true" />
          </p>
        </div>
      </div>
    </footer>
  )
}
