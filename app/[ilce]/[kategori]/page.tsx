import { ArrowRight, Check } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Plate } from '@/components/brand/plate'
import { Faq } from '@/components/faq'
import { ProviderCard } from '@/components/provider-card'
import { SiteShell } from '@/components/site/site-shell'
import { buttonVariants } from '@/components/ui/button'
import { formatTLRange } from '@/lib/format'
import { activeCategoryPairs, categoryPriceRange, findCategoryBySlug } from '@/lib/modules'
import { getDistrict, getProvidersForCategory } from '@/lib/queries'
import { buildRequestUrl } from '@/lib/request-url'
import { locative } from '@/lib/tr-grammar'

type Params = Promise<{ ilce: string; kategori: string }>

const DISTRICTS = ['bayrampasa', 'esenler']

export function generateStaticParams() {
  return DISTRICTS.flatMap((ilce) => activeCategoryPairs().map(({ category }) => ({ ilce, kategori: category.slug })))
}

async function resolve(params: Params) {
  const { ilce, kategori } = await params
  const found = findCategoryBySlug(kategori)
  if (!found || found.module.status !== 'active') return null
  const district = await getDistrict(ilce)
  if (!district) return null
  return { ...found, district }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const data = await resolve(params)
  if (!data) return {}
  const range = categoryPriceRange(data.category)
  const title = `${data.district.name} ${data.category.name.toLocaleLowerCase('tr-TR')}`
  return {
    title,
    description: `${locative(data.district.name)}ki onaylı ekiplerden ${data.category.name.toLocaleLowerCase('tr-TR')} teklifi al.${
      range ? ` Fiyatlar ${formatTLRange(range.min, range.max)} arası.` : ''
    } Üyelik yok.`,
    alternates: { canonical: `/${data.district.slug}/${data.category.slug}` },
  }
}

export default async function LocalCategoryPage({ params }: { params: Params }) {
  const data = await resolve(params)
  if (!data) notFound()
  const { module, category, district } = data
  const providers = await getProvidersForCategory(module.slug, category.slug, district.slug)
  const lowerName = category.name.toLocaleLowerCase('tr-TR')

  return (
    <SiteShell>
      <section className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pt-8 pb-8">
        <nav aria-label="Konum" className="text-sm text-muted-foreground">
          <Link href={`/hizmet/${module.slug}`} className="hover:text-foreground">
            {module.name}
          </Link>{' '}
          / {district.name}
        </nav>
        <Plate as="h1" size="lg" overline={district.name} className="text-4xl sm:text-5xl">
          {category.name}
        </Plate>
        <p className="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
          {category.description} {locative(district.name)}ki ekiplerden dakikalar içinde fiyat al.
        </p>
        <Link
          href={buildRequestUrl({ moduleSlug: module.slug, categorySlug: category.slug })}
          className={buttonVariants({ size: 'lg', className: 'self-start' })}
        >
          {locative(district.name)} teklif al
          <ArrowRight data-icon="inline-end" />
        </Link>
      </section>

      {category.packages.length > 0 ? (
        <section aria-labelledby="fiyat" className="mx-auto max-w-6xl px-4 pb-8">
          <h2 id="fiyat" className="mb-4 text-2xl font-bold text-balance">
            {locative(district.name)} {lowerName} ne kadar?
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {category.packages.map((p) => (
              <li key={p.slug} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-heading text-lg font-semibold">{p.name}</h3>
                  <span className="font-heading text-lg font-bold text-primary tabular-nums">
                    {formatTLRange(p.priceMin, p.priceMax)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {p.includes.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check aria-hidden="true" className="size-4 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="ekipler" className="mx-auto max-w-6xl px-4 pb-8">
        <h2 id="ekipler" className="mb-4 text-2xl font-bold">
          {locative(district.name)} hizmet veren ekipler
        </h2>
        {providers.length > 0 ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {providers.map((p) => (
              <li key={p.id}>
                <ProviderCard provider={p} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
            Bu bölgede henüz yayında ekip yok. Talebini yine de aç; Buyur ekibi senin için ekip bulsun.
          </p>
        )}
      </section>

      <section aria-labelledby="mahalleler" className="mx-auto max-w-6xl px-4 pb-4">
        <h2 id="mahalleler" className="mb-3 text-lg font-semibold">
          Hizmet verilen mahalleler
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{district.regions.map((r) => r.name).join(' · ')}</p>
      </section>

      <Faq items={module.faq} />
    </SiteShell>
  )
}
