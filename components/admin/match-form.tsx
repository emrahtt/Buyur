'use client'

import { Loader2, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { adminMatch } from '@/app/actions/admin'
import { NativeSelect } from '@/components/native-select'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { whatsappLink } from '@/lib/format'

type Candidate = { id: string; name: string; whatsapp: string | null; offered: boolean }

export function MatchForm({
  requestId,
  candidates,
  summary,
  defaultPrice,
}: {
  requestId: string
  candidates: Candidate[]
  summary: string
  defaultPrice: number | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [providerId, setProviderId] = useState('')
  const [price, setPrice] = useState(defaultPrice ? String(defaultPrice) : '')
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()
  const selected = candidates.find((c) => c.id === providerId)

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={candidates.length === 0}>
        {candidates.length === 0 ? 'Uygun ekip yok' : 'Ekip eşleştir'}
      </Button>
    )
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-lg border bg-secondary/40 p-3"
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          const result = await adminMatch({ requestId, providerId, price: Number(price), message })
          if (!result.ok) toast.error(result.error)
          else {
            toast.success('Teklif müşteriye eklendi.')
            setOpen(false)
            router.refresh()
          }
        })
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`m-p-${requestId}`}>Ekip</Label>
        <NativeSelect id={`m-p-${requestId}`} value={providerId} onChange={(e) => setProviderId(e.target.value)} required>
          <option value="">Seç</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.offered ? ' (teklif vermiş)' : ''}
            </option>
          ))}
        </NativeSelect>
      </div>
      {selected?.whatsapp ? (
        <a
          href={whatsappLink(selected.whatsapp, `Merhaba, Buyur'dan yazıyorum. ${summary} Bu iş için fiyat verebilir misiniz?`)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: 'outline', size: 'sm', className: 'self-start' })}
        >
          <MessageCircle data-icon="inline-start" />
          Ekibe WhatsApp’tan sor
        </a>
      ) : null}
      <div className="grid grid-cols-[1fr_2fr] gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`m-f-${requestId}`}>Fiyat (TL)</Label>
          <Input
            id={`m-f-${requestId}`}
            inputMode="numeric"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
            className="h-11 text-base tabular-nums"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`m-n-${requestId}`}>Not</Label>
          <Input
            id={`m-n-${requestId}`}
            value={message}
            maxLength={600}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ekipten gelen not"
            className="h-11 text-base"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending || !providerId || Number(price) < 100}>
          {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
          Teklifi ekle
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Kapat
        </Button>
      </div>
    </form>
  )
}
