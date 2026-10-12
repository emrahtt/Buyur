import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { streamPrivateBlob } from '@/lib/blob'
import { db } from '@/lib/db'
import { providerProfiles } from '@/lib/db/schema'
import { currentAdmin, getSession } from '@/lib/session'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [profile] = await db
    .select({
      userId: providerProfiles.userId,
      avatar: providerProfiles.avatarPathname,
      status: providerProfiles.verificationStatus,
    })
    .from(providerProfiles)
    .where(eq(providerProfiles.slug, slug))
    .limit(1)
  if (!profile?.avatar) return new NextResponse('Not found', { status: 404 })

  if (profile.status !== 'approved') {
    const session = await getSession()
    const isOwner = session?.user.id && session.user.id === profile.userId
    if (!isOwner && !(await currentAdmin())) return new NextResponse('Not found', { status: 404 })
  }
  return streamPrivateBlob(profile.avatar, request)
}
