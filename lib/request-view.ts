import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  messages,
  type OfferStatus,
  offers,
  providerProfiles,
  regions,
  requestPhotos,
  requests,
  reviews,
} from '@/lib/db/schema'

const STATUS_ORDER: Record<OfferStatus, number> = { accepted: 0, pending: 1, rejected: 2, withdrawn: 3 }

export type ThreadMessage = {
  id: number
  senderType: 'customer' | 'provider' | 'admin'
  body: string
  createdAt: Date
}

export async function getRequestView(where: { token: string } | { id: string }) {
  const condition = 'token' in where ? eq(requests.publicToken, where.token) : eq(requests.id, where.id)
  const [row] = await db
    .select({ request: requests, region: regions })
    .from(requests)
    .innerJoin(regions, eq(regions.id, requests.regionId))
    .where(condition)
    .limit(1)
  if (!row) return null

  const [photoRows, offerRows, messageRows, [review]] = await Promise.all([
    db
      .select({ id: requestPhotos.id })
      .from(requestPhotos)
      .where(eq(requestPhotos.requestId, row.request.id))
      .orderBy(asc(requestPhotos.id)),
    db
      .select({
        offer: offers,
        provider: {
          id: providerProfiles.id,
          slug: providerProfiles.slug,
          displayName: providerProfiles.displayName,
          isVerified: providerProfiles.isVerified,
          ratingAvg: providerProfiles.ratingAvg,
          ratingCount: providerProfiles.ratingCount,
          jobsCompleted: providerProfiles.jobsCompleted,
          whatsapp: providerProfiles.whatsapp,
          phone: providerProfiles.phone,
          avatarPathname: providerProfiles.avatarPathname,
        },
      })
      .from(offers)
      .innerJoin(providerProfiles, eq(providerProfiles.id, offers.providerId))
      .where(eq(offers.requestId, row.request.id))
      .orderBy(asc(offers.price)),
    db
      .select()
      .from(messages)
      .where(eq(messages.requestId, row.request.id))
      .orderBy(asc(messages.createdAt)),
    db.select().from(reviews).where(eq(reviews.requestId, row.request.id)).limit(1),
  ])

  const threads = new Map<string, ThreadMessage[]>()
  for (const m of messageRows) {
    if (!m.providerId) continue
    const list = threads.get(m.providerId) ?? []
    list.push({ id: m.id, senderType: m.senderType, body: m.body, createdAt: m.createdAt })
    threads.set(m.providerId, list)
  }

  return {
    request: row.request,
    region: row.region,
    photoIds: photoRows.map((p) => p.id),
    offers: offerRows
      .map((o) => ({
        ...o.offer,
        provider: { ...o.provider, ratingAvg: Number(o.provider.ratingAvg) },
        messages: threads.get(o.provider.id) ?? [],
      }))
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.price - b.price),
    review: review ?? null,
  }
}

export type RequestView = NonNullable<Awaited<ReturnType<typeof getRequestView>>>
export type OfferView = RequestView['offers'][number]
