// Delima Realtors 3.0 — buyer account view (issue #59)
// Guest → sign-in / create-account card. Authed → dashboard with saved homes,
// saved searches and profile editing. Bilingual via i18n (issue #62).
'use client'

import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Heart,
  LogOut,
  MapPinned,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useBuyerStore } from '@/lib/buyer-store'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { formatDate } from '@/lib/format'
import { Container, EmptyState, Reveal } from './ui-kit'
import { PropertyCard } from './property-card'

function AuthCard() {
  const { t } = useI18n()
  const { toast } = useToast()
  const register = useBuyerStore(s => s.register)
  const login = useBuyerStore(s => s.login)
  const guestFavorites = useAppStore(s => s.favorites.length)
  const [busy, setBusy] = useState(false)

  async function handleAuth(e: FormEvent<HTMLFormElement>, mode: 'signin' | 'signup') {
    e.preventDefault()
    if (busy) return
    const form = new FormData(e.currentTarget)
    setBusy(true)

    const result =
      mode === 'signup'
        ? await register({
            name: String(form.get('name') ?? ''),
            email: String(form.get('email') ?? ''),
            phone: String(form.get('phone') ?? '') || undefined,
            password: String(form.get('password') ?? ''),
          })
        : await login({
            email: String(form.get('email') ?? ''),
            password: String(form.get('password') ?? ''),
          })
    setBusy(false)

    if (result.ok) {
      if (mode === 'signup') {
        toast({ title: t('account.signUpTitle'), description: t('account.signUpBlurb') })
      }
      const buyer = useBuyerStore.getState().buyer
      toast({
        title: buyer ? t('account.welcomeToast', { name: buyer.name.split(' ')[0] }) : t('account.signInTitle'),
        description: guestFavorites > 0 ? t('account.synced', { count: guestFavorites }) : undefined,
      })
    } else {
      toast({ title: result.error ?? t('ai.error'), variant: 'destructive' })
    }
  }

  return (
    <Reveal>
      <Card className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border-line">
        <div className="h-1.5 w-full bg-gradient-to-r from-brand via-brand-mid to-sun" aria-hidden />
        <CardContent className="p-6 sm:p-8">
          <Tabs defaultValue="signin">
            <TabsList className="mb-6 grid w-full grid-cols-2 rounded-full">
              <TabsTrigger value="signin" className="rounded-full text-sm font-bold">
                {t('account.signInTab')}
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full text-sm font-bold">
                {t('account.signUpTab')}
              </TabsTrigger>
            </TabsList>

            {/* sign in */}
            <TabsContent value="signin">
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
                {t('account.signInTitle')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('account.signInBlurb')}</p>
              <form onSubmit={e => void handleAuth(e, 'signin')} className="mt-5 grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="signin-email">{t('account.email')}</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={t('footer.emailPlaceholder')}
                    className="min-h-[44px] rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="signin-password">{t('account.password')}</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="current-password"
                    className="min-h-[44px] rounded-xl"
                  />
                </div>
                <Button type="submit" disabled={busy} aria-busy={busy} className="btn-sun mt-1 min-h-[48px] gap-2 rounded-full text-sm font-bold">
                  {t('account.signInCta')}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </form>
            </TabsContent>

            {/* create account */}
            <TabsContent value="signup">
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
                {t('account.signUpTitle')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('account.signUpBlurb')}</p>
              <form onSubmit={e => void handleAuth(e, 'signup')} className="mt-5 grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="signup-name">{t('account.fullName')}</Label>
                  <Input
                    id="signup-name"
                    name="name"
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="name"
                    placeholder="Amina Wanjiru"
                    className="min-h-[44px] rounded-xl"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="signup-email">{t('account.email')}</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder={t('footer.emailPlaceholder')}
                      className="min-h-[44px] rounded-xl"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="signup-phone">{t('account.phone')}</Label>
                    <Input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+254 7XX XXX XXX"
                      className="min-h-[44px] rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="signup-password">{t('account.password')}</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="min-h-[44px] rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">{t('account.passwordHint')}</p>
                </div>
                <Button type="submit" disabled={busy} aria-busy={busy} className="btn-sun mt-1 min-h-[48px] gap-2 rounded-full text-sm font-bold">
                  {t('account.signUpCta')}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
            {t('account.demoNote')}
          </p>
        </CardContent>
      </Card>
    </Reveal>
  )
}

function AccountSkeleton() {
  const { t } = useI18n()
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md space-y-4" aria-busy="true" aria-label={t('common.loading')}>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
    </Container>
  )
}

export default function AccountView() {
  const { t } = useI18n()
  const { toast } = useToast()
  const status = useBuyerStore(s => s.status)
  const buyer = useBuyerStore(s => s.buyer)
  const savedProperties = useBuyerStore(s => s.savedProperties)
  const searches = useBuyerStore(s => s.searches)
  const logout = useBuyerStore(s => s.logout)
  const updateProfile = useBuyerStore(s => s.updateProfile)
  const removeSavedSearch = useBuyerStore(s => s.removeSavedSearch)
  const setFilterAndGo = useAppStore(s => s.setFilterAndGo)
  const setView = useAppStore(s => s.setView)

  if (status === 'loading') return <AccountSkeleton />

  /* ------------------------------ guest ------------------------------ */
  if (status === 'guest' || !buyer) {
    return (
      <Container className="py-10 md:py-16">
        <div className="mx-auto mb-8 max-w-md text-center">
          <p className="eyebrow">{t('nav.account')}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {t('account.title')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('account.subtitle')}</p>
        </div>
        <AuthCard />
      </Container>
    )
  }

  /* ------------------------------ authed ----------------------------- */
  async function handleSignOut() {
    await logout()
    toast({ title: t('account.signedOut') })
    setView('home')
  }

  async function handleProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const result = await updateProfile({
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
    })
    toast(
      result.ok
        ? { title: t('account.changesSaved') }
        : { title: result.error ?? t('ai.error'), variant: 'destructive' },
    )
  }

  return (
    <Container className="py-8 md:py-12">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">{t('nav.account')}</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {t('account.welcome', { name: buyer.name.split(' ')[0] })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('account.memberSince', { date: formatDate(buyer.createdAt) })}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void handleSignOut()}
          className="min-h-[44px] gap-2 rounded-full"
        >
          <LogOut className="size-4" aria-hidden />
          {t('account.signOut')}
        </Button>
      </div>

      {/* stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card-modern flex items-center gap-3 p-4">
          <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
            <Heart className="size-4.5" aria-hidden />
          </span>
          <span>
            <span className="block text-xl font-extrabold text-ink">{savedProperties.length}</span>
            <span className="block text-xs font-semibold text-muted-foreground">{t('account.savedHomes')}</span>
          </span>
        </div>
        <div className="card-modern flex items-center gap-3 p-4">
          <span className="grid size-10 place-items-center rounded-xl bg-sun-soft text-sun-deep">
            <Search className="size-4.5" aria-hidden />
          </span>
          <span>
            <span className="block text-xl font-extrabold text-ink">{searches.length}</span>
            <span className="block text-xs font-semibold text-muted-foreground">{t('account.savedSearches')}</span>
          </span>
        </div>
        <div className="card-modern col-span-2 flex items-center gap-3 p-4 sm:col-span-1">
          <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
            <UserRound className="size-4.5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-ink">{buyer.email}</span>
            <span className="block text-xs font-semibold text-muted-foreground">{buyer.phone || '—'}</span>
          </span>
        </div>
      </div>

      {/* saved homes */}
      <section aria-labelledby="saved-homes-heading" className="mt-12">
        <h2 id="saved-homes-heading" className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          {t('account.savedHomes')}
        </h2>
        {savedProperties.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Heart}
              title={t('account.savedHomes')}
              description={t('account.noSavedHomes')}
              className="min-h-56"
              action={
                <Button onClick={() => setView('properties')} className="btn-sun h-11 gap-2 rounded-full px-6 text-sm font-bold">
                  {t('account.browseHomes')}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedProperties.map(p => (
              <PropertyCard key={p.slug} property={p} />
            ))}
          </div>
        )}
      </section>

      {/* saved searches */}
      <section aria-labelledby="saved-searches-heading" className="mt-12">
        <h2 id="saved-searches-heading" className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          {t('account.savedSearches')}
        </h2>
        {searches.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Search}
              title={t('account.savedSearches')}
              description={t('account.noSavedSearches')}
              className="min-h-56"
              action={
                <Button onClick={() => setView('properties')} className="h-11 gap-2 rounded-full px-6 text-sm font-bold">
                  {t('account.exploreProperties')}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {searches.map(s => (
              <li key={s.id} className="card-modern flex items-center gap-3 p-4">
                <MapPinned className="size-5 shrink-0 text-brand" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[s.filters.type !== 'ALL' ? s.filters.type : null, s.filters.neighborhood !== 'ALL' ? s.filters.neighborhood : null, s.filters.beds > 0 ? t('props.bedsPlus', { count: s.filters.beds }) : null]
                      .filter(Boolean)
                      .join(' · ') || t('props.allNeighborhoods')}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setFilterAndGo(s.filters, 'properties')}
                  className="h-9 rounded-full px-4 text-xs font-bold"
                >
                  {t('props.applySearch')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void removeSavedSearch(s.id)}
                  aria-label={t('common.remove')}
                  className="h-9 rounded-full px-3 text-xs font-semibold text-muted-foreground hover:text-destructive"
                >
                  {t('common.remove')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* profile */}
      <section aria-labelledby="profile-heading" className="mt-12 max-w-xl">
        <h2 id="profile-heading" className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          {t('account.profile')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('account.profileBlurb')}</p>
        <form onSubmit={e => void handleProfile(e)} className="card-modern mt-4 grid gap-4 p-5 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="profile-name">{t('account.fullName')}</Label>
            <Input
              id="profile-name"
              name="name"
              defaultValue={buyer.name}
              required
              minLength={2}
              maxLength={80}
              className="min-h-[44px] rounded-xl"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="profile-phone">{t('booking.phone')}</Label>
            <Input
              id="profile-phone"
              name="phone"
              type="tel"
              defaultValue={buyer.phone}
              placeholder="+254 7XX XXX XXX"
              className="min-h-[44px] rounded-xl"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="btn-sun min-h-[44px] gap-2 rounded-full px-6 text-sm font-bold">
              {t('account.saveChanges')}
            </Button>
          </div>
        </form>
      </section>
    </Container>
  )
}
