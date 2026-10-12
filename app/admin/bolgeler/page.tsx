import { asc } from 'drizzle-orm'
import { RegionToggle } from '@/components/admin/region-toggle'
import { db } from '@/lib/db'
import { regions } from '@/lib/db/schema'
import { activeCategoryPairs } from '@/lib/modules'
import { requireAdmin } from '@/lib/session'

export default async function AdminRegionsPage() {
  await requireAdmin()
  const rows = await db.select().from(regions).orderBy(asc(regions.district), asc(regions.sort), asc(regions.name))
  const districts = [...new Set(rows.map((r) => r.district))]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold">Bölgeler ve kategoriler</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Kapalı mahalleler talep formunda görünmez. Kategoriler ve fiyat bantları modül dosyalarından gelir
          (<code className="rounded bg-muted px-1">lib/modules</code>); yeni sektör eklemek tek bir dosya.
        </p>
      </div>
      {districts.map((district) => (
        <section key={district} className="flex flex-col gap-2">
          <h2 className="font-heading text-lg font-semibold">{district}</h2>
          <ul className="grid gap-x-6 rounded-xl border bg-card px-4 py-2 sm:grid-cols-2 lg:grid-cols-3">
            {rows
              .filter((r) => r.district === district)
              .map((r) => (
                <li key={r.id}>
                  <RegionToggle id={r.id} name={r.name} active={r.active} />
                </li>
              ))}
          </ul>
        </section>
      ))}
      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold">Aktif kategoriler</h2>
        <ul className="flex flex-wrap gap-2">
          {activeCategoryPairs().map(({ module, category }) => (
            <li key={category.slug} className="rounded-full border bg-card px-3 py-1.5 text-sm">
              {module.name} / {category.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
