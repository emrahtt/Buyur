'use client'

import { Loader2, SendHorizonal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatShortDate, formatTime } from '@/lib/format'
import type { ThreadMessage } from '@/lib/request-view'
import { cn } from '@/lib/utils'

export function MessageThread({
  messages,
  viewer,
  onSend,
  disabled,
}: {
  messages: ThreadMessage[]
  viewer: 'customer' | 'provider'
  onSend: (body: string) => Promise<{ ok: boolean; error?: string }>
  disabled?: boolean
}) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [pending, startTransition] = useTransition()

  function send() {
    const text = body.trim()
    if (!text) return
    startTransition(async () => {
      const result = await onSend(text)
      if (!result.ok) {
        toast.error(result.error ?? 'Mesaj gönderilemedi.')
        return
      }
      setBody('')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henüz mesaj yok. İlk soruyu sen sor.</p>
      ) : (
        <ol className="flex flex-col gap-2" aria-label="Mesajlar">
          {messages.map((m) => {
            const mine = m.senderType === viewer
            return (
              <li
                key={m.id}
                className={cn(
                  'flex max-w-[85%] flex-col gap-0.5 rounded-2xl px-3 py-2 text-sm leading-relaxed',
                  mine
                    ? 'self-end rounded-br-sm bg-primary text-primary-foreground'
                    : m.senderType === 'admin'
                      ? 'self-start rounded-bl-sm border border-dashed bg-card'
                      : 'self-start rounded-bl-sm bg-secondary text-secondary-foreground',
                )}
              >
                {m.senderType === 'admin' ? <span className="text-xs font-semibold">Buyur ekibi</span> : null}
                <span className="whitespace-pre-wrap break-words">{m.body}</span>
                <time
                  dateTime={new Date(m.createdAt).toISOString()}
                  className={cn('text-[0.7rem]', mine ? 'text-primary-foreground/75' : 'text-muted-foreground')}
                >
                  {formatShortDate(new Date(m.createdAt))} {formatTime(new Date(m.createdAt))}
                </time>
              </li>
            )
          })}
        </ol>
      )}

      {!disabled ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="flex items-end gap-2"
        >
          <label className="sr-only" htmlFor={`msg-${viewer}`}>
            Mesajın
          </label>
          <textarea
            id={`msg-${viewer}`}
            rows={1}
            maxLength={1000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                if (e.nativeEvent.isComposing || e.keyCode === 229) return
                e.preventDefault()
                send()
              }
            }}
            placeholder="Mesaj yaz"
            className="min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
          <Button type="submit" size="icon" disabled={pending || !body.trim()} aria-label="Gönder">
            {pending ? <Loader2 className="animate-spin" /> : <SendHorizonal />}
          </Button>
        </form>
      ) : null}
    </div>
  )
}
