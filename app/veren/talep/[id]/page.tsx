import { ArrowLeft, CalendarDays, Clock, MapPin, MessageCircle, Phone, Repeat } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { OfferForm, ProviderCompleteButton, ProviderThread } from '@/components/provider/offer-form'
import { SiteShell } from '@/components/site/site-shell'
import { StatusBadge } from '@/components/status-badge'
import { buttonVariants } from '@/components/ui/button'
import {
  displayPhone,
  formatDate,
  formatTL,
  labelFor,
  maskPhone,
  RECURRING_OPTIONS,
  TIME_SLOTS,
  timeAgo,
  whatsappLink,
} from '@/lib/format'
import { tr } from '@/lib/i18n/tr'
import { getCategory, getPackage } from '@/lib/modules'
import { describeDetails } from '@/lib/modules/validate'
import { providerCanSeeRequest } from '@/lib/provider-access'
import { shortName } from '@/lib/queries'
import { getRequestView } from '@/lib/request-view'
import { requireProvider } from '@/lib/session'

export const metadata: Metadata = { title: 'Talep detayı', robots: { index: false } }

export default async function ProviderRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { provider } = await requireProvider(`/veren/talep/${id}`)
  if (provider.verificationStatus !== 'approved') redirect('/veren')

  const view = await getRequestView({ id })
  if (!view || !(await providerCanSeeRequest(provider.id, view.request))) notFound()

  const { request, region, photoIds } = view
  const category = getCategory(request.moduleSlug, request.categorySlug)
  const pkg = getPackage(request.moduleSlug, request.categorySlug, request.packageSlug)
  if (!category) notFound()

  const mine = view.offers.find((o) => o.provider.id === provider.id) ?? null
  const iWon = mine?.status === 'accepted'
  const details = describeDetails(category, request.details)
  const canOffer = request.status === 'open' && (!mine || mine.status === 'pending' || mine.status === 'withdrawn')
  const firstName = request.contactName.split(' ')[0]

  return (
    <SiteShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
        <Link href="/veren" className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}>
          <ArrowLeft data-icon="inline-start" />
          Panele dön
        </Link>

        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusBadge status={request.status} />
            <span className="text-sm text-muted-foreground">{timeAgo(request.createdAt)}</span>
          </div>
          <h1 className="text-3xl font-bold text-balance">
            {category.name}
            {pkg ? <span className="text-muted-foreground"> · {pkg.name}</span> : null}
          </h1>
          <p className="text-muted-foreground">{iWon ? request.contactName : shortName(request.contactName)}</p>
          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-4 shrink-0" />
              {region.name}, {region.district}
            </li>
            <li className="flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
              {request.preferredDate ? formatDate(request.preferredDate) : 'Tarih esnek'}
            </li>
            <li className="flex items-center gap-2">
              <Clock aria-hidden="true" className="size-4 shrink-0" />
              {labelFor(TIME_SLOTS, request.preferredTime)}
            </li>
            {request.recurring !== 'none' ? (
              <li className="flex items-center gap-2 font-medium text-primary">
                <Repeat aria-hidden="true" className="size-4 shrink-0" />
                {labelFor(RECURRING_OPTIONS, request.recurring)} (düzenli müşteri)
              </li>
            ) : null}
          </ul>
        </header>

        <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
          <h2 className="font-heading text-lg font-semibold">Detaylar</h2>
          {details.length > 0 ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {details.map((d) => (
                <div key={d.label} className="contents">
                  <dt className="text-muted-foreground">{d.label}</dt>
                  <dd className="font-medium">{d.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {request.description ? (
            <p className="rounded-lg bg-secondary/60 p-3 text-sm leading-relaxed whitespace-pre-wrap">
              {request.description}
            </p>
          ) : null}
          {photoIds.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {photoIds.map((photoId) => (
                <a key={photoId} href={`/api/foto/${photoId}`} target="_blank" rel="noreferrer">
                  {/* Private blob streamed through an authorised route. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/foto/${photoId}`}
                    alt="Talep fotoğrafı"
                    className="aspect-square w-full rounded-lg border object-cover"
                  />
                </a>
              ))}
            </div>
          ) : null}
        </section>

        {iWon ? (
          <section className="flex flex-col gap-3 rounded-2xl border-2 border-primary bg-primary/5 p-4">
            <h2 className="font-heading text-lg font-semibold">
              {request.status === 'completed' ? 'Bu işi tamamladın' : `${firstName} seni seçti`}
            </h2>
            <p className="text-sm">
              Anlaşılan fiyat: <span className="font-semibold tabular-nums">{formatTL(mine.price)}</span>
            </p>
            {request.status === 'matched' ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={whatsappLink(
                      request.contactPhone,
                      `Merhaba ${firstName}, Buyur'daki ${category.name.toLocaleLowerCase('tr-TR')} talebin için yazıyorum.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants()}
                  >
                    <MessageCircle data-icon="inline-start" />
                    WhatsApp
                  </a>
                  <a href={`tel:+${request.contactPhone}`} className={buttonVariants({ variant: 'outline' })}>
                    <Phone data-icon="inline-start" />
                    {displayPhone(request.contactPhone)}
                  </a>
                </div>
                <ProviderCompleteButton requestId={request.id} />
              </>
            ) : null}
          </section>
        ) : (
          <p className="text-sm text-muted-foreground">
            Telefon: {maskPhone(request.contactPhone)} · Teklifin kabul edilince numara açılır.
          </p>
        )}

        {mine && !iWon ? (
          <p className="text-sm">
            Teklifin: <span className="font-semibold tabular-nums">{formatTL(mine.price)}</span> ·{' '}
            {tr.offerStatus[mine.status]}
          </p>
        ) : null}

        {canOffer ? (
          <OfferForm
            requestId={request.id}
            band={pkg ? { min: pkg.priceMin, max: pkg.priceMax } : null}
            existing={mine && mine.status !== 'withdrawn' ? { price: mine.price, message: mine.message, status: mine.status } : null}
          />
        ) : null}

        {mine && mine.status !== 'withdrawn' && request.status !== 'cancelled' ? (
          <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
            <h2 className="font-heading text-lg font-semibold">{firstName} ile mesajlar</h2>
            <ProviderThread requestId={request.id} messages={mine.messages} />
          </section>
        ) : null}
      </div>
    </SiteShell>
  )
}
