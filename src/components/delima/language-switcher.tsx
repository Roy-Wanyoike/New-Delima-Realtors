// Delima Realtors 3.0 — compact EN/SW language switcher (issue #62)
// Segmented pill toggle used in the desktop header, mobile menu sheet and
// mobile More sheet. Keyboard accessible with aria-pressed state.
'use client'

import { Languages } from 'lucide-react'
import { LOCALES, LOCALE_NAMES, useI18n, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ onDark = false }: { onDark?: boolean }) {
  const { locale, setLocale } = useI18n()

  return (
    <div
      role="group"
      aria-label={LOCALE_NAMES[locale]}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border p-0.5',
        onDark ? 'border-white/20 bg-white/5' : 'border-line bg-white/60',
      )}
    >
      <Languages
        className={cn('ml-1.5 size-3.5 shrink-0', onDark ? 'text-white/50' : 'text-muted-foreground')}
        aria-hidden="true"
      />
      {LOCALES.map((code: Locale) => {
        const active = locale === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            aria-label={LOCALE_NAMES[code]}
            className={cn(
              'min-h-[32px] rounded-full px-2.5 text-xs font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-brand text-white soft-shadow'
                : onDark
                  ? 'text-white/60 hover:text-sun'
                  : 'text-muted-foreground hover:text-brand',
            )}
          >
            {code}
          </button>
        )
      })}
    </div>
  )
}
