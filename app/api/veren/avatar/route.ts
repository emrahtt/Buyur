import { del } from '@vercel/blob'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { putPrivateImage, validateImage } from '@/lib/blob'
import { db } from '@/lib/db'
import { providerProfiles } from '@/lib/db/schema'
import { getProviderForUser, getSession } from '@/lib/session'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Giriş yapmalısın.' }, { status: 401 })
  const provider = await getProviderForUser(session.user.id)
  if (!provider) return NextResponse.json({ error: 'Önce profilini oluştur.' }, { status: 400 })

  const formData = await request.formData()
  const checked = validateImage(formData.get('file'))
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 })

  try {
    const pathname = await putPrivateImage(`avatar/${provider.id}`, checked.file, checked.ext)
    await db
      .update(providerProfiles)
      .set({ avatarPathname: pathname, updatedAt: new Date() })
      .where(eq(providerProfiles.id, provider.id))
    if (provider.avatarPathname) await del(provider.avatarPathname).catch(() => undefined)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[upload] avatar failed', error)
    return NextResponse.json({ error: 'Fotoğraf yüklenemedi.' }, { status: 500 })
  }
}
