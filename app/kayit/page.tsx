import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthShell } from '@/components/auth/auth-shell'
import { safeNext } from '@/lib/safe-next'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Hesap aç', robots: { index: false } }

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; rol?: string }>
}) {
  const { next, rol } = await searchParams
  const asProvider = rol === 'veren'
  const target = asProvider ? '/veren/kayit' : safeNext(next)
  if (await getSession()) redirect(target)

  return (
    <AuthShell
      title={asProvider ? 'Ekibini kaydet' : 'Hesap aç'}
      subtitle={
        asProvider
          ? 'Önce hesabını aç, sonra hizmetlerini ve bölgelerini seçelim. Profilin onaylanınca yayına çıkar.'
          : 'Taleplerini tek yerde topla, geçmiş işlerini sakla. Talep açmak için hesap şart değil.'
      }
    >
      <AuthForm mode="sign-up" next={target} asProvider={asProvider} />
    </AuthShell>
  )
}
