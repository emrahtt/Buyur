import Link from 'next/link'
import { DailyChart } from '@/components/admin/daily-chart'
import { DemoDataCard } from '@/components/admin/demo-data-card'
import { db } from '@/lib/db'
import { providerProfiles } from '@/lib/db/schema'
import { getCategoryBreakdown, getDailyRequests, getKpis, getWaitlistSummary } from '@/lib/admin-queries'
import { getCategory, getModule } from '@/lib/modules'
import { requireAdmin } from '@/lib/session'
import { eq, count } from 'drizzle-orm'

function Kpi({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) {
  const body = (
    <>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-heading text-3xl font-bold tabular-nums">{value}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </>
  )
  const className = 'flex flex-col gap-1 rounded-xl border bg-card p-4'
  return href ? (
    <Link href={href} className={`${className} transition-colors hover:border-primary/40`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}

function formatMinutes(min: number | null) {
  if (min === null) return '—'
  if (min < 60) return `${min} dk`
  return `${Math.round(min / 6) / 10} sa`.replace('.', ',')
}

export default async function AdminOverviewPage() {
  await requireAdmin()
  const [kpis, daily, categories, waitlist, [demo]] = await Promise.all([
    getKpis(),
    getDailyRequests(14),
    getCategoryBreakdown(),
    getWaitlistSummary(),
    db.select({ n: count() }).from(providerProfiles).where(eq(providerProfiles.isDemo, true)),
  ])

  return (
    <div className="flex flex-col gap-8">
      <h1 className="sr-only">Genel bakış</h1>
      <section aria-label="Temel göstergeler" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Talep (30 gün)" value={String(kpis.last30)} hint={`Toplam ${kpis.total}`} href="/admin/talepler" />
        <Kpi
          label="Eşleşme oranı"
          value={kpis.matchRate === null ? '—' : `%${kpis.matchRate}`}
          hint="İptaller hariç"
        />
        <Kpi label="Tamamlanan iş" value={String(kpis.completed)} hint={`${kpis.open} açık talep`} />
        <Kpi label="İlk teklif süresi" value={formatMinutes(kpis.avg_first_offer_min)} hint="Ortalama" />
        <Kpi label="Tekrar eden müşteri" value={kpis.repeat_rate === null ? '—' : `%${kpis.repeat_rate}`} hint="Telefona göre" />
        <Kpi
          label="Onay bekleyen"
          value={String(kpis.pending_providers)}
          hint={`${kpis.approved_providers} yayında`}
          href="/admin/verenler?durum=pending"
        />
        <Kpi label="Bekleme listesi" value={String(kpis.waitlist)} href="/admin/bekleme" />
      </section>

      <section aria-labelledby="gunluk" className="flex flex-col gap-3 rounded-xl border bg-card p-4">
        <h2 id="gunluk" className="font-heading text-lg font-semibold">
          Son 14 gün
        </h2>
        <DailyChart data={daily} />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="kategori" className="flex flex-col gap-3 rounded-xl border bg-card p-4">
          <h2 id="kategori" className="font-heading text-lg font-semibold">
            Kategoriye göre talep
          </h2>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz talep yok.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {categories.map((c) => {
                const max = categories[0].n
                return (
                  <li key={c.category_slug} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span>{getCategory(c.module_slug, c.category_slug)?.name ?? c.category_slug}</span>
                      <span className="font-semibold tabular-nums">{c.n}</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${(c.n / max) * 100}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="talep-sinyali" className="flex flex-col gap-3 rounded-xl border bg-card p-4">
          <h2 id="talep-sinyali" className="font-heading text-lg font-semibold">
            Hangi modül bekleniyor?
          </h2>
          {waitlist.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bekleme listesi boş.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {waitlist.map((w) => (
                <li key={w.module_slug} className="flex justify-between py-2 text-sm">
                  <span>{getModule(w.module_slug)?.name ?? w.module_slug}</span>
                  <span className="font-semibold tabular-nums">{w.n} kişi</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {demo.n > 0 ? <DemoDataCard count={demo.n} /> : null}
    </div>
  )
}
