'use client'

// Delima Realtors Platform 2.0 — single-page shell
// Views are switched client-side via the Zustand store (sandbox exposes only this route).

import { useEffect, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import { Moon, Sun } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { DelimaHeader, DelimaFooter, MobileNav } from '@/components/delima/shell'
import HomeView from '@/components/delima/home-view'
import PropertiesView from '@/components/delima/properties-view'
import PropertyDetail from '@/components/delima/property-detail'
import AgentsView from '@/components/delima/agents-view'
import { CompareBar } from '@/components/delima/compare-bar'
import { AiAssistant } from '@/components/delima/ai-assistant'
import { Button } from '@/components/ui/button'

/* Heavy, per-view code is split so recharts/@dnd-kit/SVG map logic only load
   when their view is opened (issue review F-09). */
function ViewSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-6" aria-busy="true" aria-label="Loading view">
      <div className="h-10 w-72 max-w-full rounded bg-gradient-to-r from-sand/60 via-gold/20 to-sand/60 shimmer" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-sand/40 dark:bg-[#241c12] shimmer" />
        ))}
      </div>
    </div>
  )
}

const MapView = dynamic(() => import('@/components/delima/map-view'), { ssr: false, loading: ViewSkeleton })
const InsightsView = dynamic(() => import('@/components/delima/insights-view'), { ssr: false, loading: ViewSkeleton })
const FinanceView = dynamic(() => import('@/components/delima/finance-view'), { ssr: false, loading: ViewSkeleton })
const AdminView = dynamic(() => import('@/components/delima/admin-view'), { ssr: false, loading: ViewSkeleton })
const ValuationView = dynamic(() => import('@/components/delima/valuation-view'), { ssr: false, loading: ViewSkeleton })

/* Theme store (external DOM state — React-recommended via useSyncExternalStore) */
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}
const getThemeSnapshot = () => document.documentElement.classList.contains('dark')
const getServerTheme = () => false

function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerTheme)

  useEffect(() => {
    // initialize theme on the external system (DOM); store subscription re-renders us
    const saved = localStorage.getItem('delima-theme')
    const isDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggle = () => {
    const next = !getThemeSnapshot()
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('delima-theme', next ? 'dark' : 'light')
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed left-4 bottom-20 sm:bottom-4 z-40 rounded-full size-11 bg-cream/85 dark:bg-[#1d160e]/85 backdrop-blur luxury-shadow"
    >
      {dark ? <Sun className="size-4 text-gold" /> : <Moon className="size-4 text-espresso" />}
    </Button>
  )
}

export default function Page() {
  const view = useAppStore(s => s.view)

  return (
    <div className="min-h-screen flex flex-col bg-cream dark:bg-background">
      <DelimaHeader />
      <main className="flex-1 pb-14 sm:pb-0" aria-live="polite">
        {view === 'home' && <HomeView />}
        {view === 'properties' && <PropertiesView />}
        {view === 'property' && <PropertyDetail />}
        {view === 'map' && <MapView />}
        {view === 'insights' && <InsightsView />}
        {view === 'agents' && <AgentsView />}
        {view === 'finance' && <FinanceView />}
        {view === 'admin' && <AdminView />}
        {view === 'valuation' && <ValuationView />}
      </main>
      <DelimaFooter />
      <MobileNav />
      <CompareBar />
      <AiAssistant />
      <ThemeToggle />
    </div>
  )
}
