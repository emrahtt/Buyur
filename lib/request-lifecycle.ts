import { and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { notifications, offers, providerProfiles, requests } from '@/lib/db/schema'

/** Callers must authorize first: the customer (by token) or the accepted provider. */
export async function markCompleted(requestId: string, acceptedOfferId: string) {
  const [offer] = await db.select().from(offers).where(eq(offers.id, acceptedOfferId)).limit(1)
  await db.transaction(async (tx) => {
    const updated = await tx
      .update(requests)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(and(eq(requests.id, requestId), eq(requests.status, 'matched')))
      .returning({ id: requests.id })
    if (updated.length > 0 && offer) {
      await tx
        .update(providerProfiles)
        .set({ jobsCompleted: sql`${providerProfiles.jobsCompleted} + 1` })
        .where(eq(providerProfiles.id, offer.providerId))
    }
  })
}

export async function notifyProviderUsers(
  providerIds: string[],
  note: { type: string; title: string; href: string },
) {
  if (providerIds.length === 0) return
  const rows = await db
    .select({ userId: providerProfiles.userId })
    .from(providerProfiles)
    .where(and(inArray(providerProfiles.id, providerIds), sql`${providerProfiles.userId} IS NOT NULL`))
  if (rows.length === 0) return
  await db.insert(notifications).values(rows.map((r) => ({ userId: r.userId!, ...note })))
}

export async function notifyUser(
  userId: string | null,
  note: { type: string; title: string; href: string },
) {
  if (!userId) return
  await db.insert(notifications).values({ userId, ...note })
}
