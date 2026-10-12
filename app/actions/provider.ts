'use server'

import { and, eq, inArray, ne } from 'drizzle-orm'
import { nanoid } from 'nanoid'
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
  user,
} from '@/lib/db/schema'
import { normalizePhone, slugify } from '@/lib/format'
import { CONSENT_VERSION, tr } from '@/lib/i18n/tr'
import { activeCategoryPairs } from '@/lib/modules'
import { providerCanSeeRequest, providerServesRequest } from '@/lib/provider-access'
import { markCompleted, notifyUser } from '@/lib/request-lifecycle'
import { isAdmin } from '@/lib/roles'
import { currentApprovedProvider, getProviderForUser, getSession } from '@/lib/session'

type Result = { ok: true } | { ok: false; error: string }

const profileSchema = z
  .object({
    displayName: z.string().trim().min(3, 'Ekip adı en az 3 karakter olmalı').max(60),
    bio: z.string().trim().max(600).optional().default(''),
    phone: z.string().trim(),
    whatsapp: z.string().trim().optional().default(''),
    services: z
      .array(
        z.object({
          categorySlug: z.string(),
          priceMin: z.number().int().min(100).max(200000).nullable(),
          priceMax: z.number().int().min(100).max(200000).nullable(),
        }),
      )
      .min(1, 'En az bir hizmet seç'),
    regionIds: z.array(z.number().int().positive()).min(1, 'En az bir mahalle seç'),
    termsAccepted: z.literal(true, { error: 'Hizmet veren koşullarını onaylaman gerekiyor' }),
  })
  .refine((d) => d.services.every((s) => !s.priceMin || !s.priceMax || s.priceMin <= s.priceMax), {
    message: 'Fiyat bandında alt sınır üst sınırdan büyük olamaz',
  })

export type ProviderProfileInput = z.input<typeof profileSchema>

export async function saveProviderProfile(input: ProviderProfileInput): Promise<Result> {
  const session = await getSession()
  if (!session) return { ok: false, error: 'Önce giriş yap.' }

  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? tr.errors.generic }
  const data = parsed.data

  const phone = normalizePhone(data.phone)
  if (!phone) return { ok: false, error: 'Telefon numarası 05xx ile başlamalı.' }
  const whatsapp = data.whatsapp ? normalizePhone(data.whatsapp) : phone
  if (!whatsapp) return { ok: false, error: 'WhatsApp numarası geçersiz.' }

  const pairs = activeCategoryPairs()
  const services = data.services.flatMap((s) => {
    const pair = pairs.find((p) => p.category.slug === s.categorySlug)
    return pair ? [{ ...s, moduleSlug: pair.module.slug }] : []
  })
  if (services.length === 0) return { ok: false, error: 'En az bir hizmet seç.' }

  const validRegions = await db
    .select({ id: regions.id })
    .from(regions)
    .where(and(inArray(regions.id, data.regionIds), eq(regions.active, true)))
  if (validRegions.length === 0) return { ok: false, error: 'En az bir mahalle seç.' }

  const existing = await getProviderForUser(session.user.id)
  const providerId = existing?.id ?? nanoid()

  let slug = existing?.slug
  if (!slug) {
    const base = slugify(data.displayName) || 'ekip'
    slug = base
    for (let i = 2; i < 50; i++) {
      const [taken] = await db
        .select({ id: providerProfiles.id })
        .from(providerProfiles)
        .where(eq(providerProfiles.slug, slug))
        .limit(1)
      if (!taken) break
      slug = `${base}-${i}`
    }
  }

  await db.transaction(async (tx) => {
    if (existing) {
      await tx
        .update(providerProfiles)
        .set({ displayName: data.displayName, bio: data.bio || null, phone, whatsapp, updatedAt: new Date() })
        .where(eq(providerProfiles.id, providerId))
    } else {
      await tx.insert(providerProfiles).values({
        id: providerId,
        userId: session.user.id,
        slug: slug!,
        displayName: data.displayName,
        bio: data.bio || null,
        phone,
        whatsapp,
      })
      if (!isAdmin(session.user)) {
        await tx.update(user).set({ role: 'provider' }).where(eq(user.id, session.user.id))
      }
      await tx.insert(consents).values({
        subjectType: 'user',
        subjectId: session.user.id,
        type: 'hizmet_veren_kosullari',
        version: CONSENT_VERSION,
        granted: true,
      })
    }
    await tx.delete(providerServices).where(eq(providerServices.providerId, providerId))
    await tx.insert(providerServices).values(
      services.map((s) => ({
        providerId,
        moduleSlug: s.moduleSlug,
        categorySlug: s.categorySlug,
        priceMin: s.priceMin,
        priceMax: s.priceMax,
      })),
    )
    await tx.delete(providerRegions).where(eq(providerRegions.providerId, providerId))
    await tx.insert(providerRegions).values(validRegions.map((r) => ({ providerId, regionId: r.id })))
  })

  revalidatePath('/veren')
  revalidatePath(`/p/${slug}`)
  return { ok: true }
}

const offerSchema = z.object({
  price: z.number().int().min(100, 'Fiyat en az 100 TL olmalı').max(200000),
  message: z.string().trim().max(600).optional().default(''),
})

export async function submitOffer(
  requestId: string,
  input: z.input<typeof offerSchema>,
): Promise<Result> {
  const current = await currentApprovedProvider()
  if (!current) return { ok: false, error: 'Teklif verebilmek için profilinin onaylanması gerekiyor.' }
  const parsed = offerSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? tr.errors.generic }

  const [request] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1)
  if (!request || request.status !== 'open') return { ok: false, error: 'Bu talep artık teklif almıyor.' }
  if (!(await providerServesRequest(current.provider.id, request))) {
    return { ok: false, error: 'Bu talep senin hizmet bölgende değil.' }
  }

  const [existing] = await db
    .select()
    .from(offers)
    .where(and(eq(offers.requestId, requestId), eq(offers.providerId, current.provider.id)))
    .limit(1)

  if (existing) {
    if (existing.status === 'accepted' || existing.status === 'rejected') {
      return { ok: false, error: 'Bu teklif artık güncellenemez.' }
    }
    await db
      .update(offers)
      .set({ price: parsed.data.price, message: parsed.data.message || null, status: 'pending' })
      .where(eq(offers.id, existing.id))
  } else {
    await db.insert(offers).values({
      id: nanoid(),
      requestId,
      providerId: current.provider.id,
      price: parsed.data.price,
      message: parsed.data.message || null,
    })
  }

  await notifyUser(request.customerId, {
    type: 'new_offer',
    title: `${current.provider.displayName} teklif verdi`,
    href: `/talep/${request.publicToken}`,
  })
  revalidatePath(`/veren/talep/${requestId}`)
  revalidatePath(`/talep/${request.publicToken}`)
  return { ok: true }
}

export async function withdrawOffer(requestId: string): Promise<Result> {
  const current = await currentApprovedProvider()
  if (!current) return { ok: false, error: tr.errors.generic }
  await db
    .update(offers)
    .set({ status: 'withdrawn' })
    .where(
      and(
        eq(offers.requestId, requestId),
        eq(offers.providerId, current.provider.id),
        eq(offers.status, 'pending'),
      ),
    )
  revalidatePath(`/veren/talep/${requestId}`)
  return { ok: true }
}

export async function sendProviderMessage(requestId: string, body: string): Promise<Result> {
  const current = await currentApprovedProvider()
  if (!current) return { ok: false, error: tr.errors.generic }
  const text = z.string().trim().min(1).max(1000).safeParse(body)
  if (!text.success) return { ok: false, error: 'Mesaj boş olamaz.' }

  const [request] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1)
  if (!request || request.status === 'cancelled') return { ok: false, error: 'Talep bulunamadı.' }
  const [offer] = await db
    .select({ id: offers.id, status: offers.status })
    .from(offers)
    .where(and(eq(offers.requestId, requestId), eq(offers.providerId, current.provider.id)))
    .limit(1)
  if (!offer || offer.status === 'withdrawn') {
    return { ok: false, error: 'Mesaj yazmak için önce teklif ver.' }
  }

  await db.insert(messages).values({
    requestId,
    providerId: current.provider.id,
    senderType: 'provider',
    senderId: current.session.user.id,
    body: text.data,
  })
  await notifyUser(request.customerId, {
    type: 'message',
    title: `${current.provider.displayName} mesaj yazdı`,
    href: `/talep/${request.publicToken}`,
  })
  revalidatePath(`/veren/talep/${requestId}`)
  revalidatePath(`/talep/${request.publicToken}`)
  return { ok: true }
}

export async function providerCompleteRequest(requestId: string): Promise<Result> {
  const current = await currentApprovedProvider()
  if (!current) return { ok: false, error: tr.errors.generic }
  const [request] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1)
  if (!request || request.status !== 'matched' || !request.acceptedOfferId) {
    return { ok: false, error: 'Talep tamamlanmaya hazır değil.' }
  }
  const [offer] = await db.select().from(offers).where(eq(offers.id, request.acceptedOfferId)).limit(1)
  if (offer?.providerId !== current.provider.id) return { ok: false, error: 'Bu iş sana ait değil.' }
  if (!(await providerCanSeeRequest(current.provider.id, request))) return { ok: false, error: tr.errors.generic }

  await markCompleted(request.id, request.acceptedOfferId)
  revalidatePath(`/veren/talep/${requestId}`)
  revalidatePath('/veren')
  return { ok: true }
}

export async function markNotificationsRead(): Promise<Result> {
  const session = await getSession()
  if (!session) return { ok: false, error: tr.errors.generic }
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, session.user.id), ne(notifications.read, true)))
  revalidatePath('/veren')
  return { ok: true }
}
