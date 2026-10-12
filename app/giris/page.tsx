import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthShell } from '@/components/auth/auth-shell'
import { safeNext } from '@/lib/safe-next'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Giriş yap', robots: { index: false } }

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  const target = safeNext(next)
  if (await getSession()) redirect(target)

  return (
    <AuthShell title="Tekrar hoş geldin" subtitle="Taleplerini, tekliflerini ve mesajlarını görmek için giriş yap.">
      <AuthForm mode="sign-in" next={target} />
    </AuthShell>
  )
}
