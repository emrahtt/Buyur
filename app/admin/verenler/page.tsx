import { desc, eq, sql } from 'drizzle-orm'
import Link from 'next/link'
import { ProviderReviewCard } from '@/components/admin/provider-review-card'
import { db } from '@/lib/db'
import { providerProfiles, providerRegions, providerServices, user } from '@/lib/db/schema'
import { getCategory } from '@/lib/modules'
import { requireAdmin } from '@/lib/session'
import { cn } from '@/lib/utils'

const FILTERS = [
  { id: 'pending', label: 'Onay bekleyen' },
  { id: 'approved', label: 'Yayında' },
  { id: 'rejected', label: 'Reddedilen' },
  { id: 'all', label: 'Tümü' },
]

export default async function AdminProvidersPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  await requireAdmin()
  const { durum } = await searchParams
  const filter = FILTERS.some((f) => f.id === durum) ? durum! : 'pending'

  const rows = await db
    .select({
      profile: providerProfiles,
      email: user.email,
      services: sql<string[]>`coalesce((SELECT array_agg(s.category_slug) FROM ${providerServices} s WHERE s.provider_id = ${providerProfiles.id}), '{}')`,
      regionCount: sql<number>`(SELECT count(*)::int FROM ${providerRegions} r WHERE r.provider_id = ${providerProfiles.id})`,
    })
    .from(providerProfiles)
    .leftJoin(user, eq(user.id, providerProfiles.userId))
    .where(filter === 'all' ? undefined : eq(providerProfiles.verificationStatus, filter))
    .orderBy(desc(providerProfiles.createdAt))
    .limit(100)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-bold">Hizmet verenler</h1>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Durum filtresi">
        {FILTERS.map((f) => (
          <Link
            key={f.id}
            href={`/admin/verenler?durum=${f.id}`}
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
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Bu filtrede kimse yok.</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {rows.map(({ profile, email, services, regionCount }) => (
            <ProviderReviewCard
              key={profile.id}
              row={{
                id: profile.id,
                slug: profile.slug,
                displayName: profile.displayName,
                email,
                phone: profile.phone,
                whatsapp: profile.whatsapp,
                status: profile.verificationStatus,
                isVerified: profile.isVerified,
                isDemo: profile.isDemo,
                checklist: profile.verificationChecklist ?? {},
                services: services.map((s) => getCategory('temizlik', s)?.name ?? s),
                regionCount,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
