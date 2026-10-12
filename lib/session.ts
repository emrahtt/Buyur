import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { providerProfiles } from '@/lib/db/schema'
import { isAdmin, isStaff } from '@/lib/roles'

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export async function requireUser(next: string) {
  const session = await getSession()
  if (!session?.user) redirect(`/giris?next=${encodeURIComponent(next)}`)
  return session
}

export async function requireAdmin() {
  const session = await requireUser('/admin')
  if (!isAdmin(session.user)) redirect(isStaff(session.user) ? '/admin' : '/')
  return session
}

/** Admins and supervisors. */
export async function requireStaff(next = '/admin') {
  const session = await requireUser(next)
  if (!isStaff(session.user)) redirect('/')
  return session
}

export async function currentStaff() {
  const session = await getSession()
  if (!session?.user || !isStaff(session.user)) return null
  return session
}

export const getProviderForUser = cache(async (userId: string) => {
  const [profile] = await db
    .select()
    .from(providerProfiles)
    .where(eq(providerProfiles.userId, userId))
    .limit(1)
  return profile ?? null
})

/** For pages under /veren: a signed-in user who has completed onboarding. */
export async function requireProvider(next = '/veren') {
  const session = await requireUser(next)
  const provider = await getProviderForUser(session.user.id)
  if (!provider) redirect('/veren/kayit')
  return { session, provider }
}

/** For server actions: returns null instead of redirecting. */
export async function currentAdmin() {
  const session = await getSession()
  if (!session?.user || !isAdmin(session.user)) return null
  return session
}

export async function currentApprovedProvider() {
  const session = await getSession()
  if (!session?.user) return null
  const provider = await getProviderForUser(session.user.id)
  if (!provider || provider.verificationStatus !== 'approved') return null
  return { session, provider }
}
