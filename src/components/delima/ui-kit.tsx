// Delima Realtors 3.0 — shared modern UI kit
// FROZEN CONTRACT: every view builds against these primitives.
// Do not remove or rename exports; additive changes only.

'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import { whatsappLink } from '@/lib/format'
import { cn } from '@/lib/utils'

/* ------------------------------ Container ------------------------------ */

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('container-page', className)}>{children}</div>
}

/* --------------------------- Section wrapper --------------------------- */

export type SectionTone = 'paper' | 'white' | 'brand' | 'soft'

const toneMap: Record<SectionTone, string> = {
  paper: 'bg-paper',
  white: 'bg-white',
  soft: 'bg-brand-soft/60',
  brand: 'bg-brand text-white',
}

export function Section({
  id,
  tone = 'paper',
  className,
  children,
}: {
  id?: string
  tone?: SectionTone
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={cn('py-14 sm:py-20', toneMap[tone], className)}>
      <Container>{children}</Container>
    </section>
  )
}

/* ------------------------------- Reveal -------------------------------- */

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* --------------------------- Section heading --------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'light',
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  className?: string
}) {
  return (
    <Reveal
      className={cn(
        'mb-10 sm:mb-14',
        align === 'center' ? 'text-center mx-auto max-w-2xl' : 'text-left max-w-2xl',
        className,
      )}
    >
      {eyebrow ? (
        <p className={cn('eyebrow mb-3', tone === 'dark' && 'text-sun')}>{eyebrow}</p>
      ) : null}
      <h2
        className={cn(
          'text-3xl sm:text-4xl font-extrabold tracking-tight text-balance',
          tone === 'dark' ? 'text-white' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-4 text-base sm:text-lg leading-relaxed text-pretty',
            tone === 'dark' ? 'text-white/75' : 'text-muted-foreground',
          )}
        >
          {description}
        </p>
      ) : null}
      {align === 'left' ? <div className="mt-6 h-1 w-14 rounded-full bg-sun" /> : null}
    </Reveal>
  )
}

/* -------------------------------- Pill --------------------------------- */

export function Pill({
  children,
  tone = 'brand',
  className,
}: {
  children: React.ReactNode
  tone?: 'brand' | 'sun' | 'muted' | 'outline' | 'white'
  className?: string
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand text-white',
    sun: 'bg-sun text-brand-deep',
    muted: 'bg-muted text-muted-foreground',
    outline: 'border border-line bg-white text-ink',
    white: 'bg-white/15 text-white backdrop-blur',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ------------------------------ Stat block ----------------------------- */

export function StatBlock({
  value,
  label,
  icon: Icon,
  tone = 'light',
  className,
}: {
  value: React.ReactNode
  label: string
  icon?: React.ComponentType<{ className?: string }>
  tone?: 'light' | 'dark'
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl p-4',
        tone === 'dark' ? 'bg-white/10 text-white' : 'card-modern',
        className,
      )}
    >
      {Icon ? (
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl',
            tone === 'dark' ? 'bg-sun/20 text-sun' : 'bg-brand-soft text-brand',
          )}
        >
          <Icon className="size-5" />
        </span>
      ) : null}
      <div className="min-w-0">
        <div className={cn('text-xl sm:text-2xl font-extrabold tracking-tight', tone === 'dark' ? 'text-white' : 'text-ink')}>
          {value}
        </div>
        <div className={cn('text-xs sm:text-sm font-medium', tone === 'dark' ? 'text-white/70' : 'text-muted-foreground')}>
          {label}
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- Empty state ----------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center', className)}>
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Icon className="size-7" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

/* ---------------------------- WhatsApp float --------------------------- */

export function WhatsAppFloat({ phone = '+254727523752', className }: { phone?: string; className?: string }) {
  const [hover, setHover] = React.useState(false)
  return (
    <a
      href={whatsappLink(phone, 'Hello Delima Realtors! I would like to inquire about a property.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Delima Realtors on WhatsApp"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        'fixed right-4 bottom-20 sm:bottom-6 z-40 flex items-center gap-2 rounded-full bg-[#1faa53] py-3 pl-3 pr-4 text-white shadow-lg shadow-emerald-900/30 transition-transform hover:scale-105 print:hidden',
        className,
      )}
    >
      <MessageCircle className="size-5" />
      <span className={cn('overflow-hidden text-sm font-bold transition-all', hover ? 'max-w-[120px] opacity-100' : 'max-w-0 opacity-0 sm:max-w-[120px] sm:opacity-100')}>
        WhatsApp Us
      </span>
    </a>
  )
}

/* --------------------------- Dismissible note -------------------------- */

export function DismissibleNote({ children, className }: { children: React.ReactNode; className?: string }) {
  const [open, setOpen] = React.useState(true)
  if (!open) return null
  return (
    <div className={cn('relative rounded-2xl border border-sun/40 bg-sun-soft px-4 py-3 pr-10 text-sm text-sun-deep', className)}>
      {children}
      <button
        onClick={() => setOpen(false)}
        aria-label="Dismiss"
        className="absolute right-2 top-2 rounded-full p-1 text-sun-deep/70 hover:bg-sun/20 hover:text-sun-deep"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
