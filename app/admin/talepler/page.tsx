import { desc, eq, inArray } from 'drizzle-orm'
import { ExternalLink, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { MatchForm } from '@/components/admin/match-form'
import { StatusBadge } from '@/components/status-badge'
import { buttonVariants } from '@/components/ui/button'
import { db } from '@/lib/db'
import {
  offers,
  providerProfiles,
  providerRegions,
  providerServices,
  regions,
  type RequestStatus,
  requests,
} from '@/lib/db/schema'
import { displayPhone, formatDate, formatTL, timeAgo, whatsappLink } from '@/lib/format'
import { tr } from '@/lib/i18n/tr'
import { getCategory, getPackage } from '@/lib/modules'
import { requireStaff } from '@/lib/session'
import { cn } from '@/lib/utils'

const FILTERS: { id: RequestStatus | 'all'; label: string }[] = [
  { id: 'open', label: tr.requestStatus.open },
  { id: 'matched', label: tr.requestStatus.matched },
  { id: 'completed', label: tr.requestStatus.completed },
  { id: 'cancelled', label: tr.requestStatus.cancelled },
  { id: 'all', label: 'Tümü' },
]

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  await requireStaff()
  const { durum } = await searchParams
  const filter = FILTERS.find((f) => f.id === durum)?.id ?? 'open'

  const rows = await db
    .select({ request: requests, region: regions })
    .from(requests)
    .innerJoin(regions, eq(regions.id, requests.regionId))
    .where(filter === 'all' ? undefined : eq(requests.status, filter))
    .orderBy(desc(requests.createdAt))
    .limit(60)

  const requestIds = rows.map((r) => r.request.id)
  const [offerRows, approved, services, regionLinks] = await Promise.all([
    requestIds.length
      ? db
          .select({ requestId: offers.requestId, providerId: offers.providerId, price: offers.price, status: offers.status })
          .from(offers)
          .where(inArray(offers.requestId, requestIds))
      : Promise.resolve([]),
    db
      .select({ id: providerProfiles.id, name: providerProfiles.displayName, whatsapp: providerProfiles.whatsapp, phone: providerProfiles.phone })
      .from(providerProfiles)
      .where(eq(providerProfiles.verificationStatus, 'approved')),
    db.select().from(providerServices),
    db.select().from(providerRegions),
  ])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-bold">Talepler</h1>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Durum filtresi">
        {FILTERS.map((f) => (
          <Link
            key={f.id}
            href={`/admin/talepler?durum=${f.id}`}
            aria-current={filter === f.id ? 'true' : undefined}
            className={cn(
              'flex min-h-11 items-center rounded-full border px-4 text-sm font-medium',
              filter === f.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card',
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Bu filtrede talep yok.</p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {rows.map(({ request, region }) => {
            const category = getCategory(request.moduleSlug, request.categorySlug)
            const pkg = getPackage(request.moduleSlug, request.categorySlug, request.packageSlug)
            const requestOffers = offerRows.filter((o) => o.requestId === request.id)
            const candidates = approved
              .filter(
                (p) =>
                  services.some((s) => s.providerId === p.id && s.categorySlug === request.categorySlug) &&
                  regionLinks.some((r) => r.providerId === p.id && r.regionId === request.regionId),
              )
              .map((p) => ({
                id: p.id,
                name: p.name,
                whatsapp: p.whatsapp ?? p.phone,
                offered: requestOffers.some((o) => o.providerId === p.id),
              }))
            const summary = `${category?.name ?? ''} talebi: ${region.name}, ${
              request.preferredDate ? formatDate(request.preferredDate) : 'tarih esnek'
            }${pkg ? `, ${pkg.name} paket` : ''}.`

            return (
              <li key={request.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge status={request.status} />
                  <span className="text-xs text-muted-foreground">{timeAgo(request.createdAt)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-heading font-semibold">
                    {category?.name}
                    {pkg ? <span className="font-normal text-muted-foreground"> · {pkg.name}</span> : null}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {region.name}, {region.district} ·{' '}
                    {request.preferredDate ? formatDate(request.preferredDate) : 'Tarih esnek'}
                  </span>
                  <span className="text-sm">
                    {request.contactName} · {displayPhone(request.contactPhone)}
                  </span>
                </div>
                {requestOffers.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {requestOffers.length} teklif ·{' '}
                    {requestOffers
                      .filter((o) => o.status === 'pending' || o.status === 'accepted')
                      .map((o) => formatTL(o.price))
                      .join(', ')}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-tea-foreground dark:text-tea">Henüz teklif yok</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/talep/${request.publicToken}`}
                    className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                  >
                    <ExternalLink data-icon="inline-start" />
                    Müşteri görünümü
                  </Link>
                  <a
                    href={whatsappLink(request.contactPhone, `Merhaba ${request.contactName.split(' ')[0]}, Buyur'dan yazıyorum.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                  >
                    <MessageCircle data-icon="inline-start" />
                    Müşteri
                  </a>
                  {request.status === 'open' ? (
                    <MatchForm
                      requestId={request.id}
                      candidates={candidates}
                      summary={summary}
                      defaultPrice={pkg?.priceMin ?? null}
                    />
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
