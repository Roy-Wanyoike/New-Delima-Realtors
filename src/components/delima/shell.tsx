// Delima Realtors 3.0 — app shell: header, booking dialog, mobile nav, footer
// Owner: REV-1 (shell engineer). Exports: DelimaHeader, DelimaFooter, MobileNav
'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { create } from 'zustand'
import { motion } from 'framer-motion'
import {
  CalendarCheck,
  ChevronRight,
  Compass,
  Facebook,
  Home,
  Instagram,
  Linkedin,
  LineChart,
  Loader2,
  Mail,
  Map,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  UserRound,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FilterState, View } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { useBuyerStore } from '@/lib/buyer-store'
import { useI18n, type DictKey } from '@/lib/i18n'
import { useInsights } from '@/hooks/use-delima-data'
import { useToast } from '@/hooks/use-toast'
import { whatsappLink } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LanguageSwitcher } from '@/components/delima/language-switcher'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Reveal } from '@/components/delima/ui-kit'
import { cn, fetchWithTimeout } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Shell-level UI state (menu + booking dialog shared across shell)    */
/* ------------------------------------------------------------------ */

interface ShellUiState {
  menuOpen: boolean
  bookingOpen: boolean
  setMenuOpen: (open: boolean) => void
  setBookingOpen: (open: boolean) => void
}

const useShellUi = create<ShellUiState>(set => ({
  menuOpen: false,
  bookingOpen: false,
  setMenuOpen: menuOpen => set({ menuOpen }),
  setBookingOpen: bookingOpen => set({ bookingOpen }),
}))

const AGENT_PHONE_DISPLAY = '+254 727 523 752'
const AGENT_PHONE_TEL = 'tel:+254727523752'
const AGENT_EMAIL = 'hello@delimarealtors.co.ke'

/* ------------------------------------------------------------------ */
/* Shared nav model                                                    */
/* ------------------------------------------------------------------ */

interface NavActions {
  setView: (v: View) => void
  setFilterAndGo: (f: Partial<FilterState>, v?: View) => void
}

interface NavItem {
  labelKey: DictKey
  icon?: LucideIcon
  active: (view: View, status: FilterState['status']) => boolean
  go: (actions: NavActions) => void
}

const NAV_ITEMS: NavItem[] = [
  {
    labelKey: 'nav.home',
    icon: Home,
    active: view => view === 'home',
    go: ({ setView }) => setView('home'),
  },
  {
    labelKey: 'nav.buy',
    active: (view, status) => view === 'properties' && status === 'FOR_SALE',
    go: ({ setFilterAndGo }) => setFilterAndGo({ status: 'FOR_SALE' }, 'properties'),
  },
  {
    labelKey: 'nav.rent',
    active: (view, status) => view === 'properties' && status === 'FOR_RENT',
    go: ({ setFilterAndGo }) => setFilterAndGo({ status: 'FOR_RENT' }, 'properties'),
  },
  {
    labelKey: 'nav.properties',
    active: (view, status) =>
      (view === 'properties' || view === 'property') &&
      status !== 'FOR_SALE' &&
      status !== 'FOR_RENT',
    go: ({ setView }) => setView('properties'),
  },
  {
    labelKey: 'nav.insights',
    active: view => view === 'insights',
    go: ({ setView }) => setView('insights'),
  },
  {
    labelKey: 'nav.team',
    icon: Compass,
    active: view => view === 'agents',
    go: ({ setView }) => setView('agents'),
  },
]

/* ------------------------------------------------------------------ */
/* Brand mark — evergreen gradient monogram + wordmark                 */
/* ------------------------------------------------------------------ */

function BrandMark({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className="flex min-h-[44px] items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-mid soft-shadow"
      >
        <span className="font-display text-lg font-extrabold leading-none text-white">D</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn('font-display text-lg font-extrabold tracking-tight', onDark ? 'text-white' : 'text-ink')}>
          Delima
        </span>
        <span className={cn('mt-1 text-[0.55rem] font-bold uppercase tracking-[0.34em]', onDark ? 'text-sun' : 'text-sun-deep')}>
          Realtors
        </span>
      </span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Booking dialog — "Book a Viewing" lead form (shared header/footer)  */
/* POST /api/leads { name, email, phone, message?, source? } → 201     */
/* ------------------------------------------------------------------ */

interface BookingForm {
  name: string
  email: string
  phone: string
  date: string
  message: string
}

const EMPTY_BOOKING: BookingForm = { name: '', email: '', phone: '', date: '', message: '' }

function BookingDialog() {
  const open = useShellUi(s => s.bookingOpen)
  const setOpen = useShellUi(s => s.setBookingOpen)
  const { t } = useI18n()
  const { toast } = useToast()
  const [form, setForm] = useState<BookingForm>(EMPTY_BOOKING)
  const [submitting, setSubmitting] = useState(false)

  // Fresh form every time the dialog (re)opens.
  useEffect(() => {
    if (!open) {
      setForm(EMPTY_BOOKING)
      setSubmitting(false)
    }
  }, [open])

  const today = new Date().toISOString().slice(0, 10)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)

    // The leads API has no dedicated date column — carry the preferred date
    // inside the message so the CRM still sees it.
    const messageParts = [
      form.date ? `Preferred viewing date: ${form.date}` : '',
      form.message.trim(),
    ].filter(Boolean)

    try {
      const res = await fetchWithTimeout('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          ...(messageParts.length > 0 ? { message: messageParts.join(' — ') } : {}),
          source: 'VIEWING_REQUEST',
        }),
      })

      if (res.ok) {
        toast({
          title: t('booking.successTitle'),
          description: t('booking.successDesc'),
        })
        setOpen(false)
      } else {
        let description = t('booking.errorDesc')
        try {
          const data: unknown = await res.json()
          if (data && typeof data === 'object' && 'error' in data) {
            const payload = data as { error?: unknown; issues?: Array<{ message?: unknown }> }
            const firstIssue = Array.isArray(payload.issues) ? payload.issues[0]?.message : undefined
            if (typeof firstIssue === 'string' && firstIssue.length > 0) description = firstIssue
            else if (typeof payload.error === 'string' && payload.error.length > 0) description = payload.error
          }
        } catch {
          // non-JSON error body — keep the generic copy
        }
        toast({ title: t('booking.errorTitle'), description, variant: 'destructive' })
      }
    } catch {
      toast({
        title: t('booking.networkError'),
        description: t('booking.networkErrorDesc'),
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:max-w-md delima-scroll">
        <DialogHeader className="text-left">
          <span className="eyebrow mb-1">Delima Realtors</span>
          <DialogTitle className="text-2xl font-extrabold tracking-tight text-ink">
            {t('booking.title')}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {t('booking.blurb')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={e => void handleSubmit(e)} className="mt-2 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="booking-name">{t('booking.fullName')}</Label>
            <Input
              id="booking-name"
              required
              minLength={2}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Amina Wanjiru"
              autoComplete="name"
              className="min-h-[44px] rounded-xl"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="booking-email">{t('booking.email')}</Label>
              <Input
                id="booking-email"
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                autoComplete="email"
                className="min-h-[44px] rounded-xl"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="booking-phone">{t('booking.phone')}</Label>
              <Input
                id="booking-phone"
                type="tel"
                required
                minLength={7}
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+254 7XX XXX XXX"
                autoComplete="tel"
                className="min-h-[44px] rounded-xl"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="booking-date">{t('booking.date')}</Label>
            <Input
              id="booking-date"
              type="date"
              min={today}
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="min-h-[44px] rounded-xl"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="booking-message">
              {t('booking.message')} <span className="font-normal text-muted-foreground">{t('booking.optional')}</span>
            </Label>
            <Textarea
              id="booking-message"
              rows={3}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder={t('booking.messagePlaceholder')}
              className="resize-none rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="btn-sun min-h-[48px] w-full gap-2 rounded-full text-sm font-bold"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <CalendarCheck className="size-4" aria-hidden="true" />
            )}
            {submitting ? t('booking.sending') : t('booking.submit')}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            {t('booking.consent')}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Mobile menu sheet — shared by header hamburger + MobileNav "More"   */
/* ------------------------------------------------------------------ */

function MobileMenuSheet() {
  const menuOpen = useShellUi(s => s.menuOpen)
  const setMenuOpen = useShellUi(s => s.setMenuOpen)
  const setBookingOpen = useShellUi(s => s.setBookingOpen)
  const view = useAppStore(s => s.view)
  const status = useAppStore(s => s.filters.status)
  const setView = useAppStore(s => s.setView)
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)
  const { t } = useI18n()
  const buyer = useBuyerStore(s => s.buyer)

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b border-line pb-4 pt-2">
          <div className="flex items-center gap-2.5">
            <BrandMark />
          </div>
          <SheetDescription className="sr-only">
            {t('nav.menu')}
          </SheetDescription>
          <SheetTitle className="sr-only">{t('nav.menu')}</SheetTitle>
        </SheetHeader>

        <nav aria-label={t('nav.menu')} className="delima-scroll flex-1 overflow-y-auto px-4 py-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map(item => {
              const active = item.active(view, status)
              const Icon = item.icon
              return (
                <li key={item.labelKey}>
                  <button
                    type="button"
                    onClick={() => {
                      item.go({ setView, setFilterAndGo })
                      setMenuOpen(false)
                    }}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-base font-medium transition-colors hover:bg-brand-soft/70 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active && 'bg-brand-soft/70 font-bold text-brand',
                    )}
                  >
                    {Icon ? <Icon className="size-4.5 shrink-0" aria-hidden="true" /> : null}
                    {t(item.labelKey)}
                    {active ? (
                      <span className="ml-auto size-1.5 rounded-full bg-sun" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
                    )}
                  </button>
                </li>
              )
            })}

            {/* account entry */}
            <li className="mt-1 border-t border-line pt-1">
              <button
                type="button"
                onClick={() => {
                  setView('account')
                  setMenuOpen(false)
                }}
                aria-current={view === 'account' ? 'page' : undefined}
                className={cn(
                  'flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-base font-medium transition-colors hover:bg-brand-soft/70 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  view === 'account' && 'bg-brand-soft/70 font-bold text-brand',
                )}
              >
                <UserRound className="size-4.5 shrink-0" aria-hidden="true" />
                {buyer ? t('nav.account') : t('header.signIn')}
                <ChevronRight className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
              </button>
            </li>
          </ul>

          <div className="mt-4 px-1">
            <LanguageSwitcher />
          </div>
        </nav>

        <div className="border-t border-line px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
          <a
            href={AGENT_PHONE_TEL}
            className="flex min-h-[44px] items-center gap-2.5 text-sm font-semibold text-ink transition-colors hover:text-brand"
          >
            <Phone className="size-4 text-sun-deep" aria-hidden="true" />
            {AGENT_PHONE_DISPLAY}
          </a>
          <Button
            onClick={() => {
              setMenuOpen(false)
              setBookingOpen(true)
            }}
            className="btn-sun mt-3 min-h-[48px] w-full gap-2 rounded-full text-sm font-bold"
          >
            <CalendarCheck className="size-4" aria-hidden="true" />
            {t('header.bookViewing')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ */
/* DelimaHeader — sticky glass header                                  */
/* ------------------------------------------------------------------ */

export function DelimaHeader() {
  const view = useAppStore(s => s.view)
  const status = useAppStore(s => s.filters.status)
  const setView = useAppStore(s => s.setView)
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)
  const goHome = useAppStore(s => s.goHome)
  const setMenuOpen = useShellUi(s => s.setMenuOpen)
  const setBookingOpen = useShellUi(s => s.setBookingOpen)
  const menuOpen = useShellUi(s => s.menuOpen)
  const buyer = useBuyerStore(s => s.buyer)
  const buyerStatus = useBuyerStore(s => s.status)
  const { t } = useI18n()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className="glass sticky top-0 z-50 border-b border-line">
        <div
          className={cn(
            'container-page flex items-center justify-between gap-3 transition-all duration-300',
            scrolled ? 'h-14 md:h-16' : 'h-16 md:h-[72px]',
          )}
        >
          {/* logo */}
          <button
            type="button"
            onClick={goHome}
            aria-label="Delima Realtors — home"
            className="-ml-1 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BrandMark />
          </button>

          {/* desktop nav */}
          <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
            {NAV_ITEMS.map(item => {
              const active = item.active(view, status)
              return (
                <button
                  key={item.labelKey}
                  type="button"
                  onClick={() => item.go({ setView, setFilterAndGo })}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex min-h-[44px] items-center rounded-full px-3.5 text-sm font-medium transition-colors hover:bg-brand-soft/70 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active ? 'font-bold text-brand' : 'text-ink/70',
                  )}
                >
                  {t(item.labelKey)}
                  {active && (
                    <span
                      className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-sun"
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </nav>

          {/* right cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <a
              href={AGENT_PHONE_TEL}
              className="hidden min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-semibold text-ink transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:flex"
            >
              <Phone className="size-4 text-sun-deep" aria-hidden="true" />
              {AGENT_PHONE_DISPLAY}
            </a>
            {/* account / sign-in */}
            <button
              type="button"
              onClick={() => setView('account')}
              aria-label={buyer ? t('header.account') : t('header.signIn')}
              aria-current={view === 'account' ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-[44px] items-center gap-2 rounded-full px-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                view === 'account'
                  ? 'bg-brand-soft/70 font-bold text-brand'
                  : 'text-ink/80 hover:bg-brand-soft/70 hover:text-brand',
              )}
            >
              {buyer && buyerStatus === 'authed' ? (
                <span
                  aria-hidden="true"
                  className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-mid text-xs font-extrabold text-white"
                >
                  {buyer.name.trim().charAt(0).toUpperCase()}
                </span>
              ) : (
                <UserRound className="size-5" aria-hidden="true" />
              )}
              <span className="hidden lg:inline">{buyer ? t('header.account') : t('header.signIn')}</span>
            </button>
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="btn-sun inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-5"
            >
              <CalendarCheck className="size-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{t('header.bookViewing')}</span>
              <span className="sm:hidden">{t('header.bookShort')}</span>
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t('header.openMenu')}
              aria-expanded={menuOpen}
              className="inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-brand-soft/70 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenuSheet />
      <BookingDialog />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* MobileNav — fixed bottom bar (below sm only)                        */
/* ------------------------------------------------------------------ */

interface MobileNavItem {
  labelKey: DictKey
  icon: LucideIcon
  active: (view: View) => boolean
  go: (actions: NavActions & { setMenuOpen: (open: boolean) => void }) => void
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  {
    labelKey: 'nav.home',
    icon: Home,
    active: view => view === 'home',
    go: ({ setView }) => setView('home'),
  },
  {
    labelKey: 'nav.explore',
    icon: Compass,
    active: view => view === 'properties' || view === 'property',
    go: ({ setView }) => setView('properties'),
  },
  {
    labelKey: 'nav.map',
    icon: Map,
    active: view => view === 'map',
    go: ({ setView }) => setView('map'),
  },
  {
    labelKey: 'nav.insights',
    icon: LineChart,
    active: view => view === 'insights',
    go: ({ setView }) => setView('insights'),
  },
  {
    labelKey: 'nav.more',
    icon: Menu,
    active: view =>
      view === 'agents' || view === 'finance' || view === 'admin' || view === 'valuation' || view === 'account',
    go: ({ setMenuOpen }) => setMenuOpen(true),
  },
]

export function MobileNav() {
  const view = useAppStore(s => s.view)
  const setView = useAppStore(s => s.setView)
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)
  const setMenuOpen = useShellUi(s => s.setMenuOpen)
  const { t } = useI18n()

  return (
    <nav
      aria-label="Mobile navigation"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line sm:hidden"
    >
      <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {MOBILE_NAV_ITEMS.map(item => {
          const active = item.active(view)
          const Icon = item.icon
          return (
            <button
              key={item.labelKey}
              type="button"
              onClick={() => item.go({ setView, setFilterAndGo, setMenuOpen })}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-[60px] flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active ? 'font-bold text-brand' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="text-[10px] font-semibold tracking-wide">{t(item.labelKey)}</span>
              {active && (
                <span className="absolute top-1.5 size-1 rounded-full bg-sun" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/* DelimaFooter — evergreen footer, sticks to viewport bottom (mt-auto)*/
/* ------------------------------------------------------------------ */

interface FooterLink {
  labelKey: DictKey
  go: (actions: NavActions) => void
}

const EXPLORE_LINKS: FooterLink[] = [
  {
    labelKey: 'footer.buy',
    go: ({ setFilterAndGo }) => setFilterAndGo({ status: 'FOR_SALE' }, 'properties'),
  },
  {
    labelKey: 'footer.rent',
    go: ({ setFilterAndGo }) => setFilterAndGo({ status: 'FOR_RENT' }, 'properties'),
  },
  {
    labelKey: 'footer.newDevelopments',
    go: ({ setFilterAndGo }) => setFilterAndGo({ status: 'NEW_DEVELOPMENT' }, 'properties'),
  },
  { labelKey: 'footer.mapSearch', go: ({ setView }) => setView('map') },
  { labelKey: 'footer.marketInsights', go: ({ setView }) => setView('insights') },
  { labelKey: 'footer.mortgageTools', go: ({ setView }) => setView('finance') },
]

const FALLBACK_NEIGHBORHOODS: Array<{ slug: string; name: string }> = [
  { slug: 'karen', name: 'Karen' },
  { slug: 'runda', name: 'Runda' },
  { slug: 'lavington', name: 'Lavington' },
  { slug: 'kilimani', name: 'Kilimani' },
  { slug: 'westlands', name: 'Westlands' },
  { slug: 'kileleshwa', name: 'Kileleshwa' },
]

const SOCIAL_LINKS: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Facebook', icon: Facebook },
  { label: 'Instagram', icon: Instagram },
  { label: 'X (Twitter)', icon: X },
  { label: 'LinkedIn', icon: Linkedin },
]

function FooterHeading({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-sun">{children}</h3>
  )
}

export function DelimaFooter() {
  const setView = useAppStore(s => s.setView)
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)
  const setBookingOpen = useShellUi(s => s.setBookingOpen)
  const goHome = useAppStore(s => s.goHome)
  const { neighborhoods, loading: hoodsLoading } = useInsights()
  const { t } = useI18n()
  const { toast } = useToast()
  const openAdmin = () => setView('admin')
  const openAccount = () => setView('account')
  const [subEmail, setSubEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const footerHoods: Array<{ slug: string; name: string }> =
    !hoodsLoading && neighborhoods.length > 0
      ? neighborhoods.map(n => ({ slug: n.slug, name: n.name }))
      : FALLBACK_NEIGHBORHOODS

  async function subscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!subEmail.trim() || subscribing) return
    setSubscribing(true)
    try {
      // Contract: POST /api/subscribe { email } → 201 {ok,already:false} | 200 {ok,already:true}
      const res = await fetchWithTimeout('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail.trim() }),
      })
      if (res.status === 201) {
        setSubEmail('')
        toast({
          title: t('footer.subscribeSuccess'),
          description: t('footer.subscribeSuccessDesc'),
        })
      } else if (res.status === 200) {
        setSubEmail('')
        toast({ title: t('footer.subscribeAlready') })
      } else {
        toast({
          title: t('footer.subscribeFailed'),
          description: t('footer.subscribeFailedDesc'),
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: t('footer.subscribeFailed'),
        description: t('footer.subscribeNetworkDesc'),
        variant: 'destructive',
      })
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="mt-auto bg-brand-deep text-white">
      <div className="container-page grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
        {/* brand */}
        <Reveal>
          <button
            type="button"
            onClick={goHome}
            aria-label="Delima Realtors — home"
            className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sun"
          >
            <BrandMark onDark />
          </button>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
            {t('footer.tagline')}
          </p>
          <div className="mt-6 flex items-center gap-2">
            {SOCIAL_LINKS.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="#"
                aria-label={`Delima Realtors on ${label}`}
                className="flex size-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-sun hover:bg-sun hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
              >
                <Icon className="size-4.5" aria-hidden="true" />
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setBookingOpen(true)}
            className="btn-sun mt-7 inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
          >
            <CalendarCheck className="size-4" aria-hidden="true" />
            {t('header.bookViewing')}
          </button>
        </Reveal>

        {/* explore */}
        <Reveal delay={0.06}>
          <nav aria-label="Footer explore">
            <FooterHeading>{t('footer.explore')}</FooterHeading>
            <ul className="mt-4">
              {EXPLORE_LINKS.map(link => (
                <li key={link.labelKey}>
                  <button
                    type="button"
                    onClick={() => link.go({ setView, setFilterAndGo })}
                    className="flex min-h-[44px] w-full items-center text-left text-sm text-white/65 transition-colors hover:text-sun focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
                  >
                    {t(link.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        {/* neighborhoods */}
        <Reveal delay={0.12}>
          <nav aria-label="Footer neighborhoods">
            <FooterHeading>{t('footer.neighborhoods')}</FooterHeading>
            <ul className="mt-4">
              {footerHoods.map(hood => (
                <li key={hood.slug}>
                  <button
                    type="button"
                    onClick={() => setFilterAndGo({ neighborhood: hood.slug }, 'properties')}
                    className="flex min-h-[44px] w-full items-center text-left text-sm text-white/65 transition-colors hover:text-sun focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
                  >
                    {hood.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        {/* contact + newsletter */}
        <Reveal delay={0.18}>
          <div>
            <FooterHeading>{t('footer.contact')}</FooterHeading>
            <ul className="mt-4">
              <li className="flex min-h-[44px] items-start gap-2.5 text-sm leading-relaxed text-white/65">
                <MapPin className="mt-0.5 size-4 shrink-0 text-sun" aria-hidden="true" />
                Ngong Lane Plaza, Ngong Road, Nairobi
              </li>
              <li>
                <a
                  href={AGENT_PHONE_TEL}
                  className="flex min-h-[44px] items-center gap-2.5 text-sm text-white/65 transition-colors hover:text-sun focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
                >
                  <Phone className="size-4 shrink-0 text-sun" aria-hidden="true" />
                  {AGENT_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${AGENT_EMAIL}`}
                  className="flex min-h-[44px] items-center gap-2.5 text-sm text-white/65 transition-colors hover:text-sun focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
                >
                  <Mail className="size-4 shrink-0 text-sun" aria-hidden="true" />
                  {AGENT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink('+254727523752', 'Hello Delima Realtors!')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] items-center gap-2.5 text-sm text-white/65 transition-colors hover:text-sun focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
                >
                  <MessageCircle className="size-4 shrink-0 text-sun" aria-hidden="true" />
                  {t('footer.whatsappUs')}
                </a>
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <FooterHeading>{t('footer.newsletter')}</FooterHeading>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {t('footer.newsletterBlurb')}
            </p>
            <form onSubmit={e => void subscribe(e)} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                required
                value={subEmail}
                onChange={e => setSubEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label={t('footer.newsletterAria')}
                className="min-h-[44px] flex-1 rounded-xl border-white/15 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-sun"
              />
              <Button
                type="submit"
                disabled={subscribing}
                aria-busy={subscribing}
                className="btn-sun min-h-[44px] gap-2 rounded-full px-5 text-sm font-bold"
              >
                {subscribing && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {subscribing ? t('footer.joining') : t('footer.subscribe')}
              </Button>
            </form>
            <p className="mt-2 text-[11px] text-white/40">{t('footer.noSpam')}</p>
          </div>
        </Reveal>
      </div>

      {/* bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-xs text-white/45 sm:flex-row">
          <p>{t('footer.rights')}</p>
          <nav aria-label="Legal" className="flex items-center gap-5">
            <button
              type="button"
              onClick={openAccount}
              className="transition-colors hover:text-sun focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
            >
              {t('nav.account')}
            </button>
            <a
              href="#"
              className="transition-colors hover:text-sun focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
            >
              {t('footer.privacy')}
            </a>
            <a
              href="#"
              className="transition-colors hover:text-sun focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
            >
              {t('footer.terms')}
            </a>
            <button
              type="button"
              onClick={openAdmin}
              className="transition-colors hover:text-sun focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
            >
              {t('footer.staffLogin')}
            </button>
          </nav>
        </div>
      </div>
    </footer>
  )
}
