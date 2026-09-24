// Delima Realtors 3.0 — Delima AI floating concierge
// Floating launcher + chat panel. The server SDK is called ONLY inside /api/assistant.
//
// Positioning is coordinated with WhatsAppFloat (ui-kit, frozen): it sits at
// right-4 bottom-20 (icon-only pill ≈48px wide) on mobile and right-4 bottom-6
// with its label expanded (≈145px wide) on sm+. This launcher therefore stacks
// to the LEFT of it at every breakpoint — right-[5.5rem] clears the mobile
// icon pill, sm:right-[10.5rem] clears the expanded desktop pill.
'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, Phone, RotateCcw, Send, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/lib/store'
import { PropertyMiniCard } from '@/components/delima/mini-cards'
import { useI18n } from '@/lib/i18n'
import type { AssistantMsg, AssistantResponse } from '@/lib/types'
import { cn, fetchWithTimeout } from '@/lib/utils'

type QuickPrompt = { labelKey: 'ai.prompt1' | 'ai.prompt2' | 'ai.prompt3'; kind: 'chat' | 'valuation' }

const QUICK_PROMPTS: QuickPrompt[] = [
  { labelKey: 'ai.prompt1', kind: 'chat' },
  { labelKey: 'ai.prompt2', kind: 'chat' },
  { labelKey: 'ai.prompt3', kind: 'valuation' },
]

/**
 * Lightweight markdown rendering for assistant replies: **bold**, *italic*
 * and `code` spans. Text is split into plain React nodes, so content stays
 * safely escaped (no dangerouslySetInnerHTML).
 */
function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={key++} className="font-bold">
          {match[1]}
        </strong>,
      )
    } else if (match[2] !== undefined) {
      nodes.push(<em key={key++}>{match[2]}</em>)
    } else if (match[3] !== undefined) {
      nodes.push(
        <code key={key++} className="rounded bg-brand-soft px-1 py-0.5 font-mono text-[0.8em] text-brand">
          {match[3]}
        </code>,
      )
    }
    last = re.lastIndex
  }
  if (last < text.length) nodes.push(text.slice(last))
  return <>{nodes}</>
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-4 py-3" aria-label="Delima AI is typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1.5 animate-bounce rounded-full bg-sun" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  )
}

export function AiAssistant() {
  const open = useAppStore((s) => s.assistantOpen)
  const setOpen = useAppStore((s) => s.setAssistantOpen)
  const openProperty = useAppStore((s) => s.openProperty)
  const setFilterAndGo = useAppStore((s) => s.setFilterAndGo)
  const setView = useAppStore((s) => s.setView)
  const { t } = useI18n()
  const { toast } = useToast()

  const [messages, setMessages] = useState<AssistantMsg[]>([
    { role: 'assistant', content: t('ai.greeting') },
  ])
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
      if (!res.ok) throw new Error(t('ai.slow'))
      const data = (await res.json()) as AssistantResponse
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, properties: data.properties }])
      if (data.filters && Object.keys(data.filters).length > 0) {
        // Filter handoff: the chat refines the shared search and jumps to the
        // listings grid so the matches are immediately visible.
        setFilterAndGo(data.filters)
        toast({ title: t('ai.filtersApplied'), description: t('ai.filtersAppliedDesc') })
      }
    } catch (e) {
      const isAbort = e instanceof Error && (e.name === 'AbortError' || /abort/i.test(e.message))
      if (isAbort) {
        setError(t('ai.timeout'))
      } else {
        setError(e instanceof Error ? e.message : t('ai.error'))
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

  const runQuickPrompt = (p: QuickPrompt) => {
    if (p.kind === 'valuation') {
      setOpen(false)
      setView('valuation')
      return
    }
    send(t(p.labelKey))
  }

  return (
    <>
      {/* collapsed — evergreen launcher, left of the WhatsApp float */}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="fab"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            className="fixed bottom-20 right-[5.5rem] z-50 sm:bottom-6 sm:right-[10.5rem]"
          >
            <Button
              size="icon"
              aria-label={t('ai.open')}
              onClick={() => setOpen(true)}
              className="relative size-14 rounded-full border-0 bg-brand text-white shadow-xl transition-transform hover:scale-105 hover:bg-brand-mid"
            >
              <MessageCircle className="relative size-6" aria-hidden="true" />
              <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full bg-sun ring-2 ring-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* expanded — floating panel */}
      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            role="dialog"
            aria-label={t('ai.chatLabel')}
            className="fixed bottom-24 right-4 z-50 flex h-[70vh] max-h-[640px] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-white soft-shadow sm:right-6 sm:w-[400px]"
          >
            {/* header */}
            <header className="flex items-center gap-3 border-b border-line px-4 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand text-white" aria-hidden="true">
                <Sparkles className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold leading-tight">Delima AI</p>
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="relative flex size-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-mid opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-brand-mid" />
                  </span>
                  {t('ai.online')}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t('ai.close')}
                onClick={() => setOpen(false)}
                className="size-11 shrink-0 rounded-full hover:bg-brand-soft hover:text-brand"
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            </header>

            {/* messages */}
            <ScrollArea className="min-h-0 flex-1">
              <div role="log" aria-live="polite" aria-label={t('ai.conversation')} className="flex flex-col gap-3 px-4 py-4">
                {messages.map((m, i) => (
                  <div key={i} className={cn('flex flex-col gap-2', m.role === 'user' ? 'items-end' : 'items-start')}>
                    <div
                      className={cn(
                        'max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        m.role === 'user' ? 'rounded-br-sm bg-brand text-white' : 'rounded-bl-sm bg-muted text-foreground',
                      )}
                    >
                      {m.role === 'assistant' ? <RichText text={m.content} /> : m.content}
                    </div>
                    {m.properties && m.properties.length > 0 && (
                      <div className="w-[96%] space-y-2">
                        {m.properties.map((p) => (
                          <PropertyMiniCard key={p.slug} property={p} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {sending && (
                  <div className="flex flex-col items-start gap-1.5">
                    <TypingDots />
                    <span aria-live="polite" className="sr-only">
                      {stillThinking ? t('ai.thinkingHint') : t('ai.typing')}
                    </span>
                    {stillThinking && (
                      <p className="px-1 text-[11px] italic text-muted-foreground">
                        {t('ai.thinkingHint')}
                      </p>
                    )}
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </ScrollArea>

            {/* quick prompts (until the first user message) */}
            {messages.length === 1 && !sending && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p.labelKey}
                    onClick={() => runQuickPrompt(p)}
                    className={cn(
                      'flex min-h-[44px] items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors',
                      p.kind === 'valuation'
                        ? 'border-brand bg-brand text-white hover:bg-brand-mid'
                        : 'border-line bg-sun-soft text-sun-deep hover:border-sun/50 hover:bg-sun/20',
                    )}
                  >
                    {p.kind === 'valuation' && <Sparkles className="size-3.5" aria-hidden="true" />}
                    {t(p.labelKey)}
                  </button>
                ))}
              </div>
            )}

            {/* error + human fallback */}
            {error && (
              <div className="mx-4 mb-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs">
                <p>{error}</p>
                <div className="mt-1 flex items-center gap-4">
                  <button
                    onClick={retry}
                    className="inline-flex min-h-[44px] items-center gap-1.5 font-bold text-destructive"
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" /> {t('ai.retry')}
                  </button>
                  <a
                    href="tel:+254727523752"
                    className="inline-flex min-h-[44px] items-center gap-1.5 underline underline-offset-2 hover:text-brand"
                  >
                    <Phone className="size-3.5" aria-hidden="true" /> {t('ai.preferHuman')}
                  </a>
                </div>
              </div>
            )}

            {/* input row */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input) }}
              className="flex items-center gap-2 border-t border-line bg-paper/60 px-3 py-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('ai.placeholder')}
                aria-label={t('ai.messageAria')}
                disabled={sending}
                className="h-11 flex-1 rounded-full border-line bg-white"
              />
              <Button
                type="submit"
                size="icon"
                aria-label={t('ai.sendAria')}
                disabled={sending || !input.trim()}
                className="size-11 shrink-0 rounded-full border-0 bg-brand text-white hover:bg-brand-mid"
              >
                <Send className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
