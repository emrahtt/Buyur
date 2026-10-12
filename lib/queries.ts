import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { cache } from 'react'
import { db } from '@/lib/db'
import {
  providerProfiles,
  providerRegions,
  providerServices,
  regions,
  requests,
  reviews,
} from '@/lib/db/schema'

export const getRegions = cache(async () => {
  return db
    .select()
    .from(regions)
    .where(eq(regions.active, true))
    .orderBy(asc(regions.district), asc(regions.sort), asc(regions.name))
})

export const getDistricts = cache(async () => {
  const rows = await getRegions()
  const map = new Map<string, { slug: string; name: string; regions: typeof rows }>()
  for (const r of rows) {
    const entry = map.get(r.districtSlug) ?? { slug: r.districtSlug, name: r.district, regions: [] }
    entry.regions.push(r)
    map.set(r.districtSlug, entry)
  }
  return [...map.values()]
})

export async function getDistrict(slug: string) {
  return (await getDistricts()).find((d) => d.slug === slug)
}

export type ProviderCard = {
  id: string
  slug: string
  displayName: string
  bio: string | null
  isVerified: boolean
  ratingAvg: number
  ratingCount: number
  jobsCompleted: number
  hasAvatar: boolean
  priceMin: number | null
  priceMax: number | null
}

/** Approved providers offering a category, optionally limited to a district. */
export async function getProvidersForCategory(
  moduleSlug: string,
  categorySlug: string,
  districtSlug?: string,
): Promise<ProviderCard[]> {
  const districtFilter = districtSlug
    ? sql`AND EXISTS (
        SELECT 1 FROM ${providerRegions} pr JOIN ${regions} r ON r.id = pr.region_id
        WHERE pr.provider_id = p.id AND r.district_slug = ${districtSlug}
      )`
    : sql``

  const rows = await db.execute<{
    id: string
    slug: string
    display_name: string
    bio: string | null
    is_verified: boolean
    rating_avg: string
    rating_count: number
    jobs_completed: number
    avatar_pathname: string | null
    price_min: number | null
    price_max: number | null
  }>(sql`
    SELECT p.id, p.slug, p.display_name, p.bio, p.is_verified, p.rating_avg, p.rating_count,
           p.jobs_completed, p.avatar_pathname, s.price_min, s.price_max
    FROM ${providerProfiles} p
    JOIN ${providerServices} s ON s.provider_id = p.id
    WHERE p.verification_status = 'approved'
      AND s.module_slug = ${moduleSlug} AND s.category_slug = ${categorySlug}
      ${districtFilter}
    ORDER BY p.is_verified DESC, p.rating_avg DESC, p.rating_count DESC
    LIMIT 12
  `)

  return rows.rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    displayName: r.display_name,
    bio: r.bio,
    isVerified: r.is_verified,
    ratingAvg: Number(r.rating_avg),
    ratingCount: r.rating_count,
    jobsCompleted: r.jobs_completed,
    hasAvatar: Boolean(r.avatar_pathname),
    priceMin: r.price_min,
    priceMax: r.price_max,
  }))
}

export async function getProviderBySlug(slug: string) {
  const [profile] = await db
    .select()
    .from(providerProfiles)
    .where(eq(providerProfiles.slug, slug))
    .limit(1)
  if (!profile) return null

  const [services, regionRows, reviewRows] = await Promise.all([
    db.select().from(providerServices).where(eq(providerServices.providerId, profile.id)),
    db
      .select({ id: regions.id, name: regions.name, district: regions.district })
      .from(providerRegions)
      .innerJoin(regions, eq(regions.id, providerRegions.regionId))
      .where(eq(providerRegions.providerId, profile.id))
      .orderBy(asc(regions.district), asc(regions.name)),
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        contactName: requests.contactName,
        categorySlug: requests.categorySlug,
      })
      .from(reviews)
      .leftJoin(requests, eq(requests.id, reviews.requestId))
      .where(and(eq(reviews.providerId, profile.id), eq(reviews.status, 'published')))
      .orderBy(desc(reviews.createdAt))
      .limit(20),
  ])

  return { profile, services, regions: regionRows, reviews: reviewRows }
}

export async function getRecentReviews(limit = 3) {
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      providerName: providerProfiles.displayName,
      providerSlug: providerProfiles.slug,
      contactName: requests.contactName,
    })
    .from(reviews)
    .innerJoin(providerProfiles, eq(providerProfiles.id, reviews.providerId))
    .leftJoin(requests, eq(requests.id, reviews.requestId))
    .where(and(eq(reviews.status, 'published'), sql`${reviews.comment} IS NOT NULL`))
    .orderBy(desc(reviews.rating), desc(reviews.createdAt))
    .limit(limit)
}

export async function getRegionsByIds(ids: number[]) {
  if (ids.length === 0) return []
  return db.select().from(regions).where(inArray(regions.id, ids))
}

/** "Ayşe Yılmaz" → "Ayşe Y." so public pages never show full customer names. */
export function shortName(name: string | null | undefined) {
  if (!name) return 'Buyur kullanıcısı'
  const [first, ...rest] = name.trim().split(/\s+/)
  const last = rest.at(-1)
  return last ? `${first} ${last.charAt(0).toLocaleUpperCase('tr-TR')}.` : first
}
