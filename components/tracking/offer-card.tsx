'use client'

import { Check, ChevronDown, Loader2, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { acceptOffer, sendCustomerMessage } from '@/app/actions/requests'
import { MessageThread } from '@/components/message-thread'
import { ProviderAvatar } from '@/components/provider-avatar'
import { Rating, VerifiedBadge } from '@/components/trust'
import { Button, buttonVariants } from '@/components/ui/button'
import { displayPhone, formatTL, whatsappLink } from '@/lib/format'
import { tr } from '@/lib/i18n/tr'
import type { OfferView } from '@/lib/request-view'
import { cn } from '@/lib/utils'

export function OfferCard({
  offer,
  token,
  requestOpen,
  categoryName,
  packageRange,
}: {
  offer: OfferView
  token: string
  requestOpen: boolean
  categoryName: string
  packageRange: { min: number; max: number } | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [showThread, setShowThread] = useState(offer.messages.length > 0)
  const accepted = offer.status === 'accepted'
  const active = offer.status === 'pending' || accepted
  const outsideBand = packageRange && (offer.price < packageRange.min || offer.price > packageRange.max)
  const whatsapp = offer.provider.whatsapp ?? offer.provider.phone

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border bg-card p-4',
        accepted && 'border-2 border-primary',
        !active && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-3">
        <ProviderAvatar
          slug={offer.provider.slug}
          name={offer.provider.displayName}
          hasAvatar={Boolean(offer.provider.avatarPathname)}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link href={`/p/${offer.provider.slug}`} className="font-heading font-semibold hover:underline">
            {offer.provider.displayName}
          </Link>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {offer.provider.isVerified ? <VerifiedBadge /> : null}
            {offer.provider.ratingCount > 0 ? (
              <Rating value={offer.provider.ratingAvg} count={offer.provider.ratingCount} />
            ) : (
              <span className="text-sm text-muted-foreground">Yeni ekip</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-heading text-2xl font-bold tabular-nums">{formatTL(offer.price)}</span>
          {offer.status !== 'pending' ? (
            <span className={cn('text-xs font-semibold', accepted ? 'text-primary' : 'text-muted-foreground')}>
              {tr.offerStatus[offer.status]}
            </span>
          ) : null}
        </div>
      </div>

      {offer.message ? <p className="text-sm leading-relaxed text-pretty">{offer.message}</p> : null}
      {outsideBand ? (
        <p className="rounded-lg bg-tea/15 px-3 py-2 text-xs leading-relaxed text-tea-foreground dark:text-tea">
          Bu teklif Buyur Paket bandının dışında. Nedenini mesajla sorabilirsin.
        </p>
      ) : null}
      {offer.source === 'admin_match' ? (
        <p className="text-xs text-muted-foreground">Bu ekibi Buyur ekibi senin için buldu.</p>
      ) : null}

      {accepted ? (
        <div className="flex flex-col gap-2 rounded-xl bg-primary/8 p-3">
          <p className="text-sm font-medium">Ekiple doğrudan iletişime geç:</p>
          <div className="flex flex-wrap gap-2">
            {whatsapp ? (
              <a
                href={whatsappLink(whatsapp, `Merhaba, Buyur'daki ${categoryName.toLocaleLowerCase('tr-TR')} talebim için yazıyorum.`)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants()}
              >
                <MessageCircle data-icon="inline-start" />
                WhatsApp
              </a>
            ) : null}
            {offer.provider.phone ? (
              <a href={`tel:+${offer.provider.phone}`} className={buttonVariants({ variant: 'outline' })}>
                <Phone data-icon="inline-start" />
                {displayPhone(offer.provider.phone)}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {requestOpen && offer.status === 'pending' ? (
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await acceptOffer(token, offer.id)
                if (!result.ok) toast.error(result.error)
                else {
                  toast.success('Teklifi kabul ettin. Ekip bilgilendirildi.')
                  router.refresh()
                }
              })
            }
          >
            {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Check data-icon="inline-start" />}
            Bu teklifi kabul et
          </Button>
        ) : null}
        {active ? (
          <Button variant="outline" onClick={() => setShowThread((v) => !v)} aria-expanded={showThread}>
            Mesajlar{offer.messages.length > 0 ? ` (${offer.messages.length})` : ''}
            <ChevronDown data-icon="inline-end" className={cn('transition-transform', showThread && 'rotate-180')} />
          </Button>
        ) : null}
      </div>

      {showThread && active ? (
        <div className="border-t pt-4">
          <MessageThread
            messages={offer.messages}
            viewer="customer"
            onSend={(body) => sendCustomerMessage(token, offer.provider.id, body)}
          />
        </div>
      ) : null}
    </article>
  )
}
