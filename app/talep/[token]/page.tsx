import { CalendarDays, Clock, Inbox, MapPin, PartyPopper, Repeat } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/site/site-shell'
import { StatusBadge } from '@/components/status-badge'
import { OfferCard } from '@/components/tracking/offer-card'
import {
  AutoRefresh,
  CancelButton,
  ClaimButton,
  CompleteButton,
  CopyLinkButton,
} from '@/components/tracking/request-controls'
import { ReviewForm } from '@/components/tracking/review-form'
import { Stars } from '@/components/trust'
import { formatDate, formatTLRange, labelFor, RECURRING_OPTIONS, TIME_SLOTS, timeAgo } from '@/lib/format'
import { getCategory, getModule, getPackage } from '@/lib/modules'
import { describeDetails } from '@/lib/modules/validate'
import { getRequestView } from '@/lib/request-view'
import { getSession } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Talebim',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function TrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ yeni?: string }>
}) {
  const [{ token }, { yeni }] = await Promise.all([params, searchParams])
  if (!/^[a-z0-9]{21}$/.test(token)) notFound()

  const [view, session] = await Promise.all([getRequestView({ token }), getSession()])
  if (!view) notFound()

  const { request, region, offers, photoIds, review } = view
  const module = getModule(request.moduleSlug)
  const category = getCategory(request.moduleSlug, request.categorySlug)
  const pkg = getPackage(request.moduleSlug, request.categorySlug, request.packageSlug)
  if (!module || !category) notFound()

  const accepted = offers.find((o) => o.status === 'accepted')
  const activeOffers = offers.filter((o) => o.status === 'pending' || o.status === 'accepted')
  const otherOffers = offers.filter((o) => o.status !== 'pending' && o.status !== 'accepted')
  const details = describeDetails(category, request.details)
  const isOwnerAccount = session?.user.id && request.customerId === session.user.id

  return (
    <SiteShell>
      {request.status === 'open' ? <AutoRefresh /> : null}
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
        {yeni ? (
          <section
            aria-labelledby="alindi"
            className="flex animate-rise flex-col gap-3 rounded-2xl bg-plate p-5 text-plate-foreground"
          >
            <div className="flex items-center gap-2">
              <PartyPopper aria-hidden="true" className="size-5" />
              <h2 id="alindi" className="font-heading text-xl font-bold">
                Talebin alındı, {request.contactName.split(' ')[0]}!
              </h2>
            </div>
            <p className="leading-relaxed text-plate-foreground/90">
              Bölgendeki ekipler bilgilendirildi. Teklifler bu sayfaya düşecek. Bu linki kaydet; giriş
              yapmadan talebine dönmenin tek yolu bu.
            </p>
          </section>
        ) : null}

        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusBadge status={request.status} />
            <span className="text-sm text-muted-foreground">{timeAgo(request.createdAt)} oluşturuldu</span>
          </div>
          <h1 className="text-3xl font-bold text-balance">
            {category.name}
            {pkg ? <span className="text-muted-foreground"> · {pkg.name}</span> : null}
          </h1>
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
              <li className="flex items-center gap-2">
                <Repeat aria-hidden="true" className="size-4 shrink-0" />
                {labelFor(RECURRING_OPTIONS, request.recurring)}
              </li>
            ) : null}
          </ul>
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton />
            {!isOwnerAccount ? <ClaimButton token={token} signedIn={Boolean(session)} /> : null}
          </div>
        </header>

        {request.status === 'completed' && accepted && !review ? (
          <ReviewForm token={token} providerName={accepted.provider.displayName} />
        ) : null}
        {review ? (
          <section className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
            <h2 className="font-heading text-lg font-semibold">Yorumun</h2>
            <Stars value={review.rating} />
            {review.comment ? <p className="leading-relaxed">{review.comment}</p> : null}
          </section>
        ) : null}

        <section aria-labelledby="teklifler" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="teklifler" className="font-heading text-2xl font-bold">
              {accepted ? 'Seçtiğin ekip' : 'Teklifler'}
            </h2>
            {pkg && !accepted ? (
              <span className="text-sm text-muted-foreground tabular-nums">
                Bant: {formatTLRange(pkg.priceMin, pkg.priceMax)}
              </span>
            ) : null}
          </div>

          {activeOffers.length === 0 && request.status === 'open' ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center">
              <Inbox aria-hidden="true" className="size-8 text-muted-foreground" />
              <p className="font-heading text-lg font-semibold">Teklifler yolda</p>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Ekipler genelde birkaç saat içinde dönüyor. Bu sayfa kendini yeniler; istersen kapatıp linkten
                sonra bakabilirsin.
              </p>
            </div>
          ) : null}

          {activeOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              token={token}
              requestOpen={request.status === 'open'}
              categoryName={category.name}
              packageRange={pkg ? { min: pkg.priceMin, max: pkg.priceMax } : null}
            />
          ))}

          {request.status === 'matched' ? (
            <div className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
              <p className="text-sm leading-relaxed">İş bittiğinde işaretle, ekibi puanlayabil.</p>
              <CompleteButton token={token} />
            </div>
          ) : null}

          {otherOffers.length > 0 ? (
            <details className="rounded-xl border bg-card px-4">
              <summary className="flex min-h-12 cursor-pointer items-center text-sm font-medium">
                Diğer teklifler ({otherOffers.length})
              </summary>
              <div className="flex flex-col gap-3 pb-4">
                {otherOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    token={token}
                    requestOpen={false}
                    categoryName={category.name}
                    packageRange={null}
                  />
                ))}
              </div>
            </details>
          ) : null}
        </section>

        <section aria-labelledby="detaylar" className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
          <h2 id="detaylar" className="font-heading text-lg font-semibold">
            Talep detayları
          </h2>
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
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{request.description}</p>
          ) : null}
          {photoIds.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {photoIds.map((id) => (
                <a key={id} href={`/api/foto/${id}?t=${token}`} target="_blank" rel="noreferrer">
                  {/* Private blob streamed through an authorised route. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/foto/${id}?t=${token}`}
                    alt="Talep fotoğrafı"
                    className="aspect-square w-full rounded-lg border object-cover"
                  />
                </a>
              ))}
            </div>
          ) : null}
        </section>

        {request.status === 'open' || request.status === 'matched' ? (
          <div className="flex justify-center">
            <CancelButton token={token} />
          </div>
        ) : null}
      </div>
    </SiteShell>
  )
}
