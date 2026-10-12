import { eq } from 'drizzle-orm'
import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { providerProfiles } from '@/lib/db/schema'
import { activeCategoryPairs, MODULES } from '@/lib/modules'
import { getDistricts } from '@/lib/queries'
import { siteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const [districts, providers] = await Promise.all([
    getDistricts(),
    db
      .select({ slug: providerProfiles.slug, updatedAt: providerProfiles.updatedAt })
      .from(providerProfiles)
      .where(eq(providerProfiles.verificationStatus, 'approved')),
  ])

  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/hizmet-ver`, changeFrequency: 'monthly', priority: 0.6 },
    ...MODULES.map((m) => ({ url: `${base}/hizmet/${m.slug}`, priority: m.status === 'active' ? 0.9 : 0.4 })),
    ...districts.flatMap((d) =>
      activeCategoryPairs().map(({ category }) => ({
        url: `${base}/${d.slug}/${category.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ),
    ...providers.map((p) => ({ url: `${base}/p/${p.slug}`, lastModified: p.updatedAt, priority: 0.5 })),
  ]
}
