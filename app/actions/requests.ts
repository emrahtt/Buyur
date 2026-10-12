'use server'

import { and, count, eq, gte, inArray, ne, sql } from 'drizzle-orm'
import { customAlphabet, nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  consents,
  messages,
  notifications,
  offers,
  providerProfiles,
  providerRegions,
  providerServices,
  regions,
  requests,
  reviews,
} from '@/lib/db/schema'
import { normalizePhone, RECURRING_OPTIONS, TIME_SLOTS } from '@/lib/format'
import { CONSENT_VERSION, tr } from '@/lib/i18n/tr'
import { getCategory, getModule } from '@/lib/modules'
import { detailsSchema } from '@/lib/modules/validate'
import { recomputeProviderRating } from '@/lib/ratings'
import { markCompleted, notifyProviderUsers } from '@/lib/request-lifecycle'
import { getSession } from '@/lib/session'

const publicToken = customAlphabet('23456789abcdefghijkmnpqrstuvwxyz', 21)

type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

const createSchema = z.object({
  moduleSlug: z.string(),
  categorySlug: z.string(),
  packageSlug: z.string().nullable().optional(),
  regionId: z.number().int().positive(),
  description: z.string().trim().max(1000).optional().default(''),
  details: z.record(z.string(), z.unknown()).default({}),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  preferredTime: z.enum(TIME_SLOTS.map((t) => t.value) as [string, ...string[]]),
  recurring: z.enum(RECURRING_OPTIONS.map((r) => r.value) as [string, ...string[]]),
  contactName: z.string().trim().min(2, 'Adını yaz').max(60),
  contactPhone: z.string().trim().min(10).max(20),
  kvkkAcknowledged: z.literal(true, { error: 'Aydınlatma metnini onaylaman gerekiyor' }),
  marketingConsent: z.boolean().default(false),
  website: z.string().max(0).optional(),
})

export type CreateRequestInput = z.input<typeof createSchema>

export async function createRequest(input: CreateRequestInput): Promise<ActionResult<{ token: string }>> {
  const parsed = createSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message
    return { ok: false, error: 'Lütfen işaretli alanları kontrol et.', fieldErrors }
  }
  const data = parsed.data

  const module = getModule(data.moduleSlug)
  const category = getCategory(data.moduleSlug, data.categorySlug)
  if (!module || module.status !== 'active' || module.flow !== 'quote' || !category) {
    return { ok: false, error: 'Bu hizmet şu an talep almıyor.' }
  }
  const packageSlug = category.packages.some((p) => p.slug === data.packageSlug) ? data.packageSlug : null

  const details = detailsSchema(category).safeParse(data.details)
  if (!details.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of details.error.issues) fieldErrors[`d_${String(issue.path[0])}`] = 'Bu alanı doldur'
    return { ok: false, error: 'Detaylarda eksik var.', fieldErrors }
  }

  const phone = normalizePhone(data.contactPhone)
  if (!phone) return { ok: false, error: 'Telefon numarası geçersiz.', fieldErrors: { contactPhone: '05xx ile başlayan cep numaranı yaz' } }

  if (data.preferredDate) {
    const chosen = new Date(`${data.preferredDate}T12:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const limit = new Date(today)
    limit.setDate(limit.getDate() + 60)
    if (chosen < today || chosen > limit) {
      return { ok: false, error: 'Tarih bugünden itibaren 60 gün içinde olmalı.', fieldErrors: { preferredDate: 'Geçerli bir tarih seç' } }
    }
  }

  const [region] = await db
    .select()
    .from(regions)
    .where(and(eq(regions.id, data.regionId), eq(regions.active, true)))
    .limit(1)
  if (!region) return { ok: false, error: 'Mahalleni seç.', fieldErrors: { regionId: 'Mahalleni seç' } }

  const [{ recent }] = await db
    .select({ recent: count() })
    .from(requests)
    .where(and(eq(requests.contactPhone, phone), gte(requests.createdAt, sql`now() - interval '1 hour'`)))
  if (recent >= 3) return { ok: false, error: tr.errors.rateLimit }

  const session = await getSession()
  const id = nanoid()
  const token = publicToken()

  await db.insert(requests).values({
    id,
    publicToken: token,
    customerId: session?.user.id ?? null,
    contactName: data.contactName,
    contactPhone: phone,
    moduleSlug: module.slug,
    categorySlug: category.slug,
    packageSlug,
    regionId: region.id,
    description: data.description || null,
    details: details.data as Record<string, string | number | boolean>,
    preferredDate: data.preferredDate ?? null,
    preferredTime: data.preferredTime,
    recurring: data.recurring,
  })

  const subjectType = session ? 'user' : 'request'
  const subjectId = session?.user.id ?? id
  await db.insert(consents).values([
    { subjectType, subjectId, type: 'kvkk_aydinlatma', version: CONSENT_VERSION, granted: true },
    { subjectType, subjectId, type: 'ticari_ileti', version: CONSENT_VERSION, granted: data.marketingConsent },
  ])

  const matching = await db
    .selectDistinct({ userId: providerProfiles.userId })
    .from(providerProfiles)
    .innerJoin(providerServices, eq(providerServices.providerId, providerProfiles.id))
    .innerJoin(providerRegions, eq(providerRegions.providerId, providerProfiles.id))
    .where(
      and(
        eq(providerProfiles.verificationStatus, 'approved'),
        eq(providerServices.categorySlug, category.slug),
        eq(providerRegions.regionId, region.id),
        sql`${providerProfiles.userId} IS NOT NULL`,
      ),
    )
  if (matching.length > 0) {
    await db.insert(notifications).values(
      matching.map((m) => ({
        userId: m.userId!,
        type: 'new_request',
        title: `${region.name}: yeni ${category.name.toLocaleLowerCase('tr-TR')} talebi`,
        href: `/veren/talep/${id}`,
      })),
    )
  }

  return { ok: true, data: { token } }
}

async function requestByToken(token: string) {
  if (!/^[a-z0-9]{21}$/.test(token)) return null
  const [row] = await db.select().from(requests).where(eq(requests.publicToken, token)).limit(1)
  return row ?? null
}

export async function acceptOffer(token: string, offerId: string): Promise<ActionResult> {
  const request = await requestByToken(token)
  if (!request) return { ok: false, error: 'Talep bulunamadı.' }
  if (request.status !== 'open') return { ok: false, error: 'Bu talep için zaten bir ekip seçildi.' }

  const [offer] = await db
    .select()
    .from(offers)
    .where(and(eq(offers.id, offerId), eq(offers.requestId, request.id), eq(offers.status, 'pending')))
    .limit(1)
  if (!offer) return { ok: false, error: 'Teklif artık geçerli değil.' }

  await db.transaction(async (tx) => {
    await tx.update(offers).set({ status: 'accepted' }).where(eq(offers.id, offer.id))
    await tx
      .update(offers)
      .set({ status: 'rejected' })
      .where(and(eq(offers.requestId, request.id), ne(offers.id, offer.id), eq(offers.status, 'pending')))
    await tx
      .update(requests)
      .set({ status: 'matched', acceptedOfferId: offer.id, updatedAt: new Date() })
      .where(eq(requests.id, request.id))
  })

  await notifyProviderUsers([offer.providerId], {
    type: 'offer_accepted',
    title: `${request.contactName.split(' ')[0]} teklifini kabul etti`,
    href: `/veren/talep/${request.id}`,
  })

  revalidatePath(`/talep/${token}`)
  return { ok: true }
}

export async function completeRequest(token: string): Promise<ActionResult> {
  const request = await requestByToken(token)
  if (!request) return { ok: false, error: 'Talep bulunamadı.' }
  if (request.status !== 'matched' || !request.acceptedOfferId) {
    return { ok: false, error: 'Önce bir teklif kabul edilmeli.' }
  }
  await markCompleted(request.id, request.acceptedOfferId)
  revalidatePath(`/talep/${token}`)
  return { ok: true }
}

export async function cancelRequest(token: string): Promise<ActionResult> {
  const request = await requestByToken(token)
  if (!request) return { ok: false, error: 'Talep bulunamadı.' }
  if (request.status !== 'open' && request.status !== 'matched') {
    return { ok: false, error: 'Bu talep artık iptal edilemez.' }
  }
  await db
    .update(requests)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(requests.id, request.id))
  await db
    .update(offers)
    .set({ status: 'rejected' })
    .where(and(eq(offers.requestId, request.id), inArray(offers.status, ['pending', 'accepted'])))
  revalidatePath(`/talep/${token}`)
  return { ok: true }
}

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(600).optional(),
})

export async function submitReview(
  token: string,
  input: z.input<typeof reviewSchema>,
): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: '1 ile 5 arasında bir puan seç.' }
  const request = await requestByToken(token)
  if (!request || request.status !== 'completed' || !request.acceptedOfferId) {
    return { ok: false, error: 'Yorum yalnızca tamamlanan işler için yapılabilir.' }
  }
  const [offer] = await db.select().from(offers).where(eq(offers.id, request.acceptedOfferId)).limit(1)
  if (!offer) return { ok: false, error: tr.errors.generic }

  const inserted = await db
    .insert(reviews)
    .values({
      id: nanoid(),
      requestId: request.id,
      providerId: offer.providerId,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    })
    .onConflictDoNothing({ target: reviews.requestId })
    .returning({ id: reviews.id })
  if (inserted.length === 0) return { ok: false, error: 'Bu iş için zaten yorum yaptın.' }

  await recomputeProviderRating(offer.providerId)
  revalidatePath(`/talep/${token}`)
  return { ok: true }
}

const messageSchema = z.string().trim().min(1).max(1000)

export async function sendCustomerMessage(
  token: string,
  providerId: string,
  body: string,
): Promise<ActionResult> {
  const text = messageSchema.safeParse(body)
  if (!text.success) return { ok: false, error: 'Mesaj boş olamaz.' }
  const request = await requestByToken(token)
  if (!request || request.status === 'cancelled') return { ok: false, error: 'Talep bulunamadı.' }

  const [offer] = await db
    .select({ id: offers.id })
    .from(offers)
    .where(and(eq(offers.requestId, request.id), eq(offers.providerId, providerId)))
    .limit(1)
  if (!offer) return { ok: false, error: 'Bu ekip talebine teklif vermemiş.' }

  await db.insert(messages).values({
    requestId: request.id,
    providerId,
    senderType: 'customer',
    senderId: request.customerId,
    body: text.data,
  })
  await notifyProviderUsers([providerId], {
    type: 'message',
    title: `${request.contactName.split(' ')[0]} sana mesaj yazdı`,
    href: `/veren/talep/${request.id}`,
  })
  revalidatePath(`/talep/${token}`)
  return { ok: true }
}

export async function claimRequest(token: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { ok: false, error: 'Önce giriş yap.' }
  const request = await requestByToken(token)
  if (!request) return { ok: false, error: 'Talep bulunamadı.' }
  if (request.customerId && request.customerId !== session.user.id) {
    return { ok: false, error: 'Bu talep başka bir hesaba bağlı.' }
  }
  await db.update(requests).set({ customerId: session.user.id }).where(eq(requests.id, request.id))
  revalidatePath(`/talep/${token}`)
  revalidatePath('/panel')
  return { ok: true }
}
