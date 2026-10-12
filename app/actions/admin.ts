'use server'

import { del } from '@vercel/blob'
import { and, eq, inArray, like } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  session as authSession,
  messages,
  notifications,
  offers,
  providerProfiles,
  providerRegions,
  providerServices,
  regions,
  requests,
  reviews,
  user,
  type VerificationChecklist,
} from '@/lib/db/schema'
import { DEMO_EMAIL_DOMAIN, isAdminEmail } from '@/lib/roles'
import { tr } from '@/lib/i18n/tr'
import { recomputeProviderRating } from '@/lib/ratings'
import { notifyUser } from '@/lib/request-lifecycle'
import { currentAdmin, currentStaff } from '@/lib/session'

type Result = { ok: true } | { ok: false; error: string }

const DENIED: Result = { ok: false, error: 'Bu işlem için yetkin yok.' }
const CHECKLIST_KEYS = ['kimlik', 'adres', 'referans', 'deneme_isi'] as const

export async function setProviderStatus(
  providerId: string,
  status: 'pending' | 'approved' | 'rejected',
): Promise<Result> {
  if (!(await currentStaff())) return DENIED
  if (!['pending', 'approved', 'rejected'].includes(status)) return { ok: false, error: tr.errors.generic }
  const [updated] = await db
    .update(providerProfiles)
    .set({ verificationStatus: status, updatedAt: new Date() })
    .where(eq(providerProfiles.id, providerId))
    .returning({ userId: providerProfiles.userId })
  if (status === 'approved') {
    await notifyUser(updated?.userId ?? null, {
      type: 'approved',
      title: 'Profilin onaylandı! Artık bölgendeki talepleri görebilirsin.',
      href: '/veren',
    })
  }
  revalidatePath('/admin/verenler')
  return { ok: true }
}

export async function setChecklistItem(
  providerId: string,
  key: (typeof CHECKLIST_KEYS)[number],
  value: boolean,
): Promise<Result> {
  if (!(await currentStaff())) return DENIED
  if (!CHECKLIST_KEYS.includes(key)) return { ok: false, error: tr.errors.generic }
  const [profile] = await db
    .select({ checklist: providerProfiles.verificationChecklist })
    .from(providerProfiles)
    .where(eq(providerProfiles.id, providerId))
    .limit(1)
  if (!profile) return { ok: false, error: 'Hizmet veren bulunamadı.' }
  const checklist: VerificationChecklist = { ...profile.checklist, [key]: value }
  const isVerified = CHECKLIST_KEYS.every((k) => checklist[k])
  await db
    .update(providerProfiles)
    .set({ verificationChecklist: checklist, isVerified, updatedAt: new Date() })
    .where(eq(providerProfiles.id, providerId))
  revalidatePath('/admin/verenler')
  return { ok: true }
}

const matchSchema = z.object({
  requestId: z.string().min(1),
  providerId: z.string().min(1),
  price: z.number().int().min(100).max(200000),
  message: z.string().trim().max(600).optional().default(''),
})

/** Records an offer on behalf of a provider (e.g. one agreed by phone). Shown to the customer as a Buyur match. */
export async function adminMatch(input: z.input<typeof matchSchema>): Promise<Result> {
  if (!(await currentStaff())) return DENIED
  const parsed = matchSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Ekip ve fiyatı kontrol et.' }
  const { requestId, providerId, price, message } = parsed.data

  const [request] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1)
  if (!request || request.status !== 'open') return { ok: false, error: 'Talep açık değil.' }
  const [provider] = await db
    .select({ id: providerProfiles.id, name: providerProfiles.displayName })
    .from(providerProfiles)
    .where(and(eq(providerProfiles.id, providerId), eq(providerProfiles.verificationStatus, 'approved')))
    .limit(1)
  if (!provider) return { ok: false, error: 'Hizmet veren onaylı değil.' }

  await db
    .insert(offers)
    .values({ id: nanoid(), requestId, providerId, price, message: message || null, source: 'admin_match' })
    .onConflictDoUpdate({
      target: [offers.requestId, offers.providerId],
      set: { price, message: message || null, status: 'pending', source: 'admin_match' },
    })
  await notifyUser(request.customerId, {
    type: 'new_offer',
    title: `Buyur senin için ${provider.name} ile eşleştirdi`,
    href: `/talep/${request.publicToken}`,
  })
  revalidatePath('/admin/talepler')
  revalidatePath(`/talep/${request.publicToken}`)
  return { ok: true }
}

export async function setReviewStatus(reviewId: string, status: 'published' | 'hidden'): Promise<Result> {
  if (!(await currentStaff())) return DENIED
  const [review] = await db
    .update(reviews)
    .set({ status: status === 'hidden' ? 'hidden' : 'published' })
    .where(eq(reviews.id, reviewId))
    .returning({ providerId: reviews.providerId })
  if (review) await recomputeProviderRating(review.providerId)
  revalidatePath('/admin/yorumlar')
  return { ok: true }
}

export async function setRegionActive(regionId: number, active: boolean): Promise<Result> {
  if (!(await currentAdmin())) return DENIED
  await db.update(regions).set({ active }).where(eq(regions.id, regionId))
  revalidatePath('/admin/bolgeler')
  return { ok: true }
}

const roleSchema = z.object({
  userId: z.string().min(1),
  staffRole: z.enum(['none', 'supervisor', 'admin']),
})

/** Grants or removes staff access. Non-staff users fall back to provider or customer based on their profile. */
export async function setUserRole(input: z.input<typeof roleSchema>): Promise<Result> {
  const session = await currentAdmin()
  if (!session) return DENIED
  const parsed = roleSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: tr.errors.generic }
  const { userId, staffRole } = parsed.data
  if (userId === session.user.id) return { ok: false, error: 'Kendi rolünü değiştiremezsin.' }

  const [target] = await db.select({ email: user.email }).from(user).where(eq(user.id, userId)).limit(1)
  if (!target) return { ok: false, error: 'Kullanıcı bulunamadı.' }
  if (isAdminEmail(target.email) && staffRole !== 'admin') {
    return { ok: false, error: 'Bu hesap ADMIN_EMAILS ile yönetici; rolü buradan düşürülemez.' }
  }

  let role: string = staffRole
  if (staffRole === 'none') {
    const [profile] = await db
      .select({ id: providerProfiles.id })
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, userId))
      .limit(1)
    role = profile ? 'provider' : 'customer'
  }
  await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, userId))
  // Ending existing sessions makes the new permissions apply immediately.
  await db.delete(authSession).where(eq(authSession.userId, userId))
  revalidatePath('/admin/kullanicilar')
  return { ok: true }
}

/** Removes every seeded demo provider together with the offers, reviews and messages tied to them. */
export async function deleteDemoData(): Promise<Result> {
  const session = await currentAdmin()
  if (!session) return DENIED
  const demo = await db
    .select({ id: providerProfiles.id, avatar: providerProfiles.avatarPathname })
    .from(providerProfiles)
    .where(eq(providerProfiles.isDemo, true))
  const demoRequests = await db.select({ id: requests.id }).from(requests).where(eq(requests.isDemo, true))
  const ids = demo.map((d) => d.id)
  const requestIds = demoRequests.map((r) => r.id)

  await db.transaction(async (tx) => {
    if (ids.length > 0) {
      await tx.delete(reviews).where(inArray(reviews.providerId, ids))
      await tx.delete(messages).where(inArray(messages.providerId, ids))
      await tx.delete(offers).where(inArray(offers.providerId, ids))
      await tx.delete(providerServices).where(inArray(providerServices.providerId, ids))
      await tx.delete(providerRegions).where(inArray(providerRegions.providerId, ids))
      await tx.delete(providerProfiles).where(inArray(providerProfiles.id, ids))
    }
    if (requestIds.length > 0) {
      await tx.delete(reviews).where(inArray(reviews.requestId, requestIds))
      await tx.delete(messages).where(inArray(messages.requestId, requestIds))
      await tx.delete(offers).where(inArray(offers.requestId, requestIds))
      await tx.delete(requests).where(inArray(requests.id, requestIds))
    }
    // Sessions and accounts cascade with the user row.
    const demoUsers = await tx
      .select({ id: user.id })
      .from(user)
      .where(like(user.email, `%@${DEMO_EMAIL_DOMAIN}`))
    const demoUserIds = demoUsers.map((u) => u.id).filter((id) => id !== session.user.id)
    if (demoUserIds.length > 0) {
      await tx.delete(notifications).where(inArray(notifications.userId, demoUserIds))
      await tx.delete(user).where(inArray(user.id, demoUserIds))
    }
  })
  const avatars = demo.flatMap((d) => (d.avatar ? [d.avatar] : []))
  if (avatars.length > 0) await del(avatars).catch(() => undefined)

  revalidatePath('/admin', 'layout')
  revalidatePath('/', 'layout')
  return { ok: true }
}
