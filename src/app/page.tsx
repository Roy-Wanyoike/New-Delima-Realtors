'use client'

// Delima Realtors 3.0 — modern single-page shell
// Views are switched client-side via the Zustand store (sandbox exposes only this route).

import dynamic from 'next/dynamic'
import { useAppStore } from '@/lib/store'
import { DelimaHeader, DelimaFooter, MobileNav } from '@/components/delima/shell'
import { WhatsAppFloat } from '@/components/delima/ui-kit'
import HomeView from '@/components/delima/home-view'
import PropertiesView from '@/components/delima/properties-view'
import PropertyDetail from '@/components/delima/property-detail'
import AgentsView from '@/components/delima/agents-view'
import { CompareBar } from '@/components/delima/compare-bar'
import { AiAssistant } from '@/components/delima/ai-assistant'

/* Heavy, per-view code is split so recharts/@dnd-kit/SVG map logic only load
   when their view is opened. */
function ViewSkeleton() {
  return (
    <div className="container-page py-16 space-y-6" aria-busy="true" aria-label="Loading view">
      <div className="h-10 w-72 max-w-full rounded-xl shimmer" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-2xl shimmer" />
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

export default function Page() {
  const view = useAppStore(s => s.view)

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <DelimaHeader />
      <main className="flex-1 pb-16 sm:pb-0" aria-live="polite">
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
      <WhatsAppFloat />
    </div>
  )
}
