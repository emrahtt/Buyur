import { count, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { putPrivateImage, validateImage } from '@/lib/blob'
import { db } from '@/lib/db'
import { requestPhotos, requests } from '@/lib/db/schema'

const MAX_PHOTOS = 4

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!/^[a-z0-9]{21}$/.test(token)) return NextResponse.json({ error: 'Talep bulunamadı.' }, { status: 404 })

  const [row] = await db
    .select({ id: requests.id, status: requests.status })
    .from(requests)
    .where(eq(requests.publicToken, token))
    .limit(1)
  if (!row) return NextResponse.json({ error: 'Talep bulunamadı.' }, { status: 404 })
  if (row.status !== 'open') {
    return NextResponse.json({ error: 'Fotoğraf yalnızca açık taleplere eklenebilir.' }, { status: 409 })
  }

  const [{ existing }] = await db
    .select({ existing: count() })
    .from(requestPhotos)
    .where(eq(requestPhotos.requestId, row.id))
  if (existing >= MAX_PHOTOS) {
    return NextResponse.json({ error: `En fazla ${MAX_PHOTOS} fotoğraf ekleyebilirsin.` }, { status: 409 })
  }

  const formData = await request.formData()
  const checked = validateImage(formData.get('file'))
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 })

  try {
    const pathname = await putPrivateImage(`talep/${row.id}`, checked.file, checked.ext)
    const [photo] = await db
      .insert(requestPhotos)
      .values({ requestId: row.id, pathname })
      .returning({ id: requestPhotos.id })
    return NextResponse.json({ id: photo.id })
  } catch (error) {
    console.error('[upload] request photo failed', error)
    return NextResponse.json({ error: 'Fotoğraf yüklenemedi.' }, { status: 500 })
  }
}
