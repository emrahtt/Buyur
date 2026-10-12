import { and, avg, count, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { providerProfiles, reviews } from '@/lib/db/schema'

/** Ratings are always derived from published reviews, never written directly. */
export async function recomputeProviderRating(providerId: string) {
  const [stats] = await db
    .select({ avg: avg(reviews.rating), count: count() })
    .from(reviews)
    .where(and(eq(reviews.providerId, providerId), eq(reviews.status, 'published')))
  await db
    .update(providerProfiles)
    .set({
      ratingAvg: stats?.avg ? Number(stats.avg).toFixed(2) : '0',
      ratingCount: stats?.count ?? 0,
      updatedAt: new Date(),
    })
    .where(eq(providerProfiles.id, providerId))
}
