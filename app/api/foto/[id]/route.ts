import { and, eq } from 'drizzle-orm'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { streamPrivateBlob } from '@/lib/blob'
import { db } from '@/lib/db'
import { requestPhotos, requests } from '@/lib/db/schema'
import { providerCanSeeRequest } from '@/lib/provider-access'
import { currentAdmin, currentApprovedProvider } from '@/lib/session'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const photoId = Number(id)
  if (!Number.isInteger(photoId)) return new NextResponse('Not found', { status: 404 })

  const [row] = await db
    .select({ pathname: requestPhotos.pathname, request: requests })
    .from(requestPhotos)
    .innerJoin(requests, eq(requests.id, requestPhotos.requestId))
    .where(and(eq(requestPhotos.id, photoId)))
    .limit(1)
  if (!row) return new NextResponse('Not found', { status: 404 })

  const token = request.nextUrl.searchParams.get('t')
  let allowed = token !== null && token === row.request.publicToken
  if (!allowed) allowed = Boolean(await currentAdmin())
  if (!allowed) {
    const provider = await currentApprovedProvider()
    allowed = Boolean(provider && (await providerCanSeeRequest(provider.provider.id, row.request)))
  }
  if (!allowed) return new NextResponse('Forbidden', { status: 403 })

  return streamPrivateBlob(row.pathname, request)
}
