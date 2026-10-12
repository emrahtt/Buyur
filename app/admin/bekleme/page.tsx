import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { regions, waitlist } from '@/lib/db/schema'
import { displayPhone, formatShortDate } from '@/lib/format'
import { UPCOMING_MODULES } from '@/lib/modules'
import { requireAdmin } from '@/lib/session'

export default async function AdminWaitlistPage() {
  await requireAdmin()
  const rows = await db
    .select({ entry: waitlist, regionName: regions.name })
    .from(waitlist)
    .leftJoin(regions, eq(regions.id, waitlist.regionId))
    .orderBy(desc(waitlist.createdAt))
    .limit(500)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold">Bekleme listesi</h1>
      {UPCOMING_MODULES.map((module) => {
        const entries = rows.filter((r) => r.entry.moduleSlug === module.slug)
        return (
          <section key={module.slug} aria-labelledby={`wl-${module.slug}`} className="flex flex-col gap-2">
            <h2 id={`wl-${module.slug}`} className="font-heading text-lg font-semibold">
              {module.name} <span className="font-normal text-muted-foreground">· {entries.length} kişi</span>
            </h2>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz kayıt yok.</p>
            ) : (
              <ul className="flex flex-col divide-y rounded-xl border bg-card">
                {entries.map(({ entry, regionName }) => (
                  <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <span className="font-medium">
                      {/^\d+$/.test(entry.contact) ? displayPhone(entry.contact) : entry.contact}
                    </span>
                    <span className="text-muted-foreground">
                      {regionName ?? 'Mahalle belirtilmedi'} · {formatShortDate(entry.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
