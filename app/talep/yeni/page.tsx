import { X } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Wordmark } from '@/components/brand/plate'
import { RequestWizard } from '@/components/request/request-wizard'
import type { DetailValue, WizardState } from '@/components/request/types'
import { buttonVariants } from '@/components/ui/button'
import { getModule } from '@/lib/modules'
import { getDistricts } from '@/lib/queries'
import { getSession } from '@/lib/session'
import { displayPhone } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Talep oluştur',
  robots: { index: false },
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function NewRequestPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const module = getModule(one(params.modul) ?? 'temizlik')
  if (!module || module.status !== 'active') redirect('/#yakinda')

  const [districts, session] = await Promise.all([getDistricts(), getSession()])

  const categorySlug = one(params.kategori)
  const category = module.categories.find((c) => c.slug === categorySlug)
  const packageSlug = one(params.paket)

  const details: Record<string, DetailValue> = {}
  if (category) {
    for (const field of category.fields) {
      const raw = one(params[`d_${field.name}`])
      if (raw === undefined) continue
      if (field.type === 'toggle') details[field.name] = raw === 'true'
      else if (field.type === 'number') {
        const n = Number(raw)
        if (Number.isInteger(n) && n >= field.min && n <= field.max) details[field.name] = n
      } else if (field.options.some((o) => o.value === raw)) details[field.name] = raw
    }
  }

  const regionParam = Number(one(params.bolge))
  const allRegionIds = new Set(districts.flatMap((d) => d.regions.map((r) => r.id)))
  const userPhone = (session?.user as { phone?: string | null } | undefined)?.phone

  const initial: WizardState = {
    categorySlug: category?.slug ?? null,
    packageSlug: category?.packages.find((p) => p.slug === packageSlug)?.slug ??
      category?.packages.find((p) => p.popular)?.slug ??
      category?.packages[0]?.slug ??
      null,
    details,
    description: (one(params.aciklama) ?? '').slice(0, 1000),
    regionId: allRegionIds.has(regionParam) ? regionParam : null,
    preferredDate: '',
    preferredTime: 'esnek',
    recurring: 'none',
    contactName: session?.user.name ?? '',
    contactPhone: userPhone ? displayPhone(userPhone) : '',
    kvkk: false,
    marketing: false,
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-4">
          <Link href="/" aria-label="Buyur ana sayfa" className="flex min-h-11 items-center">
            <Wordmark />
          </Link>
          <span className="font-heading text-sm font-semibold">{module.name} talebi</span>
          <Link href="/" aria-label="Vazgeç" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
            <X />
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <RequestWizard
          module={module}
          districts={districts.map((d) => ({
            slug: d.slug,
            name: d.name,
            regions: d.regions.map((r) => ({ id: r.id, name: r.name })),
          }))}
          initial={initial}
        />
      </main>
    </>
  )
}
