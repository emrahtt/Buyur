import { eq } from 'drizzle-orm'
import type { Metadata } from 'next'
import { ProviderProfileForm, type ProfileFormInitial } from '@/components/provider/profile-form'
import { SiteShell } from '@/components/site/site-shell'
import { db } from '@/lib/db'
import { providerRegions, providerServices } from '@/lib/db/schema'
import { displayPhone } from '@/lib/format'
import { activeCategoryPairs, categoryPriceRange } from '@/lib/modules'
import { getDistricts } from '@/lib/queries'
import { getProviderForUser, requireUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Hizmet veren profili', robots: { index: false } }

export default async function ProviderOnboardingPage() {
  const session = await requireUser('/veren/kayit')
  const [provider, districts] = await Promise.all([getProviderForUser(session.user.id), getDistricts()])

  let initial: ProfileFormInitial = {
    displayName: '',
    bio: '',
    phone: (session.user as { phone?: string | null }).phone
      ? displayPhone((session.user as { phone: string }).phone)
      : '',
    whatsapp: '',
    services: {},
    regionIds: [],
    slug: null,
    hasAvatar: false,
  }

  if (provider) {
    const [services, regions] = await Promise.all([
      db.select().from(providerServices).where(eq(providerServices.providerId, provider.id)),
      db.select().from(providerRegions).where(eq(providerRegions.providerId, provider.id)),
    ])
    initial = {
      displayName: provider.displayName,
      bio: provider.bio ?? '',
      phone: provider.phone ? displayPhone(provider.phone) : '',
      whatsapp: provider.whatsapp && provider.whatsapp !== provider.phone ? displayPhone(provider.whatsapp) : '',
      services: Object.fromEntries(
        services.map((s) => [
          s.categorySlug,
          { priceMin: s.priceMin ? String(s.priceMin) : '', priceMax: s.priceMax ? String(s.priceMax) : '' },
        ]),
      ),
      regionIds: regions.map((r) => r.regionId),
      slug: provider.slug,
      hasAvatar: Boolean(provider.avatarPathname),
    }
  }

  const categories = activeCategoryPairs().map(({ category }) => ({
    slug: category.slug,
    name: category.name,
    short: category.short,
    band: categoryPriceRange(category),
  }))

  return (
    <SiteShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-balance">
            {provider ? 'Profilini düzenle' : 'Ekibini Buyur’a ekle'}
          </h1>
          <p className="leading-relaxed text-pretty text-muted-foreground">
            {provider
              ? 'Değişiklikler profilinde hemen görünür.'
              : 'Profilini oluştur; ekibimiz seninle iletişime geçip Buyur Onaylı sürecini başlatsın. Onaylanınca bölgendeki talepleri görmeye başlarsın.'}
          </p>
        </header>
        <ProviderProfileForm
          categories={categories}
          districts={districts.map((d) => ({
            slug: d.slug,
            name: d.name,
            regions: d.regions.map((r) => ({ id: r.id, name: r.name })),
          }))}
          initial={initial}
          isNew={!provider}
        />
      </div>
    </SiteShell>
  )
}
