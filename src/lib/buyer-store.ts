// Delima Realtors 3.0 — buyer account client store (issue #59)
//
// State machine: status 'loading' until the first GET /api/account resolves,
// then 'authed' (buyer set) or 'guest'. Guests keep using the local favorites
// in useAppStore; authed users get server-backed savedSlugs. On login the
// guest favorites/searches are promoted (bulk-merged) into the account and the
// local copies are cleared so hearts never double-count.
//
// Heart-state contract used by use-saved.ts:
//   guest  → useAppStore.favorites (localStorage)
//   authed → useBuyerStore.savedSlugs (server, optimistic updates)
'use client'

import { create } from 'zustand'
import type { FilterState, PropertyDTO } from '@/lib/types'
import { fetchWithTimeout } from '@/lib/utils'
import { useAppStore, type SavedSearch as LocalSavedSearch } from '@/lib/store'
import type { SavedSearchDTO } from '@/app/api/account/route'

export interface BuyerDTO {
  id: string
  email: string
  name: string
  phone: string
  createdAt: string
}

export interface AuthResult {
  ok: boolean
  error?: string
}

type AccountPayload = {
  buyer: BuyerDTO
  savedProperties: PropertyDTO[]
  savedSearches: SavedSearchDTO[]
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: unknown; issues?: Array<{ message?: unknown }> }
    const firstIssue = Array.isArray(data.issues) ? data.issues[0]?.message : undefined
    if (typeof firstIssue === 'string' && firstIssue.length > 0) return firstIssue
    if (typeof data.error === 'string' && data.error.length > 0) return data.error
  } catch {
    // non-JSON error body
  }
  return fallback
}

interface BuyerState {
  buyer: BuyerDTO | null
  savedSlugs: string[]
  savedProperties: PropertyDTO[]
  searches: SavedSearchDTO[]
  /** 'loading' until the first bootstrap resolves; 'authed' | 'guest' after. */
  status: 'loading' | 'authed' | 'guest'
  /** Incremented by useAccountBootstrapper via a subscription-free effect key. */
  bootstrapKey: number

  bootstrap: () => Promise<void>
  register: (input: { name: string; email: string; phone?: string; password: string }) => Promise<AuthResult>
  login: (input: { email: string; password: string }) => Promise<AuthResult>
  logout: () => Promise<void>
  updateProfile: (input: { name?: string; phone?: string }) => Promise<AuthResult>
  toggleSaved: (slug: string) => Promise<void>
  addSavedSearch: (name: string, filters: FilterState) => Promise<{ ok: boolean; error?: string }>
  removeSavedSearch: (id: string) => Promise<void>
  /** Force a re-fetch (used by the bootstrapper effect key). */
  refresh: () => void
}

async function promoteGuestState(): Promise<void> {
  const local = useAppStore.getState()
  const slugs = local.favorites
  if (slugs.length > 0) {
    try {
      await fetchWithTimeout('/api/account/saved-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs }),
      })
    } catch {
      // non-fatal: guest favorites remain available locally
      return
    }
  }
  useAppStore.setState({ favorites: [] })
  void slugs
}

export const useBuyerStore = create<BuyerState>()((set, get) => ({
  buyer: null,
  savedSlugs: [],
  savedProperties: [],
  searches: [],
  status: 'loading',
  bootstrapKey: 0,

  bootstrap: async () => {
    try {
      const res = await fetchWithTimeout('/api/account')
      if (res.status === 401) {
        set({ buyer: null, savedSlugs: [], savedProperties: [], searches: [], status: 'guest' })
        return
      }
      if (!res.ok) {
        set(s => ({ ...s, status: s.buyer ? 'authed' : 'guest' }))
        return
      }
      const data = (await res.json()) as AccountPayload
      set({
        buyer: data.buyer,
        savedProperties: data.savedProperties,
        savedSlugs: data.savedProperties.map(p => p.slug),
        searches: data.savedSearches,
        status: 'authed',
      })
    } catch {
      // offline or transient — treat as guest but don't clobber an authed user
      set(s => ({ ...s, status: s.buyer ? 'authed' : 'guest' }))
    }
  },

  register: async ({ name, email, phone, password }) => {
    try {
      const res = await fetchWithTimeout('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      })
      if (!res.ok) return { ok: false, error: await readError(res, 'Could not create the account.') }
      await promoteGuestState()
      await get().bootstrap()
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error — please check your connection.' }
    }
  },

  login: async ({ email, password }) => {
    try {
      const res = await fetchWithTimeout('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) return { ok: false, error: await readError(res, 'Invalid email or password.') }
      await promoteGuestState()
      await get().bootstrap()
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error — please check your connection.' }
    }
  },

  logout: async () => {
    try {
      await fetchWithTimeout('/api/auth/logout', { method: 'POST' })
    } catch {
      // clear client state regardless; the httpOnly cookie is best-effort server-side
    }
    set({ buyer: null, savedSlugs: [], savedProperties: [], searches: [], status: 'guest' })
  },

  updateProfile: async ({ name, phone }) => {
    try {
      const res = await fetchWithTimeout('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })
      if (!res.ok) return { ok: false, error: await readError(res, 'Could not update your profile.') }
      const data = (await res.json()) as { buyer: BuyerDTO }
      set(s => ({ buyer: data.buyer ?? s.buyer }))
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error — please check your connection.' }
    }
  },

  toggleSaved: async slug => {
    const { status, savedSlugs } = get()
    if (status !== 'authed') return
    const saved = savedSlugs.includes(slug)
    // optimistic update
    set({
      savedSlugs: saved ? savedSlugs.filter(s => s !== slug) : [slug, ...savedSlugs],
    })
    try {
      const res = await fetchWithTimeout('/api/account/saved-properties', {
        method: saved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (!res.ok) throw new Error(String(res.status))
      // refresh the full saved list lazily for the dashboard
      if (!saved) void get().bootstrap()
    } catch {
      // revert on failure
      set({ savedSlugs: get().savedSlugs.includes(slug) ? savedSlugs : [slug, ...savedSlugs] })
    }
  },

  addSavedSearch: async (name, filters) => {
    if (get().status !== 'authed') return { ok: false, error: 'Sign in first' }
    try {
      const res = await fetchWithTimeout('/api/account/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, filters }),
      })
      if (!res.ok) return { ok: false, error: await readError(res, 'Could not save the search.') }
      const data = (await res.json()) as { search: SavedSearchDTO }
      set(s => ({ searches: [data.search, ...s.searches] }))
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error — please check your connection.' }
    }
  },

  removeSavedSearch: async id => {
    const prev = get().searches
    set({ searches: prev.filter(s => s.id !== id) })
    try {
      const res = await fetchWithTimeout('/api/account/saved-searches', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error(String(res.status))
    } catch {
      set({ searches: prev })
    }
  },

  refresh: () => set(s => ({ bootstrapKey: s.bootstrapKey + 1 })),
}))

/** Convert a server saved-search DTO to the local shape used by the UI list. */
export function toLocalSavedSearch(dto: SavedSearchDTO): LocalSavedSearch {
  return { id: dto.id, name: dto.name, filters: dto.filters, createdAt: dto.createdAt }
}
