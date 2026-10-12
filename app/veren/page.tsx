import { ChevronRight, Clock, ExternalLink, Pencil, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { NotificationList } from '@/components/provider/notification-list'
import { type PanelTab, PanelTabs } from '@/components/provider/panel-tabs'
import { ProviderAvatar } from '@/components/provider-avatar'
import { SiteShell } from '@/components/site/site-shell'
import { StatusBadge } from '@/components/status-badge'
import { Rating, VerifiedBadge } from '@/components/trust'
import { buttonVariants } from '@/components/ui/button'
import type { RequestStatus } from '@/lib/db/schema'
import { formatDate, formatTL, formatTLRange, labelFor, TIME_SLOTS, timeAgo } from '@/lib/format'
import { tr } from '@/lib/i18n/tr'
import { getCategory, getPackage } from '@/lib/modules'
import { getNotifications, getOpenRequestsForProvider, getProviderOffers, unreadCount } from '@/lib/provider-queries'
import { shortName } from '@/lib/queries'
import { requireProvider } from '@/lib/session'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Veren paneli', robots: { index: false } }

export default async function ProviderDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sekme?: string }>
}) {
  const { session, provider } = await requireProvider()
  const { sekme } = await searchParams
  const tab: PanelTab = sekme === 'teklifler' || sekme === 'bildirimler' ? sekme : 'talepler'
  const approved = provider.verificationStatus === 'approved'
  const unread = await unreadCount(session.user.id)

  return (
    <SiteShell>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
        <header className="flex items-start gap-4">
          <ProviderAvatar
            slug={provider.slug}
            name={provider.displayName}
            hasAvatar={Boolean(provider.avatarPathname)}
            className="size-14"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="truncate text-2xl font-bold">{provider.displayName}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {provider.isVerified ? <VerifiedBadge /> : null}
              {provider.ratingCount > 0 ? (
                <Rating value={Number(provider.ratingAvg)} count={provider.ratingCount} />
              ) : null}
              <span className="text-muted-foreground">{provider.jobsCompleted} iş</span>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          <Link href="/veren/kayit" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            <Pencil data-icon="inline-start" />
            Profili düzenle
          </Link>
          {approved ? (
            <Link href={`/p/${provider.slug}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <ExternalLink data-icon="inline-start" />
              Profilimi gör
            </Link>
          ) : null}
        </div>

        {!approved ? (
          <section className="flex flex-col gap-3 rounded-2xl border-2 border-tea/50 bg-tea/10 p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="size-5 text-tea-foreground dark:text-tea" />
              <h2 className="font-heading text-lg font-semibold">
                {provider.verificationStatus === 'rejected' ? 'Profilin şu an yayında değil' : 'Profilin onay bekliyor'}
              </h2>
            </div>
            <p className="text-sm leading-relaxed">
              {provider.verificationStatus === 'rejected'
                ? 'Detaylar için Buyur ekibiyle iletişime geç.'
                : 'Ekibimiz seni arayıp kimlik, adres ve referans kontrolünü yapacak. Onaylanınca bölgendeki talepler burada görünür ve teklif vermeye başlarsın.'}
            </p>
            <ul className="flex flex-col gap-1 text-sm">
              {Object.entries(tr.checklist).map(([key, label]) => {
                const done = provider.verificationChecklist?.[key as keyof typeof provider.verificationChecklist]
                return (
                  <li key={key} className={cn('flex items-center gap-2', done ? 'text-success' : 'text-muted-foreground')}>
                    <span aria-hidden="true">{done ? '✓' : '○'}</span>
                    {label}
                    <span className="sr-only">{done ? 'tamamlandı' : 'bekliyor'}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : (
          <>
            <PanelTabs active={tab} unread={unread} />
            {tab === 'talepler' ? <OpenRequests providerId={provider.id} /> : null}
            {tab === 'teklifler' ? <MyOffers providerId={provider.id} /> : null}
            {tab === 'bildirimler' ? <Notifications userId={session.user.id} /> : null}
          </>
        )}
      </div>
    </SiteShell>
  )
}

async function OpenRequests({ providerId }: { providerId: string }) {
  const rows = await getOpenRequestsForProvider(providerId)
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed px-6 py-10 text-center">
        <p className="font-heading text-lg font-semibold">Şu an açık talep yok</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Bölgende yeni bir talep açılınca bildirim alacaksın. Profil linkini paylaşmak da iş getirir.
        </p>
      </div>
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r) => {
        const category = getCategory(r.module_slug, r.category_slug)
        const pkg = getPackage(r.module_slug, r.category_slug, r.package_slug)
        return (
          <li key={r.id}>
            <Link
              href={`/veren/talep/${r.id}`}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock aria-hidden="true" className="size-3.5" />
                    {timeAgo(r.created_at)}
                  </span>
                  {r.my_offer_status ? (
                    <span className="rounded-full bg-primary/12 px-2 py-0.5 font-semibold text-primary">
                      Teklifin: {formatTL(r.my_offer_price ?? 0)}
                    </span>
                  ) : (
                    <span className="rounded-full bg-tea/20 px-2 py-0.5 font-semibold text-tea-foreground dark:text-tea">
                      Yeni
                    </span>
                  )}
                  {r.offer_count > 0 ? (
                    <span className="text-muted-foreground">{r.offer_count} teklif var</span>
                  ) : null}
                </div>
                <span className="font-heading font-semibold">
                  {category?.name}
                  {pkg ? <span className="font-normal text-muted-foreground"> · {pkg.name}</span> : null}
                </span>
                <span className="text-sm text-muted-foreground">
                  {shortName(r.contact_name)} · {r.region_name} ·{' '}
                  {r.preferred_date ? formatDate(r.preferred_date) : 'Tarih esnek'} ·{' '}
                  {labelFor(TIME_SLOTS, r.preferred_time)}
                </span>
                {pkg ? (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    Bant {formatTLRange(pkg.priceMin, pkg.priceMax)}
                  </span>
                ) : null}
              </div>
              <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

async function MyOffers({ providerId }: { providerId: string }) {
  const rows = await getProviderOffers(providerId)
  if (rows.length === 0) {
    return <p className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">Henüz teklif vermedin.</p>
  }
  return (
    <ul className="flex flex-col gap-3">
      {rows.map(({ offer, request, regionName }) => {
        const category = getCategory(request.moduleSlug, request.categorySlug)
        return (
          <li key={offer.id}>
            <Link
              href={`/veren/talep/${request.id}`}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={request.status as RequestStatus} />
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      offer.status === 'accepted' ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {tr.offerStatus[offer.status]}
                  </span>
                </div>
                <span className="font-heading font-semibold">{category?.name}</span>
                <span className="text-sm text-muted-foreground">
                  {shortName(request.contactName)} · {regionName}
                </span>
              </div>
              <span className="font-heading text-lg font-bold tabular-nums">{formatTL(offer.price)}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

async function Notifications({ userId }: { userId: string }) {
  const items = await getNotifications(userId)
  return <NotificationList items={items} />
}
