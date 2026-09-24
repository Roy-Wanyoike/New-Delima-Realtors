// Delima Realtors Platform 2.0 — global client state (Zustand)
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FilterState, View } from './types'

export const defaultFilters: FilterState = {
  q: '',
  type: 'ALL',
  status: 'ALL',
  minPrice: null,
  maxPrice: null,
  beds: 0,
  neighborhood: 'ALL',
  featuredOnly: false,
  sort: 'featured',
}

/** A named, persisted snapshot of the shared filter state (max 6 — see MAX_SAVED_SEARCHES). */
export interface SavedSearch {
  id: string
  name: string
  filters: FilterState
  createdAt: string
}

export const MAX_SAVED_SEARCHES = 6

function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

interface AppState {
  // navigation (single-page shell)
  view: View
  activeSlug: string | null
  setView: (v: View) => void
  openProperty: (slug: string) => void
  goHome: () => void

  // shared search filters (properties view + map view + AI handoff)
  filters: FilterState
  setFilters: (f: Partial<FilterState>) => void
  resetFilters: () => void
  setFilterAndGo: (f: Partial<FilterState>, v?: View) => void

  // favorites + compare (persisted)
  favorites: string[]
  toggleFavorite: (slug: string) => void
  isFavorite: (slug: string) => boolean
  compare: string[]
  toggleCompare: (slug: string) => void
  clearCompare: () => void

  // saved searches (persisted, max MAX_SAVED_SEARCHES)
  savedSearches: SavedSearch[]
  /** @returns false when the list is already full — nothing was saved. */
  addSavedSearch: (name?: string) => boolean
  removeSavedSearch: (id: string) => void
  /** Applies the snapshot and navigates to the collection (scrolls to top). */
  applySavedSearch: (id: string) => void

  // AI assistant widget
  assistantOpen: boolean
  setAssistantOpen: (open: boolean) => void

  // map ↔ list sync
  hoveredSlug: string | null
  setHoveredSlug: (slug: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: 'home',
      activeSlug: null,
      setView: v => {
        set({ view: v, activeSlug: v === 'property' ? get().activeSlug : null })
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
      },
      openProperty: slug => {
        set({ view: 'property', activeSlug: slug })
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
      },
      goHome: () => {
        set({ view: 'home', activeSlug: null })
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
      },

      filters: defaultFilters,
      setFilters: f => set(s => ({ filters: { ...s.filters, ...f } })),
      resetFilters: () => set({ filters: defaultFilters }),
      setFilterAndGo: (f, v) => {
        set(s => ({ filters: { ...s.filters, ...f }, view: v ?? 'properties', activeSlug: null }))
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
      },

      favorites: [],
      toggleFavorite: slug =>
        set(s => ({
          favorites: s.favorites.includes(slug)
            ? s.favorites.filter(x => x !== slug)
            : [...s.favorites, slug],
        })),
      isFavorite: slug => get().favorites.includes(slug),

      compare: [],
      toggleCompare: slug =>
        set(s => {
          if (s.compare.includes(slug)) return { compare: s.compare.filter(x => x !== slug) }
          if (s.compare.length >= 3) return { compare: [s.compare[1], s.compare[2], slug] }
          return { compare: [...s.compare, slug] }
        }),
      clearCompare: () => set({ compare: [] }),

      savedSearches: [],
      addSavedSearch: name => {
        if (get().savedSearches.length >= MAX_SAVED_SEARCHES) return false
        const entry: SavedSearch = {
          id: genId(),
          name: name?.trim() || 'Saved search',
          filters: { ...get().filters },
          createdAt: new Date().toISOString(),
        }
        set(s => ({ savedSearches: [...s.savedSearches, entry] }))
        return true
      },
      removeSavedSearch: id =>
        set(s => ({ savedSearches: s.savedSearches.filter(x => x.id !== id) })),
      applySavedSearch: id => {
        const saved = get().savedSearches.find(s => s.id === id)
        if (!saved) return
        // Reuse the existing navigate-with-filters path: a full FilterState
        // spread replaces every key, sets view to 'properties' and scrolls to top.
        get().setFilterAndGo(saved.filters, 'properties')
      },

      assistantOpen: false,
      setAssistantOpen: open => set({ assistantOpen: open }),

      hoveredSlug: null,
      setHoveredSlug: slug => set({ hoveredSlug: slug }),
    }),
    {
      name: 'delima-app-v2',
      partialize: s => ({
        favorites: s.favorites,
        compare: s.compare,
        savedSearches: s.savedSearches,
      }),
    },
  ),
)
