// Delima Realtors 3.0 — unified "saved home" state across guest/authed modes
// (issue #59). Components call these hooks instead of touching useAppStore
// favorites directly, so the same heart works offline (guest, localStorage)
// and online (buyer account, server-backed with optimistic updates).
'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useBuyerStore } from '@/lib/buyer-store'

/** Mount once in the page shell — resolves the session and mirrors <html lang>. */
export function useAccountBootstrapper(): void {
  const bootstrapKey = useBuyerStore(s => s.bootstrapKey)
  const bootstrap = useBuyerStore(s => s.bootstrap)
  const locale = useAppStore(s => s.view) // no-op selector keeps effect stable across view changes
  void locale

  useEffect(() => {
    void bootstrap()
    // bootstrapKey changes trigger a refresh after login/logout edge cases
  }, [bootstrap, bootstrapKey])
}

export interface SavedState {
  saved: boolean
  /** Authed → server sync; guest → local favorites toggle. */
  toggle: (slug: string) => void
  /** True when hearts are server-backed (guest UI may show a sign-in hint). */
  synced: boolean
}

/**
 * Account-aware saved-state for one listing. Guest toggles stay in the local
 * favorites store; once signed in the same toggle hits the server instead.
 */
export function useSavedToggle(slug: string): SavedState {
  const buyerStatus = useBuyerStore(s => s.status)
  const savedSlugs = useBuyerStore(s => s.savedSlugs)
  const toggleSaved = useBuyerStore(s => s.toggleSaved)
  const localFavorites = useAppStore(s => s.favorites)
  const toggleFavorite = useAppStore(s => s.toggleFavorite)

  if (buyerStatus === 'authed') {
    return {
      saved: savedSlugs.includes(slug),
      toggle: () => void toggleSaved(slug),
      synced: true,
    }
  }
  return {
    saved: localFavorites.includes(slug),
    toggle: () => toggleFavorite(slug),
    synced: false,
  }
}

/** Slugs of all saved homes for the active mode (guest local / authed server). */
export function useSavedSlugs(): { slugs: string[]; synced: boolean; loading: boolean } {
  const buyerStatus = useBuyerStore(s => s.status)
  const savedSlugs = useBuyerStore(s => s.savedSlugs)
  const localFavorites = useAppStore(s => s.favorites)

  if (buyerStatus === 'authed') return { slugs: savedSlugs, synced: true, loading: false }
  return { slugs: localFavorites, synced: false, loading: buyerStatus === 'loading' }
}

/** Guest favorites count — used for the merge notice after sign-in. */
export function useGuestFavoritesCount(): number {
  return useAppStore(s => s.favorites.length)
}
