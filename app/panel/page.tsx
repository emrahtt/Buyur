import { desc, eq, sql } from 'drizzle-orm'
import { ChevronRight, Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { SignOutButton } from '@/components/site/sign-out-button'
import { SiteShell } from '@/components/site/site-shell'
import { StatusBadge } from '@/components/status-badge'
import { buttonVariants } from '@/components/ui/button'
import { db } from '@/lib/db'
import { offers, regions, requests } from '@/lib/db/schema'
import { formatDate, formatShortDate } from '@/lib/format'
import { getCategory } from '@/lib/modules'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Taleplerim', robots: { index: false } }

export default async function CustomerPanelPage() {
  const session = await requireUser('/panel')

  const rows = await db
    .select({
      request: requests,
      regionName: regions.name,
      offerCount: sql<number>`(SELECT count(*)::int FROM ${offers} o WHERE o.request_id = ${requests.id} AND o.status IN ('pending','accepted'))`,
    })
    .from(requests)
    .innerJoin(regions, eq(regions.id, requests.regionId))
    .where(eq(requests.customerId, session.user.id))
    .orderBy(desc(requests.createdAt))
    .limit(50)

  return (
    <SiteShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
        <header className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Merhaba {session.user.name.split(' ')[0]}</p>
          <h1 className="text-3xl font-bold">Taleplerim</h1>
        </header>

        <Link href="/talep/yeni?modul=temizlik" className={buttonVariants({ size: 'lg' })}>
          <Plus data-icon="inline-start" />
          Yeni talep aç
        </Link>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-6 py-10 text-center">
            <p className="font-heading text-lg font-semibold">Henüz talebin yok</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Misafir olarak açtığın bir talep varsa linkini açıp “Hesabıma ekle” demen yeterli.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map(({ request, regionName, offerCount }) => {
              const category = getCategory(request.moduleSlug, request.categorySlug)
              return (
                <li key={request.id}>
                  <Link
                    href={`/talep/${request.publicToken}`}
                    className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={request.status} />
                        {request.status === 'open' && offerCount > 0 ? (
                          <span className="text-xs font-semibold text-primary">{offerCount} teklif</span>
                        ) : null}
                      </div>
                      <span className="font-heading font-semibold">{category?.name ?? request.categorySlug}</span>
                      <span className="text-sm text-muted-foreground">
                        {regionName} ·{' '}
                        {request.preferredDate ? formatDate(request.preferredDate) : formatShortDate(request.createdAt)}
                      </span>
                    </div>
                    <ChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        <div className="pt-4">
          <SignOutButton />
        </div>
      </div>
    </SiteShell>
  )
}
