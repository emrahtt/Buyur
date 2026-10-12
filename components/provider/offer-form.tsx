'use client'

import { Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  providerCompleteRequest,
  sendProviderMessage,
  submitOffer,
  withdrawOffer,
} from '@/app/actions/provider'
import { MessageThread } from '@/components/message-thread'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatTL, formatTLRange } from '@/lib/format'
import type { ThreadMessage } from '@/lib/request-view'

export function OfferForm({
  requestId,
  band,
  existing,
}: {
  requestId: string
  band: { min: number; max: number } | null
  existing: { price: number; message: string | null; status: string } | null
}) {
  const router = useRouter()
  const [price, setPrice] = useState(existing ? String(existing.price) : '')
  const [message, setMessage] = useState(existing?.message ?? '')
  const [pending, startTransition] = useTransition()
  const numeric = Number(price)
  const outside = band && numeric > 0 && (numeric < band.min || numeric > band.max)

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl border-2 border-primary/30 bg-card p-4"
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          const result = await submitOffer(requestId, { price: numeric, message })
          if (!result.ok) toast.error(result.error)
          else {
            toast.success(existing ? 'Teklifin güncellendi.' : 'Teklifin müşteriye iletildi.')
            router.refresh()
          }
        })
      }}
    >
      <h2 className="font-heading text-xl font-bold">{existing ? 'Teklifini güncelle' : 'Teklif ver'}</h2>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fiyat" className="text-base">
          Fiyat (TL)
        </Label>
        <Input
          id="fiyat"
          inputMode="numeric"
          pattern="[0-9]*"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
          placeholder={band ? String(band.min) : '2500'}
          className="h-14 font-heading text-2xl font-bold tabular-nums"
          aria-describedby="fiyat-hint"
        />
        <p id="fiyat-hint" className={outside ? 'text-sm text-tea-foreground dark:text-tea' : 'text-sm text-muted-foreground'}>
          {band ? `Buyur Paket bandı: ${formatTLRange(band.min, band.max)}. ` : null}
          {outside ? 'Bandın dışındasın; nedenini aşağıya yaz.' : null}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="not" className="text-base">
          Müşteriye not
        </Label>
        <Textarea
          id="not"
          rows={3}
          maxLength={600}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Kaç kişi geliriz, ne kadar sürer, malzeme dahil mi?"
          className="text-base leading-relaxed"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg" disabled={pending || numeric < 100}>
          {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
          {existing ? 'Güncelle' : `${numeric >= 100 ? formatTL(numeric) : ''} teklif gönder`.trim()}
        </Button>
        {existing?.status === 'pending' ? (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await withdrawOffer(requestId)
                if (!result.ok) toast.error(result.error)
                else router.refresh()
              })
            }
          >
            Teklifi geri çek
          </Button>
        ) : null}
      </div>
    </form>
  )
}

export function ProviderThread({ requestId, messages }: { requestId: string; messages: ThreadMessage[] }) {
  return (
    <MessageThread messages={messages} viewer="provider" onSend={(body) => sendProviderMessage(requestId, body)} />
  )
}

export function ProviderCompleteButton({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="lg"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await providerCompleteRequest(requestId)
          if (!result.ok) toast.error(result.error)
          else {
            toast.success('İş tamamlandı olarak işaretlendi. Müşteri yorum yapabilir.')
            router.refresh()
          }
        })
      }
    >
      {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Check data-icon="inline-start" />}
      İşi tamamladık
    </Button>
  )
}
