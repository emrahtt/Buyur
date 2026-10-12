'use client'

import { Loader2, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { submitReview } from '@/app/actions/requests'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const LABELS = ['', 'Hiç memnun kalmadım', 'Pek iyi değildi', 'İdare eder', 'Memnun kaldım', 'Harikaydı']

export function ReviewForm({ token, providerName }: { token: string; providerName: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [pending, startTransition] = useTransition()

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl border-2 border-tea/50 bg-card p-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!rating) return
        startTransition(async () => {
          const result = await submitReview(token, { rating, comment })
          if (!result.ok) toast.error(result.error)
          else {
            toast.success('Teşekkürler! Yorumun komşularına yol gösterecek.')
            router.refresh()
          }
        })
      }}
    >
      <h2 className="font-heading text-xl font-bold">{providerName} nasıldı?</h2>
      <fieldset>
        <legend className="sr-only">Puan</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer has-[:focus-visible]:rounded-lg has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
              <input
                type="radio"
                name="puan"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="sr-only"
              />
              <span className="sr-only">{value} yıldız</span>
              <Star
                aria-hidden="true"
                className={cn('size-11 p-1.5', value <= rating ? 'fill-tea text-tea' : 'text-border')}
              />
            </label>
          ))}
        </div>
        <p className="mt-1 min-h-5 text-sm text-muted-foreground" aria-live="polite">
          {LABELS[rating]}
        </p>
      </fieldset>
      <div className="flex flex-col gap-2">
        <Label htmlFor="yorum" className="text-base">
          Yorumun <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
        </Label>
        <Textarea
          id="yorum"
          rows={3}
          maxLength={600}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Zamanında geldiler mi, sonuç nasıldı?"
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">Yorumun profilde adının baş harfiyle görünür.</p>
      </div>
      <Button type="submit" disabled={!rating || pending} className="self-start">
        {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
        Yorumu gönder
      </Button>
    </form>
  )
}
