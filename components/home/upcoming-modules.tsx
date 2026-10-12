import { ModuleIcon } from '@/components/module-icon'
import { UPCOMING_MODULES } from '@/lib/modules'
import { getDistricts } from '@/lib/queries'
import { WaitlistForm } from './waitlist-form'

export async function UpcomingModules() {
  const districts = await getDistricts()
  const regionOptions = districts.flatMap((d) =>
    d.regions.map((r) => ({ id: r.id, label: `${r.name} · ${d.name}` })),
  )

  return (
    <section id="yakinda" aria-labelledby="yakinda-baslik" className="scroll-mt-20 border-y bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex flex-col gap-2">
          <h2 id="yakinda-baslik" className="text-3xl font-bold text-balance">
            Sırada ne var?
          </h2>
          <p className="max-w-xl leading-relaxed text-pretty text-muted-foreground">
            Mahallende en çok hangisi lazımsa onu önce açıyoruz. Haber ver, sayın bize yön versin.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {UPCOMING_MODULES.map((module) => (
            <li key={module.slug} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-tea/20 text-tea-foreground dark:text-tea">
                  <ModuleIcon name={module.icon} className="size-5" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-heading text-lg font-semibold">{module.name}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{module.tagline}</p>
                  {module.flow === 'booking' ? (
                    <span className="mt-1 text-xs font-medium text-primary">Randevu ile, sıra beklemeden</span>
                  ) : null}
                </div>
              </div>
              <WaitlistForm moduleSlug={module.slug} moduleName={module.name} regions={regionOptions} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
