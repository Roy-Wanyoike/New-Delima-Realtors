// Delima Realtors 3.0 — i18n runtime (issue #62)
// English (en) + Swahili (sw). Locale persists in localStorage via Zustand
// ('delima-locale'). t(key, params) does {name}-style interpolation and falls
// back to English when a key is missing from the active dictionary (parity is
// enforced by tests, so the fallback is a safety net, not a feature).
'use client'

import { useCallback } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import en, { type DictKey, type Dictionary } from './en'
import sw from './sw'
import type { PropertyStatus, PropertyType } from '@/lib/types'
import { formatKes } from '@/lib/format'

export type { DictKey } from './en'

export const LOCALES = ['en', 'sw'] as const
export type Locale = (typeof LOCALES)[number]

const DICTIONARIES: Record<Locale, Dictionary> = { en, sw: sw as unknown as Dictionary }

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  sw: 'Kiswahili',
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  )
}

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    set => ({
      locale: 'en',
      setLocale: locale => {
        set({ locale })
        if (typeof document !== 'undefined') document.documentElement.lang = locale
      },
      toggleLocale: () =>
        set(s => {
          const locale: Locale = s.locale === 'en' ? 'sw' : 'en'
          if (typeof document !== 'undefined') document.documentElement.lang = locale
          return { locale }
        }),
    }),
    { name: 'delima-locale' },
  ),
)

/** True when the active locale is Swahili (for copy that differs structurally). */
export function useIsSwahili(): boolean {
  return useLocaleStore(s => s.locale === 'sw')
}

export interface TFn {
  (key: DictKey, params?: Record<string, string | number>): string
}

export interface I18n {
  t: TFn
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

/**
 * Primary hook: `const { t, locale, toggleLocale } = useI18n()`.
 * Unknown keys fall back to English, then to the raw key (never crashes).
 */
export function useI18n(): I18n {
  const locale = useLocaleStore(s => s.locale)
  const setLocale = useLocaleStore(s => s.setLocale)
  const toggleLocale = useLocaleStore(s => s.toggleLocale)

  const t = useCallback<TFn>(
    (key, params) => {
      const dict = DICTIONARIES[locale] ?? en
      const template = dict[key] ?? en[key] ?? key
      return interpolate(template, params)
    },
    [locale],
  )

  return { t, locale, setLocale, toggleLocale }
}

/* ------------------------------------------------------------------ */
/* Label helpers — drop-in replacements for the static format.ts maps  */
/* (same Record shape, so `typeLabel[p.type]` keeps working).          */
/* ------------------------------------------------------------------ */

/** Translated property-type map: `useTypeLabel()[property.type]`. */
export function useTypeLabel(): Record<PropertyType, string> {
  const { t } = useI18n()
  return useCallback(
    () => ({
      APARTMENT: t('type.APARTMENT'),
      VILLA: t('type.VILLA'),
      TOWNHOUSE: t('type.TOWNHOUSE'),
      PENTHOUSE: t('type.PENTHOUSE'),
      OFFICE: t('type.OFFICE'),
      LAND: t('type.LAND'),
      COMMERCIAL: t('type.COMMERCIAL'),
    }),
    [t],
  )()
}

/** Translated status map: `useStatusLabel()[property.status]`. */
export function useStatusLabel(): Record<PropertyStatus, string> {
  const { t } = useI18n()
  return useCallback(
    () => ({
      FOR_SALE: t('common.forSale'),
      FOR_RENT: t('common.forRent'),
      SOLD: t('common.sold'),
      NEW_DEVELOPMENT: t('common.newDevelopment'),
    }),
    [t],
  )()
}

/** Localized price: appends the translated "/month" for rentals. */
export function usePriceFormatter(): (priceKes: number, status: PropertyStatus) => string {
  const { t } = useI18n()
  return useCallback(
    (priceKes: number, status: PropertyStatus) =>
      status === 'FOR_RENT' ? `${formatKes(priceKes)} ${t('common.perMonth')}` : formatKes(priceKes),
    [t],
  )
}
