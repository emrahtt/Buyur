import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Plate } from '@/components/brand/plate'
import { Faq } from '@/components/faq'
import { WaitlistForm } from '@/components/home/waitlist-form'
import { ModuleIcon } from '@/components/module-icon'
import { SiteShell } from '@/components/site/site-shell'
import { buttonVariants } from '@/components/ui/button'
import { formatTLRange } from '@/lib/format'
import { categoryPriceRange, getModule, MODULES } from '@/lib/modules'
import { getDistricts } from '@/lib/queries'
import { buildRequestUrl } from '@/lib/request-url'
import { locative } from '@/lib/tr-grammar'

export function generateStaticParams() {
  return MODULES.map((m) => ({ modul: m.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ modul: string }> }): Promise<Metadata> {
  const module = getModule((await params).modul)
  if (!module) return {}
  return {
    title: `${module.name} · Bayrampaşa ve Esenler`,
    description: module.description,
    alternates: { canonical: `/hizmet/${module.slug}` },
  }
}

export default async function ModulePage({ params }: { params: Promise<{ modul: string }> }) {
  const module = getModule((await params).modul)
  if (!module) notFound()
  const districts = await getDistricts()
  const active = module.status === 'active'

  return (
    <SiteShell>
      <section className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pt-8 pb-10">
        <Plate as="h1" size="lg" overline={active ? 'Bayrampaşa · Esenler' : 'Yakında'} className="text-4xl sm:text-5xl">
          {module.name}
        </Plate>
        <p className="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">{module.description}</p>
        {active ? (
          <Link href={buildRequestUrl({ moduleSlug: module.slug })} className={buttonVariants({ size: 'lg', className: 'self-start' })}>
            Ücretsiz teklif al
            <ArrowRight data-icon="inline-end" />
          </Link>
        ) : (
          <div className="max-w-md rounded-xl border bg-card p-4">
            <WaitlistForm
              moduleSlug={module.slug}
              moduleName={module.name}
              regions={districts.flatMap((d) => d.regions.map((r) => ({ id: r.id, label: `${r.name} · ${d.name}` })))}
            />
          </div>
        )}
      </section>

      <section aria-labelledby="kategoriler" className="mx-auto max-w-6xl px-4 pb-6">
        <h2 id="kategoriler" className="mb-4 text-2xl font-bold">
          Hizmetler
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {module.categories.map((category) => {
            const range = categoryPriceRange(category)
            return (
              <li key={category.slug} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <ModuleIcon name={category.icon} className="size-5" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-lg font-semibold">{category.name}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{category.description}</p>
                    {range ? (
                      <p className="text-sm font-semibold tabular-nums">{formatTLRange(range.min, range.max)}</p>
                    ) : null}
                  </div>
                </div>
                {active ? (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {districts.map((d) => (
                      <Link key={d.slug} href={`/${d.slug}/${category.slug}`} className="py-2 font-medium text-primary hover:underline">
                        {locative(d.name)} {category.name.toLocaleLowerCase('tr-TR')}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>

      <Faq items={module.faq} />
    </SiteShell>
  )
}
