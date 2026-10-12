import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { notifications, offers, regions, requests } from '@/lib/db/schema'

/** Open requests inside the provider's categories and neighbourhoods. */
export async function getOpenRequestsForProvider(providerId: string) {
  const result = await db.execute<{
    id: string
    module_slug: string
    category_slug: string
    package_slug: string | null
    preferred_date: string | null
    preferred_time: string | null
    recurring: string
    created_at: Date
    region_name: string
    district: string
    contact_name: string
    offer_count: number
    my_offer_status: string | null
    my_offer_price: number | null
  }>(sql`
    SELECT r.id, r.module_slug, r.category_slug, r.package_slug, r.preferred_date, r.preferred_time,
           r.recurring, r.created_at, g.name AS region_name, g.district, r.contact_name,
           (SELECT count(*)::int FROM offers o WHERE o.request_id = r.id AND o.status = 'pending') AS offer_count,
           mine.status AS my_offer_status, mine.price AS my_offer_price
    FROM requests r
    JOIN regions g ON g.id = r.region_id
    LEFT JOIN offers mine ON mine.request_id = r.id AND mine.provider_id = ${providerId}
    WHERE r.status = 'open'
      AND EXISTS (SELECT 1 FROM provider_services s
                  WHERE s.provider_id = ${providerId} AND s.module_slug = r.module_slug AND s.category_slug = r.category_slug)
      AND EXISTS (SELECT 1 FROM provider_regions pr WHERE pr.provider_id = ${providerId} AND pr.region_id = r.region_id)
    ORDER BY (mine.id IS NULL) DESC, r.created_at DESC
    LIMIT 50
  `)
  return result.rows.map((r) => ({ ...r, created_at: new Date(r.created_at) }))
}

export async function getProviderOffers(providerId: string) {
  return db
    .select({
      offer: offers,
      request: {
        id: requests.id,
        status: requests.status,
        moduleSlug: requests.moduleSlug,
        categorySlug: requests.categorySlug,
        preferredDate: requests.preferredDate,
        contactName: requests.contactName,
      },
      regionName: regions.name,
    })
    .from(offers)
    .innerJoin(requests, eq(requests.id, offers.requestId))
    .innerJoin(regions, eq(regions.id, requests.regionId))
    .where(eq(offers.providerId, providerId))
    .orderBy(desc(offers.createdAt))
    .limit(50)
}

export async function getNotifications(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(30)
}

export async function unreadCount(userId: string) {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
  return row?.n ?? 0
}
