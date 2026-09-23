// Delima Realtors Platform 2.0 — Delima AI floating concierge (issue #55)
// Floating widget + chat. Server SDK is called only inside /api/assistant.
'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Home, RotateCcw, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/lib/store'
import { formatPriceForStatus, typeLabel } from '@/lib/format'
import type { AssistantMsg, AssistantResponse, PropertyDTO } from '@/lib/types'
import { cn, fetchWithTimeout } from '@/lib/utils'

const SUGGESTIONS = [
  'Villas in Karen under KES 100M',
  '2-bed apartments in Kilimani',
  'Best investment areas',
  'Family home in Runda with garden',
]

const GREETING: AssistantMsg = {
  role: 'assistant',
  content:
    "Karibu! I'm Delima AI, your Nairobi property concierge. Ask me to find villas, apartments or investment gems — I know every listing in our portfolio.",
}

function Thumb({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div className={cn('gold-gradient-bg flex shrink-0 items-center justify-center text-espresso', className)} aria-hidden="true">
        <Home className="size-4" />
      </div>
    )
  }
  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)} className={cn('shrink-0 object-cover', className)} />
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-4 py-3" aria-label="Delima AI is typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1.5 animate-bounce rounded-full bg-gold" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  )
}

function PropertyCard({ p, onOpen }: { p: PropertyDTO; onOpen: (slug: string) => void }) {
  return (
    <button
      onClick={() => onOpen(p.slug)}
      aria-label={`Open ${p.title}, ${formatPriceForStatus(p.priceKes, p.status)}`}
      className="flex w-full items-center gap-3 border-b p-2 text-left transition-colors last:border-b-0 hover:bg-sand/70 dark:hover:bg-accent/60"
    >
      <Thumb src={p.images[0]} alt={p.title} className="h-12 w-12 rounded-lg" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold">{p.title}</span>
        <span className="block truncate text-[11px] text-muted-foreground">
          {p.neighborhood} · {typeLabel[p.type]} · {p.bedrooms} bed{p.bedrooms === 1 ? '' : 's'}
        </span>
        <span className="block text-xs font-bold text-gold-deep dark:text-gold">{formatPriceForStatus(p.priceKes, p.status)}</span>
      </span>
    </button>
  )
}

export function AiAssistant() {
  const open = useAppStore((s) => s.assistantOpen)
  const setOpen = useAppStore((s) => s.setAssistantOpen)
  const openProperty = useAppStore((s) => s.openProperty)
  const setFilters = useAppStore((s) => s.setFilters)
  const { toast } = useToast()

  const [messages, setMessages] = useState<AssistantMsg[]>([GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastPrompt, setLastPrompt] = useState<string | null>(null)
  const [stillThinking, setStillThinking] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, sending, error])

  // After 4s of "sending", surface a "still thinking…" hint so the user knows
  // the LLM-backed concierge is still working. The server typically responds
  // in ~15s; the client timeout below is 60s, so the dots alone look stuck.
  useEffect(() => {
    if (!sending) {
      setStillThinking(false)
      return
    }
    const t = setTimeout(() => setStillThinking(true), 4000)
    return () => clearTimeout(t)
  }, [sending])

  const transmit = async (history: AssistantMsg[]) => {
    setSending(true)
    setError(null)
    try {
      const res = await fetchWithTimeout(
        '/api/assistant',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history.slice(-8).map(({ role, content }) => ({ role, content })) }),
        },
        60_000,
      )
      if (!res.ok) throw new Error('Our concierge is taking longer than usual — please retry in a moment.')
      const data = (await res.json()) as AssistantResponse
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, properties: data.properties }])
      if (data.filters && Object.keys(data.filters).length > 0) {
        setFilters(data.filters)
        toast({ title: 'Search filters updated', description: 'Your chat refined the active search — open Map or Listings to see matches.' })
      }
    } catch (e) {
      const isAbort = e instanceof Error && (e.name === 'AbortError' || /abort/i.test(e.message))
      if (isAbort) {
        setError('The response took too long. Please try a shorter question.')
      } else {
        setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      }
    } finally {
      setSending(false)
    }
  }

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setInput('')
    setLastPrompt(trimmed)
    const next: AssistantMsg[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    void transmit(next)
  }

  const retry = () => {
    if (!lastPrompt || sending) return
    setError(null)
    void transmit(messages)
  }

  return (
    <>
      {/* collapsed — gold FAB */}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="fab"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            className="fixed bottom-6 right-4 z-50 md:right-6"
          >
            <Button
              size="icon"
              aria-label="Open AI assistant"
              onClick={() => setOpen(true)}
              className="relative size-14 rounded-full border-0 gold-gradient-bg text-espresso luxury-shadow transition-transform hover:scale-105"
            >
              <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-gold/40" />
              <Bot className="relative size-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* expanded — floating panel */}
      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            role="dialog"
            aria-label="Delima AI assistant chat"
            className="fixed bottom-24 right-4 z-50 flex h-[70vh] max-h-[640px] w-[92vw] flex-col overflow-hidden rounded-xl border bg-card luxury-shadow md:right-6 md:w-[400px]"
          >
            {/* header */}
            <header className="flex items-center gap-3 border-b bg-sand/70 px-4 py-3 dark:bg-accent/50">
              <span className="gold-gradient-bg flex size-9 shrink-0 items-center justify-center rounded-full text-espresso" aria-hidden="true">
                <Bot className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base leading-tight">Delima AI</p>
                <p className="text-[11px] text-muted-foreground">Nairobi property concierge</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Close AI assistant"
                onClick={() => setOpen(false)}
                className="size-11 shrink-0 rounded-full hover:bg-gold/15 hover:text-gold-deep dark:hover:text-gold"
              >
                <X className="size-4.5" />
              </Button>
            </header>

            {/* messages */}
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-3 px-4 py-4">
                {messages.map((m, i) => (
                  <div key={i} className={cn('flex flex-col gap-2', m.role === 'user' ? 'items-end' : 'items-start')}>
                    <div
                      className={cn(
                        'max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        m.role === 'user' ? 'rounded-br-sm bg-gold text-espresso' : 'rounded-bl-sm bg-muted text-foreground',
                      )}
                    >
                      {m.content}
                    </div>
                    {m.properties && m.properties.length > 0 && (
                      <div className="w-[96%] overflow-hidden rounded-xl border bg-background">
                        {m.properties.map((p) => (
                          <PropertyCard key={p.slug} p={p} onOpen={openProperty} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {sending && (
                  <div className="flex flex-col items-start gap-1.5">
                    <TypingDots />
                    <span aria-live="polite" className="sr-only">
                      {stillThinking ? "Still thinking… (Nairobi's market is deep)" : 'Delima AI is typing'}
                    </span>
                    {stillThinking && (
                      <p className="px-1 text-[11px] italic text-muted-foreground">
                        Still thinking… (Nairobi&apos;s market is deep)
                      </p>
                    )}
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </ScrollArea>

            {/* suggested prompts (until the first user message) */}
            {messages.length === 1 && !sending && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="flex min-h-[44px] items-center rounded-full border border-gold/40 bg-gold/10 px-3.5 text-[11px] font-semibold text-gold-deep transition-colors hover:bg-gold/20 dark:text-gold"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* error + human fallback */}
            {error && (
              <div className="mx-4 mb-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs">
                <p>{error}. Please try again.</p>
                <div className="mt-1 flex items-center gap-4">
                  <button
                    onClick={retry}
                    className="inline-flex min-h-[44px] items-center gap-1.5 font-bold text-gold-deep dark:text-gold"
                  >
                    <RotateCcw className="size-3.5" /> Retry
                  </button>
                  <a href="tel:+254727523752" className="inline-flex min-h-[44px] items-center underline underline-offset-2 hover:text-gold-deep dark:hover:text-gold">
                    Prefer a human? Call +254 727 523 752
                  </a>
                </div>
              </div>
            )}

            {/* input row */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input) }}
              className="flex items-center gap-2 border-t bg-sand/50 px-3 py-3 dark:bg-accent/30"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Nairobi property…"
                aria-label="Message Delima AI"
                disabled={sending}
                className="h-11 flex-1 rounded-full bg-background"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Send message"
                disabled={sending || !input.trim()}
                className="size-11 shrink-0 rounded-full border-0 gold-gradient-bg text-espresso hover:opacity-90"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
