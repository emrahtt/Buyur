import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { offers, providerRegions, providerServices, type requests } from '@/lib/db/schema'

type RequestRow = typeof requests.$inferSelect

/**
 * A provider may see a request if it already made an offer on it, or if the request
 * is still open and sits inside the provider's categories and neighbourhoods.
 */
export async function providerCanSeeRequest(providerId: string, request: RequestRow) {
  const [offer] = await db
    .select({ id: offers.id })
    .from(offers)
    .where(and(eq(offers.requestId, request.id), eq(offers.providerId, providerId)))
    .limit(1)
  if (offer) return true
  if (request.status !== 'open') return false
  return providerServesRequest(providerId, request)
}

export async function providerServesRequest(
  providerId: string,
  request: Pick<RequestRow, 'moduleSlug' | 'categorySlug' | 'regionId'>,
) {
  const [service] = await db
    .select({ providerId: providerServices.providerId })
    .from(providerServices)
    .where(
      and(
        eq(providerServices.providerId, providerId),
        eq(providerServices.moduleSlug, request.moduleSlug),
        eq(providerServices.categorySlug, request.categorySlug),
      ),
    )
    .limit(1)
  if (!service) return false
  const [region] = await db
    .select({ providerId: providerRegions.providerId })
    .from(providerRegions)
    .where(and(eq(providerRegions.providerId, providerId), eq(providerRegions.regionId, request.regionId)))
    .limit(1)
  return Boolean(region)
}
