'use server'

import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { waitlist } from '@/lib/db/schema'
import { normalizePhone } from '@/lib/format'
import { UPCOMING_MODULES } from '@/lib/modules'

export type WaitlistState = { ok: boolean; message: string } | null

const schema = z.object({
  moduleSlug: z.enum(UPCOMING_MODULES.map((m) => m.slug) as [string, ...string[]]),
  contact: z.string().trim().min(5).max(120),
  regionId: z.coerce.number().int().positive().optional(),
  website: z.string().max(0).optional(),
})

export async function joinWaitlist(_prev: WaitlistState, formData: FormData): Promise<WaitlistState> {
  const parsed = schema.safeParse({
    moduleSlug: formData.get('moduleSlug'),
    contact: formData.get('contact'),
    regionId: formData.get('regionId') || undefined,
    website: formData.get('website') ?? '',
  })
  if (!parsed.success) return { ok: false, message: 'Telefon ya da e-posta adresini kontrol et.' }

  const raw = parsed.data.contact
  const isEmail = z.email().safeParse(raw).success
  const contact = isEmail ? raw.toLowerCase() : normalizePhone(raw)
  if (!contact) return { ok: false, message: 'Geçerli bir cep telefonu ya da e-posta gir.' }

  const [existing] = await db
    .select({ id: waitlist.id })
    .from(waitlist)
    .where(and(eq(waitlist.moduleSlug, parsed.data.moduleSlug), eq(waitlist.contact, contact)))
    .limit(1)

  if (!existing) {
    await db.insert(waitlist).values({
      moduleSlug: parsed.data.moduleSlug,
      contact,
      regionId: parsed.data.regionId ?? null,
    })
  }
  return { ok: true, message: 'Tamam! Açıldığı gün ilk sen duyacaksın.' }
}
