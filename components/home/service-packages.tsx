import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ModuleIcon } from '@/components/module-icon'
import { formatTL } from '@/lib/format'
import { categoryPriceRange, getModule } from '@/lib/modules'
import { buildRequestUrl } from '@/lib/request-url'

export function ServicePackages() {
  const temizlik = getModule('temizlik')!
  return (
    <section aria-labelledby="paketler" className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex flex-col gap-2">
        <h2 id="paketler" className="text-3xl font-bold text-balance">
          Temizlik, fiyatı baştan belli.
        </h2>
        <p className="max-w-xl leading-relaxed text-pretty text-muted-foreground">
          Buyur Paket fiyat bantları mahalledeki gerçek tekliflerden çıkar. Ekip bandın dışına çıkacaksa
          nedenini teklifinde yazmak zorunda.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {temizlik.categories.map((category) => {
          const range = categoryPriceRange(category)
          return (
            <li key={category.slug}>
              <Link
                href={buildRequestUrl({ moduleSlug: 'temizlik', categorySlug: category.slug })}
                className="group flex h-full items-start gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <ModuleIcon name={category.icon} className="size-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-heading text-lg font-semibold">{category.name}</span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{category.short}</span>
                  {range ? (
                    <span className="mt-1 text-sm">
                      <span className="font-semibold tabular-nums">{formatTL(range.min)}</span>
                      <span className="text-muted-foreground">’den başlayan</span>
                    </span>
                  ) : null}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
